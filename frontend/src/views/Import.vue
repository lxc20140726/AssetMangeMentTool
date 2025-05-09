<template>
  <div class="import-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>导入账单数据</span>
        </div>
      </template>

      <el-upload
        class="upload-demo"
        drag
        action="/api/bills/import"
        :auto-upload="false"
        :on-change="handleFileChange"
        :on-success="handleSuccess"
        :on-error="handleError"
        :before-upload="beforeUpload"
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          将文件拖到此处，或<em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            请上传 Excel 文件，支持 .xlsx 和 .xls 格式
          </div>
        </template>
      </el-upload>

      <div class="template-download">
        <el-button type="primary" link @click="downloadTemplate">
          下载导入模板
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { UploadFilled } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';

const router = useRouter();

const handleFileChange = (file: any) => {
  console.log('File changed:', file);
};

const handleSuccess = () => {
  ElMessage.success('导入成功');
  router.push('/bills');
};

const handleError = () => {
  ElMessage.error('导入失败，请检查文件格式是否正确');
};

const beforeUpload = (file: File) => {
  const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                  file.type === 'application/vnd.ms-excel';
  if (!isExcel) {
    ElMessage.error('只能上传 Excel 文件！');
    return false;
  }
  return true;
};

const downloadTemplate = () => {
  // TODO: 实现模板下载功能
  ElMessage.info('模板下载功能开发中');
};
</script>

<style scoped>
.import-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.upload-demo {
  width: 100%;
}

.template-download {
  margin-top: 20px;
  text-align: center;
}
</style> 