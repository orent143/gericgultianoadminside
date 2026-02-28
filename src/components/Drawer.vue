<template>
  <PrimeDrawer
    v-model:visible="model"
    :header="header"
    position="right"
    class="!w-full md:!w-80 lg:!w-[30rem]"
  >
    <div class="drawer-form">
      <slot />
    </div>
    <template #footer>
      <div class="drawer-footer">
        <Button label="Cancel" severity="secondary" outlined @click="model = false" />
        <Button :label="submitLabel" @click="$emit('submit')" :loading="loading" />
      </div>
    </template>
  </PrimeDrawer>
</template>

<script setup>
import PrimeDrawer from 'primevue/drawer'
import Button from 'primevue/button'

const model = defineModel({ type: Boolean })

defineProps({
  header: { type: String, default: 'Form' },
  submitLabel: { type: String, default: 'Save' },
  loading: { type: Boolean, default: false },
})

defineEmits(['submit'])
</script>
