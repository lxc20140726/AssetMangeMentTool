<template>
  <div class="import-container">
    <n-card>
      <template #header>
        <n-space justify="space-between" align="center">
          <span>导入账单数据</span>
        </n-space>
      </template>

      <n-upload
        multiple
        directory-dnd
        action="/api/bills/import"
        :max="1"
        :on-change="handleFileChange"
        :on-finish="handleSuccess"
        :on-error="handleError"
        :before-upload="beforeUpload"
        :custom-request="customRequest"
      >
        <n-upload-dragger>
          <div style="margin-bottom: 12px">
            <n-icon size="48" :depth="3">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M5.5 17a4.5 4.5 0 01-1.44-8.765 4.5 4.5 0 018.302-3.046 3.5 3.5 0 014.504 4.272A4 4 0 0115 17H5.5zm3.75-2.75a.75.75 0 001.5 0V9.66l1.95 2.1a.75.75 0 101.1-1.02l-3.25-3.5a.75.75 0 00-1.1 0l-3.25 3.5a.75.75 0 101.1 1.02l1.95-2.1v4.59z" clip-rule="evenodd" />
              </svg>
            </n-icon>
          </div>
          <n-text style="font-size: 16px">
            点击或者拖动文件到该区域来上传
          </n-text>
          <n-p depth="3" style="margin: 8px 0 0 0">
            请上传 Excel 文件，支持 .xlsx 和 .xls 格式
          </n-p>
        </n-upload-dragger>
      </n-upload>

      <div class="template-download">
        <n-button type="primary" text @click="downloadTemplate">
          下载导入模板
        </n-button>
      </div>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { useMessage } from 'naive-ui';
import { useRouter } from 'vue-router';
import type { UploadCustomRequestOptions, UploadFileInfo } from 'naive-ui';
import axios from 'axios';

const router = useRouter();
const message = useMessage();

const handleFileChange = (data: { fileList: UploadFileInfo[] }) => {
  console.log('File changed:', data.fileList);
};

const handleSuccess = () => {
  message.success('导入成功');
  router.push('/bills');
};

const handleError = () => {
  message.error('导入失败，请检查文件格式是否正确');
};

const beforeUpload = (data: { file: UploadFileInfo, fileList: UploadFileInfo[] }) => {
  const file = data.file.file;
  if (!file) return false;
  
  const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                  file.type === 'application/vnd.ms-excel';
  if (!isExcel) {
    message.error('只能上传 Excel 文件！');
    return false;
  }
  return true;
};

const customRequest = async ({ file, onFinish, onError }: UploadCustomRequestOptions) => {
  try {
    const formData = new FormData();
    formData.append('file', file.file as File);
    
    await axios.post('/api/bills/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    onFinish();
    handleSuccess();
  } catch (error) {
    onError();
    handleError();
  }
};

const downloadTemplate = () => {
  // TODO: 实现模板下载功能
  message.info('模板下载功能开发中');
};
</script>

<style scoped>
.import-container {
  padding: 20px;
}

.template-download {
  margin-top: 20px;
  text-align: center;
}
</style> 