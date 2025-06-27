<template>
  <div class="logs-container">
    <n-card class="filter-card">
      <n-space justify="space-between" align="center">
        <n-select
          v-model:value="filterForm.level"
          placeholder="选择日志级别"
          :options="levelOptions"
          @update:value="handleFilterChange"
          style="width: 200px"
        />
        <n-button type="primary" @click="refreshLogs">刷新</n-button>
      </n-space>
    </n-card>

    <n-card class="table-card">
      <template #header>
        <n-space justify="space-between" align="center">
          <span>系统日志</span>
        </n-space>
      </template>

      <n-data-table
        :loading="loading"
        :columns="columns"
        :data="logs"
        :pagination="false"
      />
    </n-card>

    <n-modal
      v-model:show="detailsDialogVisible"
      preset="card"
      title="日志详情"
      style="width: 50%"
    >
      <pre>{{ JSON.stringify(currentLogDetails, null, 2) }}</pre>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, h } from 'vue';
import { useMessage, NTag, NButton } from 'naive-ui';
import type { DataTableColumns } from 'naive-ui';
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
const message = useMessage();

const filterForm = ref({
  level: '',
});

const levelOptions = [
  { label: '全部', value: '' },
  { label: '错误', value: 'error' },
  { label: '警告', value: 'warn' },
  { label: '信息', value: 'info' },
  { label: '调试', value: 'debug' }
];

const getLevelType = (level: string) => {
  const types: Record<string, 'error' | 'warning' | 'info' | 'success'> = {
    error: 'error',
    warn: 'warning',
    info: 'info',
    debug: 'success',
  };
  return types[level] || 'info';
};

const formatDate = (date: string) => {
  try {
    // 检查是否是 ISO 格式的时间戳
    if (date.includes('T')) {
      return new Date(date).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
    }
    
    // 如果是数字时间戳
    const timestamp = parseInt(date);
    if (!isNaN(timestamp)) {
      return new Date(timestamp).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
    }
    
    // 如果都不是，返回原始值
    return date;
  } catch (error) {
    console.error('Error formatting date:', date, error);
    return date;
  }
};

const showDetails = (log: LogEntry) => {
  currentLogDetails.value = log.details;
  detailsDialogVisible.value = true;
};

const columns: DataTableColumns<LogEntry> = [
  {
    title: '时间',
    key: 'timestamp',
    width: 180,
    render(row) {
      return formatDate(row.timestamp);
    }
  },
  {
    title: '级别',
    key: 'level',
    width: 100,
    render(row) {
      return h(NTag, {
        type: getLevelType(row.level),
        size: 'small'
      }, { default: () => row.level.toUpperCase() });
    }
  },
  {
    title: '消息',
    key: 'message'
  },
  {
    title: '详情',
    key: 'details',
    width: 200,
    render(row) {
      if (!row.details) return '';
      return h(NButton, {
        type: 'primary',
        text: true,
        onClick: () => showDetails(row)
      }, { default: () => '查看详情' });
    }
  }
];

const fetchLogs = async () => {
  try {
    loading.value = true;
    const response = await axios.get('/api/logs', {
      params: {
        level: filterForm.value.level,
      },
    });
    logs.value = response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.error || '获取日志失败';
    const errorDetails = error.response?.data?.details || '';
    message.error(`${errorMessage}${errorDetails ? `: ${errorDetails}` : ''}`);
  } finally {
    loading.value = false;
  }
};

const handleFilterChange = () => {
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

pre {
  background-color: #f5f7fa;
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
}
</style> 