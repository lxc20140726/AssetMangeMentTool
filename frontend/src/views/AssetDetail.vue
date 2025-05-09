<template>
  <div class="asset-detail-container">
    <el-card v-loading="loading">
      <template #header>
        <div class="card-header">
          <span>资产详情</span>
          <el-button @click="router.back()">返回</el-button>
        </div>
      </template>

      <div v-if="asset" class="asset-info">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="名称">{{ asset.name }}</el-descriptions-item>
          <el-descriptions-item label="类型">{{ asset.type }}</el-descriptions-item>
          <el-descriptions-item label="金额">{{ asset.amount.toFixed(2) }}</el-descriptions-item>
          <el-descriptions-item label="最后更新">{{ asset.last_updated }}</el-descriptions-item>
        </el-descriptions>

        <div class="chart-container">
          <div ref="historyChartRef" class="chart"></div>
        </div>
      </div>

      <div v-else class="no-data">
        <el-empty description="未找到资产信息" />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import * as echarts from 'echarts';
import { useAssetsStore } from '../stores/assets';
import { ElMessage } from 'element-plus';

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
    ElMessage.error('获取资产详情失败');
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

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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