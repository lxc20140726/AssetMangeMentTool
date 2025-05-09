<template>
  <div class="logs-container">
    <el-card class="filter-card">
      <el-form :inline="true" :model="filterForm">
        <el-form-item label="日志级别">
          <el-select v-model="filterForm.level" placeholder="选择日志级别" @change="handleFilterChange">
            <el-option label="全部" value="" />
            <el-option label="错误" value="error" />
            <el-option label="警告" value="warn" />
            <el-option label="信息" value="info" />
            <el-option label="调试" value="debug" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="filterForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            @change="handleFilterChange"
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
          <span>系统日志</span>
          <el-button type="primary" @click="refreshLogs">刷新</el-button>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="logs"
        style="width: 100%"
      >
        <el-table-column prop="timestamp" label="时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.timestamp) }}
          </template>
        </el-table-column>
        <el-table-column prop="level" label="级别" width="100">
          <template #default="{ row }">
            <el-tag
              :type="getLevelType(row.level)"
              size="small"
            >
              {{ row.level.toUpperCase() }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="message" label="消息" />
        <el-table-column prop="details" label="详情" width="200">
          <template #default="{ row }">
            <el-button
              v-if="row.details"
              type="primary"
              link
              @click="showDetails(row)"
            >
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      v-model="detailsDialogVisible"
      title="日志详情"
      width="50%"
    >
      <pre>{{ JSON.stringify(currentLogDetails, null, 2) }}</pre>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import axios from 'axios';

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  details?: any;
}

const loading = ref(false);
const logs = ref<LogEntry[]>([]);
const detailsDialogVisible = ref(false);
const currentLogDetails = ref<any>(null);

const filterForm = ref({
  level: '',
  dateRange: null as [Date, Date] | null,
});

const getLevelType = (level: string) => {
  const types: Record<string, string> = {
    error: 'danger',
    warn: 'warning',
    info: 'info',
    debug: 'success',
  };
  return types[level] || 'info';
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleString();
};

const showDetails = (log: LogEntry) => {
  currentLogDetails.value = log.details;
  detailsDialogVisible.value = true;
};

const fetchLogs = async () => {
  try {
    loading.value = true;
    const response = await axios.get('/api/logs', {
      params: {
        level: filterForm.value.level,
        startDate: filterForm.value.dateRange?.[0]?.toISOString(),
        endDate: filterForm.value.dateRange?.[1]?.toISOString(),
      },
    });
    logs.value = response.data;
  } catch (error) {
    ElMessage.error('获取日志失败');
    console.error('Error fetching logs:', error);
  } finally {
    loading.value = false;
  }
};

const handleFilterChange = () => {
  fetchLogs();
};

const handleSearch = () => {
  fetchLogs();
};

const resetFilter = () => {
  filterForm.value = {
    level: '',
    dateRange: null,
  };
  fetchLogs();
};

const refreshLogs = () => {
  fetchLogs();
};

onMounted(() => {
  fetchLogs();
});
</script>

<style scoped>
.logs-container {
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

pre {
  background-color: #f5f7fa;
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
}
</style> 