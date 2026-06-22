import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './assets/base.css'
import './assets/theme-coveo.css'
import './assets/theme-forest.css'

const app = createApp(App)
app.use(createPinia())
app.mount('#app')
