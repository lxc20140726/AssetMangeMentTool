<template>
  <div class="analytics-container">
    <n-grid :cols="1" :x-gap="20">
      <n-grid-item>
        <n-card class="chart-card">
          <template #header>
            <n-space justify="space-between" align="center">
              <span>支出分类统计</span>
              <n-date-picker
                v-model:value="dateRange"
                type="daterange"
                :separator="' 至 '"
                :start-placeholder="'开始日期'"
                :end-placeholder="'结束日期'"
                @update:value="handleDateRangeChange"
              />
            </n-space>
          </template>
          <div ref="categoryChartRef" class="chart"></div>
        </n-card>
      </n-grid-item>
    </n-grid>

    <n-grid :cols="2" :x-gap="20" class="mt-20">
      <n-grid-item>
        <n-card class="chart-card">
          <template #header>
            <n-space justify="space-between" align="center">
              <span>月度支出趋势</span>
            </n-space>
          </template>
          <div ref="trendChartRef" class="chart"></div>
        </n-card>
      </n-grid-item>
      <n-grid-item>
        <n-card class="chart-card">
          <template #header>
            <n-space justify="space-between" align="center">
              <span>资产分布</span>
            </n-space>
          </template>
          <div ref="assetChartRef" class="chart"></div>
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
const dateRange = ref<[number, number] | null>(null);

const categoryChartRef = ref<HTMLElement | null>(null);
const trendChartRef = ref<HTMLElement | null>(null);
const assetChartRef = ref<HTMLElement | null>(null);

let categoryChart: echarts.ECharts | null = null;
let trendChart: echarts.ECharts | null = null;
let assetChart: echarts.ECharts | null = null;

onMounted(async () => {
  await Promise.all([
    billsStore.fetchBills(),
    assetsStore.fetchAssets()
  ]);

  if (categoryChartRef.value) {
    categoryChart = echarts.init(categoryChartRef.value);
    updateCategoryChart();
  }

  if (trendChartRef.value) {
    trendChart = echarts.init(trendChartRef.value);
    updateTrendChart();
  }

  if (assetChartRef.value) {
    assetChart = echarts.init(assetChartRef.value);
    updateAssetChart();
  }

  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  categoryChart?.dispose();
  trendChart?.dispose();
  assetChart?.dispose();
});

const handleResize = () => {
  categoryChart?.resize();
  trendChart?.resize();
  assetChart?.resize();
};

const handleDateRangeChange = async (val: [number, number] | null) => {
  if (val) {
    const [startDate, endDate] = val;
    await billsStore.fetchBillsByDateRange(
      new Date(startDate).toISOString().split('T')[0],
      new Date(endDate).toISOString().split('T')[0]
    );
    updateCategoryChart();
    updateTrendChart();
  }
};

const updateCategoryChart = () => {
  if (!categoryChart) return;

  const categoryData = billsStore.bills.reduce((acc, bill) => {
    acc[bill.category] = (acc[bill.category] || 0) + bill.amount;
    return acc;
  }, {} as Record<string, number>);

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    series: [
      {
        type: 'pie',
        radius: '50%',
        data: Object.entries(categoryData).map(([name, value]) => ({
          name,
          value
        }))
      }
    ]
  };

  categoryChart.setOption(option);
};

const updateTrendChart = () => {
  if (!trendChart) return;

  const monthlyData = billsStore.bills.reduce((acc, bill) => {
    const month = bill.date.substring(0, 7);
    acc[month] = (acc[month] || 0) + bill.amount;
    return acc;
  }, {} as Record<string, number>);

  const option = {
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: Object.keys(monthlyData).sort()
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        type: 'line',
        data: Object.keys(monthlyData).sort().map(month => monthlyData[month])
      }
    ]
  };

  trendChart.setOption(option);
};

const updateAssetChart = () => {
  if (!assetChart) return;

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    series: [
      {
        type: 'pie',
        radius: '50%',
        data: assetsStore.assets.map(asset => ({
          name: asset.name,
          value: asset.amount
        }))
      }
    ]
  };

  assetChart.setOption(option);
};
</script>

<style scoped>
.analytics-container {
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