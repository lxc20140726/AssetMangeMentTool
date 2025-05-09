import { Router } from 'express';
import { assetModel } from '../db/models';
import { logger } from '../utils/logger';

const router = Router();

// 获取所有资产
router.get('/', (req, res) => {
  try {
    const assets = assetModel.findAll();
    res.json(assets);
  } catch (error) {
    logger.error('Error fetching assets:', error);
    res.status(500).json({ error: 'Failed to fetch assets' });
  }
});

// 创建新资产
router.post('/', (req, res) => {
  try {
    const { name, type, amount } = req.body;
    if (!name || !type || !amount) {
      return res.status(400).json({ error: 'Name, type and amount are required' });
    }
    const result = assetModel.create({ name, type, amount });
    res.status(201).json(result);
  } catch (error) {
    logger.error('Error creating asset:', error);
    res.status(500).json({ error: 'Failed to create asset' });
  }
});

// 更新资产
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;
    if (!amount) {
      return res.status(400).json({ error: 'Amount is required' });
    }
    const result = assetModel.update(Number(id), amount);
    res.json(result);
  } catch (error) {
    logger.error('Error updating asset:', error);
    res.status(500).json({ error: 'Failed to update asset' });
  }
});

export const assetsRouter = router; 