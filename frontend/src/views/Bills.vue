<template>
  <div class="bills-container">
    <el-card class="filter-card">
      <el-form :inline="true" :model="filterForm">
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="filterForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            @change="handleDateRangeChange"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>账单列表</span>
          <el-button type="primary" @click="router.push('/import')">导入账单</el-button>
        </div>
      </template>

      <el-table
        v-loading="billsStore.loading"
        :data="billsStore.bills"
        style="width: 100%"
      >
        <el-table-column prop="date" label="日期" width="180" />
        <el-table-column prop="category" label="分类" width="120" />
        <el-table-column prop="amount" label="金额" width="120">
          <template #default="{ row }">
            {{ row.amount.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" />
        <el-table-column prop="tags" label="标签" width="150">
          <template #default="{ row }">
            <el-tag
              v-for="tag in row.tags?.split(',')"
              :key="tag"
              class="mx-1"
              size="small"
            >
              {{ tag }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useBillsStore } from '../stores/bills';
import { ElMessage } from 'element-plus';

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
  dateRange: null as [Date, Date] | null
});

onMounted(async () => {
  await billsStore.fetchBills();
});

const handleDateRangeChange = (val: [Date, Date] | null) => {
  filterForm.value.dateRange = val;
};

const handleSearch = async () => {
  if (!filterForm.value.dateRange) {
    await billsStore.fetchBills();
    return;
  }

  const [startDate, endDate] = filterForm.value.dateRange;
  await billsStore.fetchBillsByDateRange(
    startDate.toISOString().split('T')[0],
    endDate.toISOString().split('T')[0]
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

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mx-1 {
  margin: 0 4px;
}
</style> 