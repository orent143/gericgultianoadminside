<template>
  <div>
    <!-- Home Content Section -->
    <div class="page-header">
      <div>
        <h1>Dashboard</h1>
        <p>Manage your portfolio home content and experiences</p>
      </div>
    </div>

    <!-- Home Content Card -->
    <div class="card" style="margin-bottom: 32px;">
      <h3 style="margin-bottom: 16px; font-size: 16px; font-weight: 600; color: #0f172a;">Home Content</h3>
      <div class="drawer-form">
        <div class="form-field">
          <label>About Me</label>
          <Textarea v-model="homeContent.about_me" rows="4" autoResize />
        </div>
        <div class="form-field">
          <label>Experience Intro</label>
          <Textarea v-model="homeContent.experience_intro" rows="3" autoResize />
        </div>
        <div style="display: flex; justify-content: flex-end;">
          <Button label="Save Content" icon="pi pi-save" @click="saveHomeContent" :loading="savingContent" />
        </div>
      </div>
    </div>

    <!-- Experiences Section -->
    <div class="section-divider">
      <h2>Experiences</h2>
      <p>Manage your timeline experiences</p>
    </div>

    <div class="card">
      <div style="display: flex; justify-content: flex-end; margin-bottom: 16px;">
        <Button label="Add Experience" icon="pi pi-plus" @click="openCreate" />
      </div>
      <DataTable :value="experiences" :loading="loading" stripedRows>
        <Column field="title" header="Title" sortable />
        <Column field="description" header="Description" sortable />
        <Column field="date" header="Date" sortable style="width: 120px" />
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

    <!-- Drawer for Create/Edit Experience -->
    <AppDrawer v-model="drawerVisible" :header="isEditing ? 'Edit Experience' : 'New Experience'" :loading="saving" @submit="save">
      <div class="form-field">
        <label>Title</label>
        <InputText v-model="form.title" fluid />
      </div>
      <div class="form-field">
        <label>Description</label>
        <Textarea v-model="form.description" rows="3" autoResize fluid />
      </div>
      <div class="form-field">
        <label>Date</label>
        <InputText v-model="form.date" placeholder="e.g. 2024" fluid />
      </div>
    </AppDrawer>

    <!-- Live Projects Section -->
    <div class="section-divider">
      <h2>Live Projects</h2>
      <p>Manage your featured live projects</p>
    </div>

    <div class="card">
      <div style="display: flex; justify-content: flex-end; margin-bottom: 16px;">
        <Button label="Add Live Project" icon="pi pi-plus" @click="openCreateProject" />
      </div>
      <DataTable :value="liveProjects" :loading="loadingProjects" stripedRows>
        <Column field="title" header="Title" sortable />
        <Column field="image" header="Image URL" sortable>
          <template #body="{ data }">
            <span style="color: #64748b; font-size: 13px;">{{ data.image?.substring(0, 40) }}{{ data.image?.length > 40 ? '...' : '' }}</span>
          </template>
        </Column>
        <Column field="url" header="Live URL" sortable>
          <template #body="{ data }">
            <a v-if="data.url" :href="data.url" target="_blank" rel="noopener" style="color: #3b82f6; text-decoration: none;">
              <i class="pi pi-external-link" style="margin-right: 4px;" />
              Visit
            </a>
          </template>
        </Column>
        <Column header="Actions" style="width: 140px">
          <template #body="{ data }">
            <div style="display: flex; gap: 8px;">
              <Button icon="pi pi-pencil" severity="info" text rounded @click="openEditProject(data)" />
              <Button icon="pi pi-trash" severity="danger" text rounded @click="confirmDeleteProject(data)" />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Drawer for Create/Edit Live Project -->
    <AppDrawer v-model="projectDrawerVisible" :header="isEditingProject ? 'Edit Live Project' : 'New Live Project'" :loading="savingProject" @submit="saveProject">
      <div class="form-field">
        <label>Title</label>
        <InputText v-model="projectForm.title" fluid />
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
          ref="fileUploadRef"
        />
        <small v-if="projectForm.image" style="color: #64748b; margin-top: 8px; display: block;">Current: {{ projectForm.image.substring(projectForm.image.lastIndexOf('/') + 1) }}</small>
      </div>
      <div class="form-field">
        <label>Live URL</label>
        <InputText v-model="projectForm.url" placeholder="https://..." fluid />
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
import AppDrawer from '@/components/Drawer.vue'

const toast = useToast()
const confirm = useConfirm()

// Home Content
const homeContent = ref({ about_me: '', experience_intro: '' })
const savingContent = ref(false)

// Experiences
const experiences = ref([])
const loading = ref(false)
const drawerVisible = ref(false)
const isEditing = ref(false)
const saving = ref(false)
const form = ref({ title: '', description: '', date: '' })
const editingId = ref(null)

// Live Projects
const liveProjects = ref([])
const loadingProjects = ref(false)
const projectDrawerVisible = ref(false)
const isEditingProject = ref(false)
const savingProject = ref(false)
const projectForm = ref({ title: '', image: '', url: '' })
const editingProjectId = ref(null)
const selectedImageFile = ref(null)
const fileUploadRef = ref(null)


