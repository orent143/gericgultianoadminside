<!-- AppFooter.vue -->
<template>
  <footer class="admin-footer">
    <p>&copy; {{ currentYear }} Geric Gultiano — Portfolio Admin Panel</p>
  </footer>
</template>

<script setup>
const currentYear = new Date().getFullYear()
</script>

<style scoped>
.admin-footer {
  padding: 16px 32px;
  border-top: 1px solid #e2e8f0;
  text-align: center;
}

.admin-footer p {
  font-size: 13px;
  color: #94a3b8;
  margin: 0;
}
</style>
