import { createApp } from 'vue'
import PrimeVue from 'primevue/config'
import Lara from '@primeuix/themes/lara'
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'
import App from './App.vue'
import router from '@/routes/router.js'
import './assets/global.css'
import 'primeicons/primeicons.css'

createApp(App)
  .use(router)
  .use(PrimeVue, {
    theme: {
      preset: Lara,
      options: {
        darkModeSelector: '.dark-mode',
      }
    }
  })
  .use(ToastService)
  .use(ConfirmationService)
  .mount('#app')
