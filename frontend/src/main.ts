import { createApp } from 'vue'
import { pinia } from '@/core/store/pinia'
import App from './App'
import router from './router'
import '@/assets/main.css'
import Toast from '@/core/plugins/toast'
import { toastOptions } from '@/core/plugins/toast'

import { useAuthStore } from './modules/auth/store'
import { useConstantsStore } from '@/core/store/constants'

const app = createApp(App)

app.use(pinia)
app.use(Toast, toastOptions)

const auth = useAuthStore(pinia)
await auth.bootstrap()

const constants = useConstantsStore(pinia)
await constants.fetchAll()

app.use(router)
app.mount('#app')
