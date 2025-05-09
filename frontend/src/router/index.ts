import { createRouter, createWebHistory } from 'vue-router';
import Bills from '../views/Bills.vue';
import Import from '../views/Import.vue';
import Analytics from '../views/Analytics.vue';
import Forecast from '../views/Forecast.vue';
import Assets from '../views/Assets.vue';
import Logs from '../views/Logs.vue';

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
      component: Bills
    },
    {
      path: '/import',
      name: 'Import',
      component: Import
    },
    {
      path: '/analytics',
      name: 'Analytics',
      component: Analytics
    },
    {
      path: '/forecast',
      name: 'Forecast',
      component: Forecast
    },
    {
      path: '/assets',
      name: 'Assets',
      component: Assets
    },
    {
      path: '/logs',
      name: 'Logs',
      component: Logs
    }
  ]
});

export default router; 