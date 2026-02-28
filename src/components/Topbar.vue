<template>
  <header class="admin-topbar">
    <div class="topbar-left">
      <h2 class="page-title">{{ routeTitle }}</h2>
    </div>
    <div class="topbar-right">
      <span class="admin-user">
        <i class="pi pi-user"></i>
        Admin
      </span>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const routeTitle = computed(() => {
  const titles = {
    '/': 'Dashboard',
    '/projects': 'Projects',
    '/skills': 'Skills',
    '/education': 'Education & Certifications',
  }
  return titles[route.path] || 'Admin'
})
</script>

<style scoped>
.admin-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 32px;
  background: #fff;
  border-bottom: 1px solid #e2e8f0;
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.admin-user {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #475569;
  font-weight: 500;
}
</style>