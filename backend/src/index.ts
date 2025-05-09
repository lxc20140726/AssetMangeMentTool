import express from 'express';
import cors from 'cors';
import { logger } from './utils/logger';
import { billsRouter } from './routes/bills';
import { assetsRouter } from './routes/assets';

const app = express();
const port = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 路由
app.use('/api/bills', billsRouter);
app.use('/api/assets', assetsRouter);

// 错误处理
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
}); 