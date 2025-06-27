<template>
  <div class="forecast-container">
    <n-grid :cols="1" :x-gap="20">
      <n-grid-item>
        <n-card class="chart-card">
          <template #header>
            <n-space justify="space-between" align="center">
              <span>支出预测</span>
              <n-select
                v-model:value="forecastPeriod"
                placeholder="选择预测周期"
                :options="periodOptions"
                @update:value="handlePeriodChange"
              />
            </n-space>
          </template>
          <div ref="forecastChartRef" class="chart"></div>
        </n-card>
      </n-grid-item>
    </n-grid>

    <n-grid :cols="2" :x-gap="20" class="mt-20">
      <n-grid-item>
        <n-card class="chart-card">
          <template #header>
            <n-space justify="space-between" align="center">
              <span>分类预测</span>
            </n-space>
          </template>
          <div ref="categoryForecastChartRef" class="chart"></div>
        </n-card>
      </n-grid-item>
      <n-grid-item>
        <n-card class="chart-card">
          <template #header>
            <n-space justify="space-between" align="center">
              <span>资产增长预测</span>
            </n-space>
          </template>
          <div ref="assetForecastChartRef" class="chart"></div>
        </n-card>
      </n-grid-item>
    </n-grid>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import * as echarts from 'echarts';
import { useBillsStore } from '../stores/bills';
import { useAssetsStore } from '../stores/assets';

const billsStore = useBillsStore();
const assetsStore = useAssetsStore();
const forecastPeriod = ref('3');

const periodOptions = [
  { label: '未来3个月', value: '3' },
  { label: '未来6个月', value: '6' },
  { label: '未来12个月', value: '12' }
];

const forecastChartRef = ref<HTMLElement | null>(null);
const categoryForecastChartRef = ref<HTMLElement | null>(null);
const assetForecastChartRef = ref<HTMLElement | null>(null);

let forecastChart: echarts.ECharts | null = null;
let categoryForecastChart: echarts.ECharts | null = null;
let assetForecastChart: echarts.ECharts | null = null;

onMounted(async () => {
  await Promise.all([
    billsStore.fetchBills(),
    assetsStore.fetchAssets()
  ]);

  if (forecastChartRef.value) {
    forecastChart = echarts.init(forecastChartRef.value);
    updateForecastChart();
  }

  if (categoryForecastChartRef.value) {
    categoryForecastChart = echarts.init(categoryForecastChartRef.value);
    updateCategoryForecastChart();
  }

  if (assetForecastChartRef.value) {
    assetForecastChart = echarts.init(assetForecastChartRef.value);
    updateAssetForecastChart();
  }

  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  forecastChart?.dispose();
  categoryForecastChart?.dispose();
  assetForecastChart?.dispose();
});

const handleResize = () => {
  forecastChart?.resize();
  categoryForecastChart?.resize();
  assetForecastChart?.resize();
};

const handlePeriodChange = () => {
  updateForecastChart();
  updateCategoryForecastChart();
  updateAssetForecastChart();
};

const updateForecastChart = () => {
  if (!forecastChart) return;

  // 模拟预测数据
  const months = Array.from({ length: Number(forecastPeriod.value) }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() + i + 1);
    return date.toISOString().substring(0, 7);
  });

  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['实际支出', '预测支出']
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
        name: '实际支出',
        type: 'line',
        data: months.map(() => Math.random() * 5000 + 3000)
      },
      {
        name: '预测支出',
        type: 'line',
        data: months.map(() => Math.random() * 5000 + 3000)
      }
    ]
  };

  forecastChart.setOption(option);
};

const updateCategoryForecastChart = () => {
  if (!categoryForecastChart) return;

  const categories = ['餐饮', '交通', '购物', '娱乐', '其他'];
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['实际', '预测']
    },
    xAxis: {
      type: 'category',
      data: categories
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '实际',
        type: 'bar',
        data: categories.map(() => Math.random() * 2000 + 1000)
      },
      {
        name: '预测',
        type: 'bar',
        data: categories.map(() => Math.random() * 2000 + 1000)
      }
    ]
  };

  categoryForecastChart.setOption(option);
};

const updateAssetForecastChart = () => {
  if (!assetForecastChart) return;

  const months = Array.from({ length: Number(forecastPeriod.value) }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() + i + 1);
    return date.toISOString().substring(0, 7);
  });

  const option = {
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
        data: months.map((_, index) => 100000 + index * 5000 + Math.random() * 2000)
      }
    ]
  };

  assetForecastChart.setOption(option);
};
</script>

<style scoped>
.forecast-container {
  padding: 20px;
}

.chart-card {
  margin-bottom: 20px;
}

.chart {
  height: 400px;
}

.mt-20 {
  margin-top: 20px;
}
</style> 