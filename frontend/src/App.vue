<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const activeIndex = ref('1')

const handleSelect = (key: string) => {
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
  }
}
</script>

<template>
  <el-container class="layout-container">
    <el-header>
      <el-menu
        :default-active="activeIndex"
        class="el-menu-demo"
        mode="horizontal"
        @select="handleSelect"
      >
        <el-menu-item index="1">账单管理</el-menu-item>
        <el-menu-item index="2">导入账单</el-menu-item>
        <el-menu-item index="3">数据分析</el-menu-item>
        <el-menu-item index="4">支出预测</el-menu-item>
        <el-menu-item index="5">资产管理</el-menu-item>
      </el-menu>
    </el-header>
    <el-main>
      <router-view />
    </el-main>
  </el-container>
</template>

<style scoped>
.layout-container {
  min-height: 100vh;
}

.el-header {
  padding: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.el-menu-demo {
  padding: 0 20px;
}

.el-main {
  background-color: #f5f7fa;
  padding: 20px;
}
</style>
