<template>
  <div class="bills-container">
    <n-card class="filter-card">
      <n-space :size="16" align="center">
        <n-date-picker
          v-model:value="filterForm.dateRange"
          type="daterange"
          :separator="' 至 '"
          :start-placeholder="'开始日期'"
          :end-placeholder="'结束日期'"
          @update:value="handleDateRangeChange"
        />
        <n-button type="primary" @click="handleSearch">查询</n-button>
        <n-button @click="resetFilter">重置</n-button>
      </n-space>
    </n-card>

    <n-card class="table-card">
      <template #header>
        <n-space justify="space-between" align="center">
          <span>账单列表</span>
          <n-button type="primary" @click="router.push('/import')">导入账单</n-button>
        </n-space>
      </template>

      <n-data-table
        :loading="billsStore.loading"
        :columns="columns"
        :data="billsStore.bills"
        :pagination="false"
      />
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, h } from 'vue';
import { useRouter } from 'vue-router';
import { useBillsStore } from '../stores/bills';
import { NTag } from 'naive-ui';
import type { DataTableColumns } from 'naive-ui';

interface Bill {
  id: number;
  date: string;
  category: string;
  amount: number;
  description: string;
  tags?: string;
}

const router = useRouter();
const billsStore = useBillsStore();
const filterForm = ref({
  dateRange: null as [number, number] | null
});

const columns: DataTableColumns<Bill> = [
  {
    title: '日期',
    key: 'date',
    width: 180
  },
  {
    title: '分类',
    key: 'category',
    width: 120
  },
  {
    title: '金额',
    key: 'amount',
    width: 120,
    render(row) {
      return row.amount.toFixed(2);
    }
  },
  {
    title: '描述',
    key: 'description'
  },
  {
    title: '标签',
    key: 'tags',
    width: 150,
    render(row) {
      if (!row.tags) return '';
      return row.tags.split(',').map(tag => 
        h(NTag, { size: 'small', style: 'margin-right: 4px;' }, { default: () => tag })
      );
    }
  }
];

onMounted(async () => {
  await billsStore.fetchBills();
});

const handleDateRangeChange = (val: [number, number] | null) => {
  filterForm.value.dateRange = val;
};

const handleSearch = async () => {
  if (!filterForm.value.dateRange) {
    await billsStore.fetchBills();
    return;
  }

  const [startDate, endDate] = filterForm.value.dateRange;
  await billsStore.fetchBillsByDateRange(
    new Date(startDate).toISOString().split('T')[0],
    new Date(endDate).toISOString().split('T')[0]
  );
};

const resetFilter = () => {
  filterForm.value.dateRange = null;
  billsStore.fetchBills();
};
</script>

<style scoped>
.bills-container {
  padding: 20px;
}

.filter-card {
  margin-bottom: 20px;
}

.table-card {
  margin-bottom: 20px;
}
</style> 