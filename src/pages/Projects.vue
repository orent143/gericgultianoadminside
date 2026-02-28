<template>
  <div>
    <div class="page-header">
      <div>
        <h1>Projects</h1>
        <p>Manage your portfolio projects</p>
      </div>
      <Button label="Add Project" icon="pi pi-plus" @click="openCreate" />
    </div>

    <div class="card">
      <DataTable :value="projects" :loading="loading" stripedRows>
        <Column field="title" header="Title" sortable />
        <Column field="description" header="Description" sortable>
          <template #body="{ data }">
            <span>{{ data.description?.substring(0, 80) }}{{ data.description?.length > 80 ? '...' : '' }}</span>
          </template>
        </Column>
        <Column field="tech_stack" header="Tech Stack">
          <template #body="{ data }">
            <div style="display: flex; gap: 4px; flex-wrap: wrap;">
              <Tag v-for="tech in (data.tech_stack || [])" :key="tech" :value="tech" severity="info" />
            </div>
          </template>
        </Column>
        <Column field="live_url" header="Live URL">
          <template #body="{ data }">
            <a v-if="data.live_url" :href="data.live_url" target="_blank" rel="noopener" style="color: #3b82f6;">
              <i class="pi pi-external-link" />
            </a>
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

    <AppDrawer v-model="drawerVisible" :header="isEditing ? 'Edit Project' : 'New Project'" :loading="saving" @submit="save">
      <div class="form-field">
        <label>Title</label>
        <InputText v-model="form.title" fluid />
      </div>
      <div class="form-field">
        <label>Description</label>
        <Textarea v-model="form.description" rows="3" autoResize fluid />
      </div>
      <div class="form-field">
        <label>Project Image</label>
        <FileUpload
          mode="basic"
          accept="image/*"
          :maxFileSize="5000000"
          chooseLabel="Choose Image"
          @select="onImageSelect"
          :auto="false"
          ref="projectFileUploadRef"
        />
        <small v-if="form.image_url" style="color: #64748b; margin-top: 8px; display: block;">Current: {{ form.image_url.substring(form.image_url.lastIndexOf('/') + 1) }}</small>
      </div>
      <div class="form-field">
        <label>Live URL</label>
        <InputText v-model="form.live_url" placeholder="https://..." fluid />
      </div>
      <div class="form-field">
        <label>Tech Stack (comma separated)</label>
        <InputText v-model="techStackInput" placeholder="Vue.js, Node.js, Supabase" fluid />
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
import Textarea from 'primevue/textarea'
import FileUpload from 'primevue/fileupload'
import Tag from 'primevue/tag'
import AppDrawer from '@/components/Drawer.vue'

const toast = useToast()
const confirm = useConfirm()

const projects = ref([])
const loading = ref(false)
const drawerVisible = ref(false)
const isEditing = ref(false)
const saving = ref(false)
const editingId = ref(null)
const form = ref({ title: '', description: '', image_url: '', live_url: '' })
const selectedProjectImage = ref(null)
const projectFileUploadRef = ref(null)

const onImageSelect = (event) => {
  selectedProjectImage.value = event.files[0]
}

async function uploadProjectImage(file) {
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
const techStackInput = ref('')

const fetchProjects = async () => {
  loading.value = true
  const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false })
  projects.value = data || []
  loading.value = false
}

const openCreate = () => {
  isEditing.value = false
  form.value = { title: '', description: '', image_url: '', live_url: '' }
  techStackInput.value = ''
  editingId.value = null
  selectedProjectImage.value = null
  if (projectFileUploadRef.value) projectFileUploadRef.value.clear()
  drawerVisible.value = true
}

const openEdit = (row) => {
  isEditing.value = true
  form.value = {
    title: row.title,
    description: row.description,
    image_url: row.image_url,
    live_url: row.live_url,
  }
  techStackInput.value = (row.tech_stack || []).join(', ')
  editingId.value = row.id
  selectedProjectImage.value = null
  if (projectFileUploadRef.value) projectFileUploadRef.value.clear()
  drawerVisible.value = true
}

const save = async () => {
  saving.value = true

  // Upload image if a new file was selected
  let imageUrl = form.value.image_url
  if (selectedProjectImage.value) {
    imageUrl = await uploadProjectImage(selectedProjectImage.value)
    if (!imageUrl) {
      toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to upload image', life: 3000 })
      saving.value = false
      return
    }
  }

  const payload = {
    title: form.value.title,
    description: form.value.description,
    image_url: imageUrl,
    live_url: form.value.live_url,
    tech_stack: techStackInput.value.split(',').map(s => s.trim()).filter(Boolean),
  }
  const { error } = isEditing.value
    ? await supabase.from('projects').update(payload).eq('id', editingId.value)
    : await supabase.from('projects').insert(payload)

  saving.value = false
  if (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: error.message, life: 3000 })
  } else {
    toast.add({ severity: 'success', summary: 'Success', detail: isEditing.value ? 'Project updated' : 'Project created', life: 3000 })
    drawerVisible.value = false
    selectedProjectImage.value = null
    if (projectFileUploadRef.value) projectFileUploadRef.value.clear()
    fetchProjects()
  }
}

const confirmDelete = (row) => {
  confirm.require({
    message: `Delete "${row.title}"?`,
    header: 'Confirm Delete',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      const { error } = await supabase.from('projects').delete().eq('id', row.id)
      if (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: error.message, life: 3000 })
      } else {
        toast.add({ severity: 'success', summary: 'Deleted', detail: 'Project removed', life: 3000 })
        fetchProjects()
      }
    },
  })
}

onMounted(fetchProjects)
</script>