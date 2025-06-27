<template>
  <div class="assets-container">
    <n-card>
      <template #header>
        <n-space justify="space-between" align="center">
          <span>资产列表</span>
          <n-button type="primary" @click="showAddDialog">添加资产</n-button>
        </n-space>
      </template>

      <n-data-table
        :loading="assetsStore.loading"
        :columns="columns"
        :data="assetsStore.assets"
        :pagination="false"
      />
    </n-card>

    <!-- 添加资产对话框 -->
    <n-modal
      v-model:show="addDialogVisible"
      preset="card"
      title="添加资产"
      style="width: 500px"
      :mask-closable="false"
    >
      <n-form
        ref="addFormRef"
        :model="addForm"
        :rules="rules"
        label-placement="left"
        label-width="80"
      >
        <n-form-item label="名称" path="name">
          <n-input v-model:value="addForm.name" />
        </n-form-item>
        <n-form-item label="类型" path="type">
          <n-select
            v-model:value="addForm.type"
            placeholder="请选择资产类型"
            :options="assetTypeOptions"
          />
        </n-form-item>
        <n-form-item label="金额" path="amount">
          <n-input-number
            v-model:value="addForm.amount"
            :precision="2"
            :step="1000"
            :min="0"
            style="width: 100%"
          />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="addDialogVisible = false">取消</n-button>
          <n-button type="primary" @click="handleAdd">确定</n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- 更新资产对话框 -->
    <n-modal
      v-model:show="updateDialogVisible"
      preset="card"
      title="更新资产"
      style="width: 500px"
      :mask-closable="false"
    >
      <n-form
        ref="updateFormRef"
        :model="updateForm"
        :rules="rules"
        label-placement="left"
        label-width="80"
      >
        <n-form-item label="名称">
          <n-input v-model:value="updateForm.name" disabled />
        </n-form-item>
        <n-form-item label="类型">
          <n-input v-model:value="updateForm.type" disabled />
        </n-form-item>
        <n-form-item label="金额" path="amount">
          <n-input-number
            v-model:value="updateForm.amount"
            :precision="2"
            :step="1000"
            :min="0"
            style="width: 100%"
          />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="updateDialogVisible = false">取消</n-button>
          <n-button type="primary" @click="handleUpdate">确定</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, h } from 'vue';
import { useRouter } from 'vue-router';
import { useAssetsStore } from '../stores/assets';
import { useMessage } from 'naive-ui';
import type { FormInst, FormRules, DataTableColumns } from 'naive-ui';

interface Asset {
  id: number;
  name: string;
  type: string;
  amount: number;
  last_updated: string;
}

interface AssetForm {
  id?: number;
  name: string;
  type: string;
  amount: number;
}

const router = useRouter();
const assetsStore = useAssetsStore();
const message = useMessage();

const addDialogVisible = ref(false);
const updateDialogVisible = ref(false);

const addFormRef = ref<FormInst | null>(null);
const updateFormRef = ref<FormInst | null>(null);

const addForm = ref<AssetForm>({
  name: '',
  type: '',
  amount: 0
});

const updateForm = ref<AssetForm>({
  id: 0,
  name: '',
  type: '',
  amount: 0
});

const assetTypeOptions = [
  { label: '现金', value: 'cash' },
  { label: '股票', value: 'stock' },
  { label: '基金', value: 'fund' },
  { label: '房产', value: 'property' },
  { label: '其他', value: 'other' }
];

const rules: FormRules = {
  name: [
    { required: true, message: '请输入资产名称', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择资产类型', trigger: 'change' }
  ],
  amount: [
    { required: true, message: '请输入资产金额', trigger: 'blur' }
  ]
};

const columns: DataTableColumns<Asset> = [
  {
    title: '名称',
    key: 'name'
  },
  {
    title: '类型',
    key: 'type'
  },
  {
    title: '金额',
    key: 'amount',
    render(row) {
      return row.amount.toFixed(2);
    }
  },
  {
    title: '最后更新',
    key: 'last_updated'
  },
  {
    title: '操作',
    key: 'actions',
    width: 200,
    render(row) {
      return [
        h('n-button', {
          type: 'primary',
          text: true,
          onClick: () => router.push(`/assets/${row.id}`)
        }, { default: () => '详情' }),
        h('n-button', {
          type: 'primary',
          text: true,
          style: 'margin-left: 8px',
          onClick: () => showUpdateDialog(row)
        }, { default: () => '更新' })
      ];
    }
  }
];

onMounted(async () => {
  await assetsStore.fetchAssets();
});

const showAddDialog = () => {
  addForm.value = {
    name: '',
    type: '',
    amount: 0
  };
  addDialogVisible.value = true;
};

const showUpdateDialog = (row: Asset) => {
  updateForm.value = { ...row };
  updateDialogVisible.value = true;
};

const handleAdd = async () => {
  if (!addFormRef.value) return;
  
  try {
    await addFormRef.value.validate();
    await assetsStore.createAsset(addForm.value);
    message.success('添加成功');
    addDialogVisible.value = false;
  } catch (error) {
    message.error('添加失败');
  }
};

const handleUpdate = async () => {
  if (!updateFormRef.value) return;

  try {
    await updateFormRef.value.validate();
    await assetsStore.updateAsset(updateForm.value.id!, updateForm.value.amount);
    message.success('更新成功');
    updateDialogVisible.value = false;
  } catch (error) {
    message.error('更新失败');
  }
};
</script>

<style scoped>
.assets-container {
  padding: 20px;
}
</style> 