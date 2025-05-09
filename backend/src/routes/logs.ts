import { Router } from 'express';
import { logger } from '../utils/logger';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const router = Router();
const readFile = promisify(fs.readFile);

// 获取日志列表
router.get('/', async (req, res) => {
  try {
    const { level, startDate, endDate } = req.query;
    
    // 读取日志文件
    const logPath = path.join(__dirname, '../../logs/combined.log');
    const logContent = await readFile(logPath, 'utf-8');
    
    // 解析日志内容
    const logs = logContent
      .split('\n')
      .filter(line => line.trim())
      .map(line => {
        try {
          return JSON.parse(line);
        } catch (e) {
          return null;
        }
      })
      .filter(log => log !== null)
      .filter(log => {
        // 按级别筛选
        if (level && log.level !== level) {
          return false;
        }
        
        // 按时间范围筛选
        if (startDate && endDate) {
          const logDate = new Date(log.timestamp);
          const start = new Date(startDate as string);
          const end = new Date(endDate as string);
          if (logDate < start || logDate > end) {
            return false;
          }
        }
        
        return true;
      });

    res.json(logs);
  } catch (error) {
    logger.error('Error fetching logs:', error);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

export { router as logsRouter }; 