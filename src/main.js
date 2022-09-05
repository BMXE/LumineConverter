import { createApp } from 'vue'
import App from './App.vue'
import VueCookies from 'vue-cookies'

import './assets/base.css'

var app = createApp(App)
app.use(VueCookies)
app.mount('#app')