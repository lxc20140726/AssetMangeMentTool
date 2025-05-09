import { logger } from '@/utils/logger';

const handleSaveSettings = async () => {
  try {
    await formRef.value?.validate();
    loading.value = true;
    await axios.put('/api/settings', form.value);
    ElMessage.success('保存设置成功');
    logger.info('更新系统设置', { 
      settings: {
        backupEnabled: form.value.backupEnabled,
        backupInterval: form.value.backupInterval,
        backupPath: form.value.backupPath,
        logRetentionDays: form.value.logRetentionDays
      }
    });
  } catch (error: any) {
    const errorMessage = error.response?.data?.error || '保存设置失败';
    ElMessage.error(errorMessage);
    logger.error('保存系统设置失败', { error: errorMessage, formData: form.value });
  } finally {
    loading.value = false;
  }
};

const handleBackupNow = async () => {
  try {
    loading.value = true;
    await axios.post('/api/settings/backup');
    ElMessage.success('备份成功');
    logger.info('手动触发系统备份');
  } catch (error: any) {
    const errorMessage = error.response?.data?.error || '备份失败';
    ElMessage.error(errorMessage);
    logger.error('手动备份失败', { error: errorMessage });
  } finally {
    loading.value = false;
  }
};

const handleRestore = async (file: string) => {
  try {
    await ElMessageBox.confirm('确定要恢复该备份吗？此操作将覆盖当前数据。', '警告', {
      type: 'warning'
    });
    loading.value = true;
    await axios.post('/api/settings/restore', { file });
    ElMessage.success('恢复成功');
    logger.info('恢复系统备份', { backupFile: file });
  } catch (error: any) {
    if (error !== 'cancel') {
      const errorMessage = error.response?.data?.error || '恢复失败';
      ElMessage.error(errorMessage);
      logger.error('恢复备份失败', { error: errorMessage, backupFile: file });
    }
  } finally {
    loading.value = false;
  }
}; 