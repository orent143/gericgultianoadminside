<template>
    <div>
        <div class="page-header">
            <div>
                <h1>Skills</h1>
                <p>Manage your tools and technologies</p>
            </div>
            <Button label="Add Skill" icon="pi pi-plus" @click="openCreate" />
        </div>

        <div class="card">
            <DataTable :value="skills" :loading="loading" stripedRows>
                <Column field="name" header="Name" sortable />
                <Column field="category" header="Category" sortable>
                    <template #body="{ data }">
                        <Tag v-if="data.category" :value="data.category" />
                        <span v-else style="color: #94a3b8;">—</span>
                    </template>
                </Column>
                <Column field="status" header="Status" sortable>
                    <template #body="{ data }">
                        <Tag v-if="data.status" :value="data.status === 'learning' ? 'Learning' : (data.status === 'learned' ? 'Learned' : data.status)" :severity="data.status === 'learning' ? 'warning' : 'success'" />
                        <span v-else style="color: #94a3b8;">—</span>
                    </template>
                </Column>
                <Column field="icon_url" header="Icon">
                    <template #body="{ data }">
                        <img v-if="data.icon_url" :src="data.icon_url" :alt="data.name"
                            style="width: 28px; height: 28px; object-fit: contain;" />
                        <span v-else style="color: #94a3b8;">—</span>
                    </template>
                </Column>
                <Column header="Actions" style="width: 140px">
                    <template #body="{ data }">
                        <div style="display: flex; gap: 8px;">
                            <Button icon="pi pi-pencil" severity="info" text rounded @click="openEdit(data)" />
                            <Button icon="pi pi-trash" severity="danger" text rounded @click="confirmDelete(data)" />
                        </div>
                    </template>
                </Column>
            </DataTable>
        </div>

        <AppDrawer v-model="drawerVisible" :header="isEditing ? 'Edit Skill' : 'New Skill'" :loading="saving"
            @submit="save">
            <div class="form-field">
                <label>Name</label>
                <InputText v-model="form.name" fluid />
            </div>
            <div class="form-field">
                <label>Category</label>
                <InputText v-model="form.category" placeholder="e.g. Frontend, Backend, Tools" fluid />
            </div>
            <div class="form-field">
                <label>Status</label>
                <Dropdown v-model="form.status" :options="statusOptions" optionLabel="label" optionValue="value"
                    placeholder="Select status" />
            </div>
            <div class="form-field">
                <label>Icon</label>
                <FileUpload
                    mode="basic"
                    accept="image/*"
                    :maxFileSize="2000000"
                    chooseLabel="Choose Icon"
                    @select="onIconSelect"
                    :auto="false"
                    ref="fileUploadRef"
                />
                <small v-if="form.icon_url" style="color: #64748b; margin-top: 8px; display: block;">Current: {{ form.icon_url.substring(form.icon_url.lastIndexOf('/') + 1) }}</small>
            </div>
        </AppDrawer>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import FileUpload from 'primevue/fileupload'
import Tag from 'primevue/tag'
import AppDrawer from '@/components/Drawer.vue'
import Dropdown from 'primevue/dropdown'

const toast = useToast()
const confirm = useConfirm()

const skills = ref([])
const loading = ref(false)
const drawerVisible = ref(false)
const isEditing = ref(false)
const saving = ref(false)
const editingId = ref(null)
const form = ref({ name: '', category: '', icon_url: '', status: '' })

const selectedIconFile = ref(null)
const fileUploadRef = ref(null)

const statusOptions = [
    { label: 'Learning', value: 'learning' },
    { label: 'Learned', value: 'learned' },
]

const fetchSkills = async () => {
    loading.value = true
    const { data } = await supabase.from('skills').select('*').order('created_at', { ascending: false })
    skills.value = data || []
    loading.value = false
}

const openCreate = () => {
    isEditing.value = false
    form.value = { name: '', category: '', icon_url: '', status: '' }
    editingId.value = null
    selectedIconFile.value = null
    if (fileUploadRef.value) fileUploadRef.value.clear()
    drawerVisible.value = true
}

const openEdit = (row) => {
    isEditing.value = true
    form.value = { name: row.name, category: row.category, icon_url: row.icon_url, status: row.status || '' }
    editingId.value = row.id
    selectedIconFile.value = null
    if (fileUploadRef.value) fileUploadRef.value.clear()
    drawerVisible.value = true
}

const onIconSelect = (event) => {
    selectedIconFile.value = event.files[0]
}

async function uploadIcon(file) {
    const fileName = `${Date.now()}-${file.name}`

    const { data, error } = await supabase.storage
        .from('portfolio_images')
        .upload(fileName, file)

    if (error) {
        console.error(error)
        return null
    }

    const { data: publicUrlData } = supabase.storage
        .from('portfolio_images')
        .getPublicUrl(fileName)

    return publicUrlData.publicUrl
}

const save = async () => {
    saving.value = true

    // Upload icon if a new file was selected
    let iconUrl = form.value.icon_url
    if (selectedIconFile.value) {
        iconUrl = await uploadIcon(selectedIconFile.value)
        if (!iconUrl) {
            toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to upload icon', life: 3000 })
            saving.value = false
            return
        }
    }

    const payload = { name: form.value.name, category: form.value.category, icon_url: iconUrl, status: form.value.status }
    const { error } = isEditing.value
        ? await supabase.from('skills').update(payload).eq('id', editingId.value)
        : await supabase.from('skills').insert(payload)
    saving.value = false
    if (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: error.message, life: 3000 })
    } else {
        toast.add({ severity: 'success', summary: 'Success', detail: isEditing.value ? 'Skill updated' : 'Skill created', life: 3000 })
        drawerVisible.value = false
        selectedIconFile.value = null
        if (fileUploadRef.value) fileUploadRef.value.clear()
        fetchSkills()
    }
}

const confirmDelete = (row) => {
    confirm.require({
        message: `Delete "${row.name}"?`,
        header: 'Confirm Delete',
        icon: 'pi pi-exclamation-triangle',
        acceptClass: 'p-button-danger',
        accept: async () => {
            const { error } = await supabase.from('skills').delete().eq('id', row.id)
            if (error) {
                toast.add({ severity: 'error', summary: 'Error', detail: error.message, life: 3000 })
            } else {
                toast.add({ severity: 'success', summary: 'Deleted', detail: 'Skill removed', life: 3000 })
                fetchSkills()
            }
        },
    })
}

onMounted(fetchSkills)
</script>
