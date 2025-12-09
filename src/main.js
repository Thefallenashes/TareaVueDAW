import { createApp } from 'vue'
import router from './router'
import App from './App.vue'

import './css/style.css'

const app = createApp(App)
app.use(router)

// Handle GitHub Pages 404 redirect for SPA routing
if (window.location.pathname.endsWith('/')) {
  const redirect = sessionStorage.redirect
  if (redirect && redirect !== window.location.pathname) {
    delete sessionStorage.redirect
    router.push(redirect)
  }
}

app.mount('#app')
