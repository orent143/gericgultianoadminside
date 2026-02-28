<template>
  <aside class="admin-sidebar">
    <div class="sidebar-brand">
      <i class="pi pi-th-large"></i>
      <span>Admin Panel</span>
    </div>
    <nav class="sidebar-nav">
      <router-link to="/" class="nav-item" exact-active-class="active">
        <i class="pi pi-home"></i>
        <span>Dashboard</span>
      </router-link>
      <router-link to="/projects" class="nav-item" active-class="active">
        <i class="pi pi-folder"></i>
        <span>Projects</span>
      </router-link>
      <router-link to="/skills" class="nav-item" active-class="active">
        <i class="pi pi-wrench"></i>
        <span>Skills</span>
      </router-link>
      <router-link to="/education" class="nav-item" active-class="active">
        <i class="pi pi-graduation-cap"></i>
        <span>Education & Certs</span>
      </router-link>
    </nav>
    <div class="sidebar-footer">
      <span class="version">Portfolio Admin v1.0</span>
    </div>
  </aside>
</template>

<style scoped>
.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 24px;
  font-size: 18px;
  font-weight: 700;
  border-bottom: 1px solid #1e293b;
}

.sidebar-brand i {
  font-size: 20px;
  color: #3b82f6;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  padding: 16px 12px;
  gap: 4px;
  flex: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  text-decoration: none;
  color: #94a3b8;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.nav-item:hover {
  background: #1e293b;
  color: #e2e8f0;
}

.nav-item.active {
  background: #1e40af;
  color: #fff;
}

.nav-item i {
  font-size: 16px;
  width: 20px;
  text-align: center;
}

.sidebar-footer {
  padding: 16px 24px;
  border-top: 1px solid #1e293b;
}

.version {
  font-size: 12px;
  color: #64748b;
}
</style>
