<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ msg: string }>()

const count = ref(0)
</script>

<template>
  <n-h1>{{ msg }}</n-h1>

  <n-card class="card">
    <n-button type="primary" @click="count++">
      计数是 {{ count }}
    </n-button>
    <n-p>
      编辑
      <n-text code>components/HelloWorld.vue</n-text> 来测试 HMR
    </n-p>
  </n-card>

  <n-p>
    查看
    <n-a href="https://vuejs.org/guide/quick-start.html#local" target="_blank">
      create-vue
    </n-a>，官方的 Vue + Vite 启动模板
  </n-p>
  <n-p>
    了解更多关于 Vue 的 IDE 支持
    <n-a
      href="https://vuejs.org/guide/scaling-up/tooling.html#ide-support"
      target="_blank"
    >
      Vue 文档扩展指南
    </n-a>。
  </n-p>
  <n-p class="read-the-docs">点击 Vite 和 Vue 图标了解更多</n-p>
</template>

<style scoped>
.card {
  margin: 2em 0;
}

.read-the-docs {
  color: #888;
}
</style>
