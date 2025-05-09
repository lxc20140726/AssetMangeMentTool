import { Router } from 'express';
import multer from 'multer';
import { billModel } from '../db/models';
import { logger } from '../utils/logger';

const router = Router();
const upload = multer({ dest: 'uploads/' });

// 获取所有账单
router.get('/', (req, res) => {
  try {
    const bills = billModel.findAll();
    res.json(bills);
  } catch (error) {
    logger.error('Error fetching bills:', error);
    res.status(500).json({ error: 'Failed to fetch bills' });
  }
});

// 按日期范围获取账单
router.get('/range', (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }
    const bills = billModel.findByDateRange(startDate as string, endDate as string);
    res.json(bills);
  } catch (error) {
    logger.error('Error fetching bills by date range:', error);
    res.status(500).json({ error: 'Failed to fetch bills' });
  }
});

// 导入账单
router.post('/import', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    // TODO: 实现Excel文件解析和导入
    res.json({ message: 'File uploaded successfully' });
  } catch (error) {
    logger.error('Error importing bills:', error);
    res.status(500).json({ error: 'Failed to import bills' });
  }
});

export const billsRouter = router; 