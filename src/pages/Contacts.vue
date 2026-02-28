<template>
  <div>
    <!-- Education Section -->
    <div class="page-header">
      <div>
        <h1>Education</h1>
        <p>Manage your educational background</p>
      </div>
      <Button label="Add Education" icon="pi pi-plus" @click="openCreateEdu" />
    </div>

    <div class="card">
      <DataTable :value="education" :loading="loadingEdu" stripedRows>
        <Column field="degree" header="Degree" sortable />  
        <Column field="school" header="School" sortable />
        <Column field="period" header="Period" sortable style="width: 160px" />
        <Column header="Actions" style="width: 140px">
          <template #body="{ data }">
            <div style="display: flex; gap: 8px;">
              <Button icon="pi pi-pencil" severity="info" text rounded @click="openEditEdu(data)" />
              <Button icon="pi pi-trash" severity="danger" text rounded @click="confirmDeleteEdu(data)" />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Certifications Section -->
    <div class="section-divider">
      <h2>Certifications</h2>
      <p>Manage your certificates and achievements</p>
    </div>

    <div style="display: flex; justify-content: flex-end; margin-bottom: 16px;">
      <Button label="Add Certification" icon="pi pi-plus" @click="openCreateCert" />
    </div>

    <div class="card">
      <DataTable :value="certifications" :loading="loadingCert" stripedRows>
        <Column field="title" header="Title" sortable />
        <Column field="issuer" header="Issuer" sortable />
        <Column field="date" header="Date" sortable style="width: 120px" />
        <Column header="Actions" style="width: 140px">
          <template #body="{ data }">
            <div style="display: flex; gap: 8px;">
              <Button icon="pi pi-pencil" severity="info" text rounded @click="openEditCert(data)" />
              <Button icon="pi pi-trash" severity="danger" text rounded @click="confirmDeleteCert(data)" />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Education Drawer -->
    <AppDrawer v-model="eduDrawerVisible" :header="isEditingEdu ? 'Edit Education' : 'New Education'" :loading="savingEdu" @submit="saveEdu">
      <div class="form-field">
        <label>Degree</label>
        <InputText v-model="eduForm.degree" fluid />
      </div>
      <div class="form-field">
        <label>School</label>
        <InputText v-model="eduForm.school" fluid />
      </div>
      <div class="form-field">
        <label>Period</label>
        <InputText v-model="eduForm.period" placeholder="e.g. 2020 - 2024" fluid />
      </div>
    </AppDrawer>

    <!-- Certification Drawer -->
    <AppDrawer v-model="certDrawerVisible" :header="isEditingCert ? 'Edit Certification' : 'New Certification'" :loading="savingCert" @submit="saveCert">
      <div class="form-field">
        <label>Title</label>
        <InputText v-model="certForm.title" fluid />
      </div>
      <div class="form-field">
        <label>Issuer</label>
        <InputText v-model="certForm.issuer" fluid />
      </div>
      <div class="form-field">
        <label>Date</label>
        <InputText v-model="certForm.date" placeholder="e.g. 2023" fluid />
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
import AppDrawer from '@/components/Drawer.vue'

const toast = useToast()
const confirm = useConfirm()

// Education state
const education = ref([])
const loadingEdu = ref(false)
const eduDrawerVisible = ref(false)
const isEditingEdu = ref(false)
const savingEdu = ref(false)
const editingEduId = ref(null)
const eduForm = ref({ degree: '', school: '', period: '' })

// Certification state
const certifications = ref([])
const loadingCert = ref(false)
const certDrawerVisible = ref(false)
const isEditingCert = ref(false)
const savingCert = ref(false)
const editingCertId = ref(null)
const certForm = ref({ title: '', issuer: '', date: '' })

// Education CRUD
const fetchEducation = async () => {
  loadingEdu.value = true
  const { data } = await supabase.from('education').select('*').order('created_at', { ascending: false })
  education.value = data || []
  loadingEdu.value = false
}

const openCreateEdu = () => {
  isEditingEdu.value = false
  eduForm.value = { degree: '', school: '', period: '' }
  editingEduId.value = null
  eduDrawerVisible.value = true
}

const openEditEdu = (row) => {
  isEditingEdu.value = true
  eduForm.value = { degree: row.degree, school: row.school, period: row.period }
  editingEduId.value = row.id
  eduDrawerVisible.value = true
}

const saveEdu = async () => {
  savingEdu.value = true
  const payload = { ...eduForm.value }
  const { error } = isEditingEdu.value
    ? await supabase.from('education').update(payload).eq('id', editingEduId.value)
    : await supabase.from('education').insert(payload)
  savingEdu.value = false
  if (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: error.message, life: 3000 })
  } else {
    toast.add({ severity: 'success', summary: 'Success', detail: isEditingEdu.value ? 'Education updated' : 'Education created', life: 3000 })
    eduDrawerVisible.value = false
    fetchEducation()
  }
}

const confirmDeleteEdu = (row) => {
  confirm.require({
    message: 'Delete "' + row.degree + '"?',
    header: 'Confirm Delete',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      const { error } = await supabase.from('education').delete().eq('id', row.id)
      if (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: error.message, life: 3000 })
      } else {
        toast.add({ severity: 'success', summary: 'Deleted', detail: 'Education removed', life: 3000 })
        fetchEducation()
      }
    },
  })
}

// Certification CRUD
const fetchCertifications = async () => {
  loadingCert.value = true
  const { data } = await supabase.from('certifications').select('*').order('created_at', { ascending: false })
  certifications.value = data || []
  loadingCert.value = false
}

const openCreateCert = () => {
  isEditingCert.value = false
  certForm.value = { title: '', issuer: '', date: '' }
  editingCertId.value = null
  certDrawerVisible.value = true
}

const openEditCert = (row) => {
  isEditingCert.value = true
  certForm.value = { title: row.title, issuer: row.issuer, date: row.date }
  editingCertId.value = row.id
  certDrawerVisible.value = true
}

const saveCert = async () => {
  savingCert.value = true
  const payload = { ...certForm.value }
  const { error } = isEditingCert.value
    ? await supabase.from('certifications').update(payload).eq('id', editingCertId.value)
    : await supabase.from('certifications').insert(payload)
  savingCert.value = false
  if (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: error.message, life: 3000 })
  } else {
    toast.add({ severity: 'success', summary: 'Success', detail: isEditingCert.value ? 'Certification updated' : 'Certification created', life: 3000 })
    certDrawerVisible.value = false
    fetchCertifications()
  }
}

const confirmDeleteCert = (row) => {
  confirm.require({
    message: 'Delete "' + row.title + '"?',
    header: 'Confirm Delete',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      const { error } = await supabase.from('certifications').delete().eq('id', row.id)
      if (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: error.message, life: 3000 })
      } else {
        toast.add({ severity: 'success', summary: 'Deleted', detail: 'Certification removed', life: 3000 })
        fetchCertifications()
      }
    },
  })
}

onMounted(() => {
  fetchEducation()
  fetchCertifications()
})
</script>