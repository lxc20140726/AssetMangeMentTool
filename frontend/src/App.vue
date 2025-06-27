<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const activeKey = ref('1')

const handleUpdateValue = (key: string) => {
  activeKey.value = key
  switch (key) {
    case '1':
      router.push('/bills')
      break
    case '2':
      router.push('/import')
      break
    case '3':
      router.push('/analytics')
      break
    case '4':
      router.push('/forecast')
      break
    case '5':
      router.push('/assets')
      break
    case '6':
      router.push('/logs')
      break
  }
}
</script>

<template>
  <n-config-provider>
    <n-message-provider>
      <n-dialog-provider>
        <n-notification-provider>
          <n-layout class="layout-container">
            <n-layout-header class="header" bordered>
              <n-menu
                mode="horizontal"
                :value="activeKey"
                :on-update:value="handleUpdateValue"
                :options="[
                  { label: '账单管理', key: '1' },
                  { label: '导入账单', key: '2' },
                  { label: '数据分析', key: '3' },
                  { label: '支出预测', key: '4' },
                  { label: '资产管理', key: '5' },
                  { label: '系统日志', key: '6' }
                ]"
              />
            </n-layout-header>
            <n-layout-content class="main-content">
              <router-view />
            </n-layout-content>
          </n-layout>
        </n-notification-provider>
      </n-dialog-provider>
    </n-message-provider>
  </n-config-provider>
</template>

<style scoped>
.layout-container {
  min-height: 100vh;
}

.header {
  padding: 0 20px;
  display: flex;
  align-items: center;
}

.main-content {
  background-color: #f5f7fa;
  padding: 20px;
}
</style>