async function uploadImage(file) {
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

const fetchHomeContent = async () => {
  const { data } = await supabase.from('home_content').select('*').limit(1).single()
  if (data) homeContent.value = data
}

const saveHomeContent = async () => {
  savingContent.value = true
  const { error } = homeContent.value.id
    ? await supabase.from('home_content').update({
        about_me: homeContent.value.about_me,
        experience_intro: homeContent.value.experience_intro,
      }).eq('id', homeContent.value.id)
    : await supabase.from('home_content').insert({
        about_me: homeContent.value.about_me,
        experience_intro: homeContent.value.experience_intro,
      })
  savingContent.value = false
  toast.add({
    severity: error ? 'error' : 'success',
    summary: error ? 'Error' : 'Saved',
    detail: error?.message || 'Home content updated',
    life: 3000,
  })
  if (!error) fetchHomeContent()
}

const fetchExperiences = async () => {
  loading.value = true
  const { data } = await supabase.from('experiences').select('*').order('created_at', { ascending: false })
  experiences.value = data || []
  loading.value = false
}

const openCreate = () => {
  isEditing.value = false
  form.value = { title: '', description: '', date: '' }
  editingId.value = null
  drawerVisible.value = true
}

const openEdit = (row) => {
  isEditing.value = true
  form.value = { title: row.title, description: row.description, date: row.date }
  editingId.value = row.id
  drawerVisible.value = true
}

const save = async () => {
  saving.value = true
  const payload = { ...form.value }
  const { error } = isEditing.value
    ? await supabase.from('experiences').update(payload).eq('id', editingId.value)
    : await supabase.from('experiences').insert(payload)
  saving.value = false
  if (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: error.message, life: 3000 })
  } else {
    toast.add({ severity: 'success', summary: 'Success', detail: isEditing.value ? 'Experience updated' : 'Experience created', life: 3000 })
    drawerVisible.value = false
    fetchExperiences()
  }
}

const confirmDelete = (row) => {
  confirm.require({
    message: `Delete "${row.title}"?`,
    header: 'Confirm Delete',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      const { error } = await supabase.from('experiences').delete().eq('id', row.id)
      if (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: error.message, life: 3000 })
      } else {
        toast.add({ severity: 'success', summary: 'Deleted', detail: 'Experience removed', life: 3000 })
        fetchExperiences()
      }
    },
  })
}

// Live Projects CRUD
const fetchLiveProjects = async () => {
  loadingProjects.value = true
  const { data } = await supabase.from('live_projects').select('*').order('created_at', { ascending: false })
  liveProjects.value = data || []
  loadingProjects.value = false
}

const openCreateProject = () => {
  isEditingProject.value = false
  projectForm.value = { title: '', image: '', url: '' }
  editingProjectId.value = null
  selectedImageFile.value = null
  if (fileUploadRef.value) {
    fileUploadRef.value.clear()
  }
  projectDrawerVisible.value = true
}

const openEditProject = (row) => {
  isEditingProject.value = true
  projectForm.value = { title: row.title, image: row.image, url: row.url }
  editingProjectId.value = row.id
  selectedImageFile.value = null
  if (fileUploadRef.value) {
    fileUploadRef.value.clear()
  }
  projectDrawerVisible.value = true
}

const onImageSelect = (event) => {
  selectedImageFile.value = event.files[0]
}

const saveProject = async () => {
  savingProject.value = true
  
  // Upload image if a new file was selected
  let imageUrl = projectForm.value.image
  if (selectedImageFile.value) {
    imageUrl = await uploadImage(selectedImageFile.value)
    if (!imageUrl) {
      toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to upload image', life: 3000 })
      savingProject.value = false
      return
    }
  }
  
  const payload = { title: projectForm.value.title, image: imageUrl, url: projectForm.value.url }
  const { error } = isEditingProject.value
    ? await supabase.from('live_projects').update(payload).eq('id', editingProjectId.value)
    : await supabase.from('live_projects').insert(payload)
  savingProject.value = false
  if (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: error.message, life: 3000 })
  } else {
    toast.add({ severity: 'success', summary: 'Success', detail: isEditingProject.value ? 'Live project updated' : 'Live project created', life: 3000 })
    projectDrawerVisible.value = false
    selectedImageFile.value = null
    fetchLiveProjects()
  }
}

const confirmDeleteProject = (row) => {
  confirm.require({
    message: `Delete "${row.title}"?`,
    header: 'Confirm Delete',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      const { error } = await supabase.from('live_projects').delete().eq('id', row.id)
      if (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: error.message, life: 3000 })
      } else {
        toast.add({ severity: 'success', summary: 'Deleted', detail: 'Live project removed', life: 3000 })
        fetchLiveProjects()
      }
    },
  })
}

onMounted(() => {
  fetchHomeContent()
  fetchExperiences()
  fetchLiveProjects()
})
</script>
