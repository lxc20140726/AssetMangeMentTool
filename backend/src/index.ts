import express from 'express';
import cors from 'cors';
import { logger } from './utils/logger';
import { billsRouter } from './routes/bills';
import { assetsRouter } from './routes/assets';
import { logsRouter } from './routes/logs';
import fs from 'fs';
import path from 'path';

const app = express();
const port = process.env.PORT || 3000;

// 确保日志目录存在
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 路由
app.use('/api/bills', billsRouter);
app.use('/api/assets', assetsRouter);
app.use('/api/logs', logsRouter);

// 错误处理
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
}); 