import { createRouter, createWebHistory } from 'vue-router'
import IncrementalGame from './pages/IncrementalGame.vue'
import Prestigio from './pages/Prestigio.vue'
import Settings from './pages/Settings.vue'

const routerHistory = createWebHistory(import.meta.env.BASE_URL)

const router = createRouter({
  history: routerHistory,
  routes: [
    {
      path: '/',
      component: IncrementalGame
    },
    {
      path: '/prestigio',
      component: Prestigio
    },
    {
      path: '/settings',
      component: Settings
    },
  ]
})

export default router
