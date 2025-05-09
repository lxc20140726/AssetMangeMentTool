import { logger } from '@/utils/logger';

const handleAdd = async () => {
  try {
    await formRef.value?.validate();
    loading.value = true;
    await axios.post('/api/assets', form.value);
    ElMessage.success('添加资产成功');
    logger.info('添加新资产', { 
      assetName: form.value.name,
      assetType: form.value.type,
      location: form.value.location
    });
    dialogVisible.value = false;
    fetchAssets();
  } catch (error: any) {
    const errorMessage = error.response?.data?.error || '添加资产失败';
    ElMessage.error(errorMessage);
    logger.error('添加资产失败', { error: errorMessage, formData: form.value });
  } finally {
    loading.value = false;
  }
};

const handleEdit = async () => {
  try {
    await formRef.value?.validate();
    loading.value = true;
    await axios.put(`/api/assets/${form.value.id}`, form.value);
    ElMessage.success('更新资产成功');
    logger.info('更新资产信息', { 
      assetId: form.value.id,
      assetName: form.value.name,
      assetType: form.value.type,
      location: form.value.location
    });
    dialogVisible.value = false;
    fetchAssets();
  } catch (error: any) {
    const errorMessage = error.response?.data?.error || '更新资产失败';
    ElMessage.error(errorMessage);
    logger.error('更新资产失败', { error: errorMessage, formData: form.value });
  } finally {
    loading.value = false;
  }
};

const handleDelete = async (row: Asset) => {
  try {
    await ElMessageBox.confirm('确定要删除该资产吗？', '提示', {
      type: 'warning'
    });
    loading.value = true;
    await axios.delete(`/api/assets/${row.id}`);
    ElMessage.success('删除资产成功');
    logger.info('删除资产', { 
      assetId: row.id,
      assetName: row.name,
      assetType: row.type
    });
    fetchAssets();
  } catch (error: any) {
    if (error !== 'cancel') {
      const errorMessage = error.response?.data?.error || '删除资产失败';
      ElMessage.error(errorMessage);
      logger.error('删除资产失败', { error: errorMessage, assetId: row.id });
    }
  } finally {
    loading.value = false;
  }
};

const handleExport = async () => {
  try {
    loading.value = true;
    const response = await axios.get('/api/assets/export', {
      responseType: 'blob'
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `资产列表_${new Date().toISOString().split('T')[0]}.xlsx`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    logger.info('导出资产列表', { 
      filterType: filterForm.value.type,
      filterLocation: filterForm.value.location
    });
  } catch (error: any) {
    const errorMessage = error.response?.data?.error || '导出资产列表失败';
    ElMessage.error(errorMessage);
    logger.error('导出资产列表失败', { error: errorMessage });
  } finally {
    loading.value = false;
  }
}; 