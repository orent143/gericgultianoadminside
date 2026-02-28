<template>
  <div class="admin-layout">
    <Navbar />
    <div class="admin-main">
      <Topbar />
      <div class="admin-content">
        <router-view />
      </div>
      <AppFooter />
    </div>
  </div>
  <Toast />
  <ConfirmDialog />
</template>

<script setup>
import Navbar from '@/components/Navbar.vue'
import Topbar from '@/components/Topbar.vue'
import AppFooter from '@/components/Footer.vue'
import Toast from 'primevue/toast'
import ConfirmDialog from 'primevue/confirmdialog'
</script>

<style>
/* App-level overrides if needed */
</style>
