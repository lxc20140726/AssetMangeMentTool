<template>
  <div class="assets-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>资产列表</span>
          <el-button type="primary" @click="showAddDialog">添加资产</el-button>
        </div>
      </template>

      <el-table
        v-loading="assetsStore.loading"
        :data="assetsStore.assets"
        style="width: 100%"
      >
        <el-table-column prop="name" label="名称" />
        <el-table-column prop="type" label="类型" />
        <el-table-column prop="amount" label="金额">
          <template #default="{ row }">
            {{ row.amount.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="last_updated" label="最后更新" />
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button
              type="primary"
              link
              @click="router.push(`/assets/${row.id}`)"
            >
              详情
            </el-button>
            <el-button
              type="primary"
              link
              @click="showUpdateDialog(row)"
            >
              更新
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加资产对话框 -->
    <el-dialog
      v-model="addDialogVisible"
      title="添加资产"
      width="500px"
    >
      <el-form
        ref="addFormRef"
        :model="addForm"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="名称" prop="name">
          <el-input v-model="addForm.name" />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="addForm.type" placeholder="请选择资产类型">
            <el-option label="现金" value="cash" />
            <el-option label="股票" value="stock" />
            <el-option label="基金" value="fund" />
            <el-option label="房产" value="property" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="金额" prop="amount">
          <el-input-number
            v-model="addForm.amount"
            :precision="2"
            :step="1000"
            :min="0"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleAdd">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 更新资产对话框 -->
    <el-dialog
      v-model="updateDialogVisible"
      title="更新资产"
      width="500px"
    >
      <el-form
        ref="updateFormRef"
        :model="updateForm"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="名称">
          <el-input v-model="updateForm.name" disabled />
        </el-form-item>
        <el-form-item label="类型">
          <el-input v-model="updateForm.type" disabled />
        </el-form-item>
        <el-form-item label="金额" prop="amount">
          <el-input-number
            v-model="updateForm.amount"
            :precision="2"
            :step="1000"
            :min="0"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="updateDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleUpdate">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAssetsStore } from '../stores/assets';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessage } from 'element-plus';

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

const addDialogVisible = ref(false);
const updateDialogVisible = ref(false);

const addFormRef = ref<FormInstance>();
const updateFormRef = ref<FormInstance>();

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
  
  await addFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        await assetsStore.createAsset(addForm.value);
        ElMessage.success('添加成功');
        addDialogVisible.value = false;
      } catch (error) {
        ElMessage.error('添加失败');
      }
    }
  });
};

const handleUpdate = async () => {
  if (!updateFormRef.value) return;

  await updateFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        await assetsStore.updateAsset(updateForm.value.id!, updateForm.value.amount);
        ElMessage.success('更新成功');
        updateDialogVisible.value = false;
      } catch (error) {
        ElMessage.error('更新失败');
      }
    }
  });
};
</script>

<style scoped>
.assets-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style> 