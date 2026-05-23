import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/stage/2',
      name: 'stage-2',
      component: () => import('@/views/StageTwoView.vue'),
    },
    {
      path: '/stage/3',
      name: 'stage-3',
      component: () => import('@/views/StageThreeView.vue'),
    },
  ],
})

export default router
