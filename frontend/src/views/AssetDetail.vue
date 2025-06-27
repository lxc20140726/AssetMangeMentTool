<template>
  <div class="asset-detail-container">
    <n-card :loading="loading">
      <template #header>
        <n-space justify="space-between" align="center">
          <span>资产详情</span>
          <n-button @click="router.back()">返回</n-button>
        </n-space>
      </template>

      <div v-if="asset" class="asset-info">
        <n-descriptions :column="2" bordered>
          <n-descriptions-item label="名称">{{ asset.name }}</n-descriptions-item>
          <n-descriptions-item label="类型">{{ asset.type }}</n-descriptions-item>
          <n-descriptions-item label="金额">{{ asset.amount.toFixed(2) }}</n-descriptions-item>
          <n-descriptions-item label="最后更新">{{ asset.last_updated }}</n-descriptions-item>
        </n-descriptions>

        <div class="chart-container">
          <div ref="historyChartRef" class="chart"></div>
        </div>
      </div>

      <div v-else class="no-data">
        <n-empty description="未找到资产信息" />
      </div>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import * as echarts from 'echarts';
import { useAssetsStore } from '../stores/assets';
import { useMessage } from 'naive-ui';

interface Asset {
  id: number;
  name: string;
  type: string;
  amount: number;
  last_updated: string;
}

const route = useRoute();
const router = useRouter();
const assetsStore = useAssetsStore();
const message = useMessage();
const loading = ref(true);
const asset = ref<Asset | null>(null);
const historyChartRef = ref<HTMLElement | null>(null);
let historyChart: echarts.ECharts | null = null;

onMounted(async () => {
  try {
    await assetsStore.fetchAssets();
    const assetId = Number(route.params.id);
    asset.value = assetsStore.assets.find(a => a.id === assetId) || null;

    if (asset.value && historyChartRef.value) {
      historyChart = echarts.init(historyChartRef.value);
      updateHistoryChart();
    }
  } catch (error) {
    message.error('获取资产详情失败');
  } finally {
    loading.value = false;
  }

  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  historyChart?.dispose();
});

const handleResize = () => {
  historyChart?.resize();
};

const updateHistoryChart = () => {
  if (!historyChart || !asset.value) return;

  // 模拟历史数据
  const months = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return date.toISOString().substring(0, 7);
  }).reverse();

  const option = {
    title: {
      text: '资产历史变化'
    },
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: months
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        type: 'line',
        data: months.map((_, index) => {
          const baseAmount = asset.value!.amount;
          const randomFactor = 0.1; // 10% 的随机波动
          return baseAmount * (1 + (Math.random() - 0.5) * randomFactor);
        })
      }
    ]
  };

  historyChart.setOption(option);
};
</script>

<style scoped>
.asset-detail-container {
  padding: 20px;
}

.asset-info {
  margin-top: 20px;
}

.chart-container {
  margin-top: 30px;
}

.chart {
  height: 400px;
}

.no-data {
  padding: 40px 0;
}
</style> 