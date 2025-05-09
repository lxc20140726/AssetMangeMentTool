import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/bills'
    },
    {
      path: '/bills',
      name: 'Bills',
      component: () => import('../views/Bills.vue')
    },
    {
      path: '/import',
      name: 'Import',
      component: () => import('../views/Import.vue')
    },
    {
      path: '/analytics',
      name: 'Analytics',
      component: () => import('../views/Analytics.vue')
    },
    {
      path: '/forecast',
      name: 'Forecast',
      component: () => import('../views/Forecast.vue')
    },
    {
      path: '/assets',
      name: 'Assets',
      component: () => import('../views/Assets.vue')
    },
    {
      path: '/assets/:id',
      name: 'AssetDetail',
      component: () => import('../views/AssetDetail.vue')
    }
  ]
});

export default router; 