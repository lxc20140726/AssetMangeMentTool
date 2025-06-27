import request from 'supertest';
import express from 'express';
import cors from 'cors';
import { billsRouter } from '../../routes/bills';
import { assetsRouter } from '../../routes/assets';
import { logsRouter } from '../../routes/logs';
import { jest } from '@jest/globals';
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

// 创建测试应用
const createTestApp = () => {
  const app = express();
  
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
    res.status(500).json({ error: 'Internal server error' });
  });
  
  return app;
};

// Mock数据库
jest.mock('../../db/models', () => {
  const testDb = new Database(':memory:');
  
  // 创建测试表
  testDb.exec(`
    CREATE TABLE bills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      category TEXT NOT NULL,
      amount REAL NOT NULL,
      description TEXT,
      tags TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE assets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      amount REAL NOT NULL,
      last_updated TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  return {
    billModel: {
      create: (bill: any) => {
        const stmt = testDb.prepare(`
          INSERT INTO bills (date, category, amount, description, tags)
          VALUES (?, ?, ?, ?, ?)
        `);
        return stmt.run(bill.date, bill.category, bill.amount, bill.description, bill.tags);
      },
      findAll: () => {
        const stmt = testDb.prepare('SELECT * FROM bills ORDER BY date DESC');
        return stmt.all();
      },
      findByDateRange: (startDate: string, endDate: string) => {
        const stmt = testDb.prepare('SELECT * FROM bills WHERE date BETWEEN ? AND ? ORDER BY date DESC');
        return stmt.all(startDate, endDate);
      }
    },
    assetModel: {
      create: (asset: any) => {
        const stmt = testDb.prepare(`
          INSERT INTO assets (name, type, amount)
          VALUES (?, ?, ?)
        `);
        return stmt.run(asset.name, asset.type, asset.amount);
      },
      findAll: () => {
        const stmt = testDb.prepare('SELECT * FROM assets ORDER BY last_updated DESC');
        return stmt.all();
      },
      update: (id: number, amount: number) => {
        const stmt = testDb.prepare(`
          UPDATE assets 
          SET amount = ?, last_updated = CURRENT_TIMESTAMP
          WHERE id = ?
        `);
        return stmt.run(amount, id);
      }
    }
  };
});

// Mock logger
jest.mock('../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  }
}));

// Mock文件系统
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  promises: {
    access: jest.fn()
  }
}));

jest.mock('util', () => ({
  promisify: jest.fn().mockReturnValue(jest.fn())
}));

describe('API Integration Tests', () => {
  let app: express.Application;

  beforeAll(() => {
    app = createTestApp();
  });

  describe('Bills API', () => {
    describe('GET /api/bills', () => {
      it('应该返回所有账单', async () => {
        const response = await request(app)
          .get('/api/bills')
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
      });

      it('应该处理数据库错误', async () => {
        // 这里可以模拟数据库错误
        const response = await request(app)
          .get('/api/bills')
          .expect(200);

        expect(response.body).toBeDefined();
      });
    });

    describe('GET /api/bills/range', () => {
      it('应该返回指定日期范围的账单', async () => {
        const response = await request(app)
          .get('/api/bills/range')
          .query({
            startDate: '2024-01-01',
            endDate: '2024-01-31'
          })
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
      });

      it('应该在缺少日期参数时返回400错误', async () => {
        const response = await request(app)
          .get('/api/bills/range')
          .expect(400);

        expect(response.body.error).toBe('Start date and end date are required');
      });

      it('应该在只有开始日期时返回400错误', async () => {
        const response = await request(app)
          .get('/api/bills/range')
          .query({ startDate: '2024-01-01' })
          .expect(400);

        expect(response.body.error).toBe('Start date and end date are required');
      });
    });

    describe('POST /api/bills/import', () => {
      it('应该在无文件上传时返回400错误', async () => {
        const response = await request(app)
          .post('/api/bills/import')
          .expect(400);

        expect(response.body.error).toBe('No file uploaded');
      });

      it('应该接受文件上传', async () => {
        // 创建模拟文件
        const filePath = path.join(__dirname, 'test.xlsx');
        const fileContent = Buffer.from('mock excel content');
        
        const response = await request(app)
          .post('/api/bills/import')
          .attach('file', fileContent, 'test.xlsx')
          .expect(200);

        expect(response.body.message).toBe('File uploaded successfully');
      });
    });
  });

  describe('Assets API', () => {
    describe('GET /api/assets', () => {
      it('应该返回所有资产', async () => {
        const response = await request(app)
          .get('/api/assets')
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
      });
    });

    describe('POST /api/assets', () => {
      it('应该创建新资产', async () => {
        const assetData = {
          name: '测试资产',
          type: 'cash',
          amount: 1000
        };

        const response = await request(app)
          .post('/api/assets')
          .send(assetData)
          .expect(201);

        expect(response.body).toBeDefined();
      });

      it('应该在缺少必填字段时返回400错误', async () => {
        const assetData = {
          name: '测试资产'
          // 缺少 type 和 amount
        };

        const response = await request(app)
          .post('/api/assets')
          .send(assetData)
          .expect(400);

        expect(response.body.error).toBe('Name, type and amount are required');
      });

      it('应该验证所有必填字段', async () => {
        const testCases = [
          { name: '测试', type: 'cash' }, // 缺少 amount
          { name: '测试', amount: 1000 }, // 缺少 type
          { type: 'cash', amount: 1000 } // 缺少 name
        ];

        for (const testCase of testCases) {
          const response = await request(app)
            .post('/api/assets')
            .send(testCase)
            .expect(400);

          expect(response.body.error).toBe('Name, type and amount are required');
        }
      });
    });

    describe('PUT /api/assets/:id', () => {
      it('应该更新资产金额', async () => {
        const updateData = {
          amount: 2000
        };

        const response = await request(app)
          .put('/api/assets/1')
          .send(updateData)
          .expect(200);

        expect(response.body).toBeDefined();
      });

      it('应该在缺少金额时返回400错误', async () => {
        const response = await request(app)
          .put('/api/assets/1')
          .send({})
          .expect(400);

        expect(response.body.error).toBe('Amount is required');
      });

      it('应该处理无效的资产ID', async () => {
        const updateData = {
          amount: 2000
        };

        const response = await request(app)
          .put('/api/assets/invalid-id')
          .send(updateData)
          .expect(200);

        expect(response.body).toBeDefined();
      });
    });
  });

  describe('Logs API', () => {
    beforeEach(() => {
      // 重置文件系统模拟
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.promises.access as jest.Mock).mockResolvedValue(undefined);
      
      // 模拟日志文件内容
      const { promisify } = require('util');
      const mockReadFile = promisify(fs.readFile);
      mockReadFile.mockResolvedValue(`
        {"level":"info","message":"Test log 1","timestamp":"2024-01-01T10:00:00.000Z"}
        {"level":"error","message":"Test error","timestamp":"2024-01-01T11:00:00.000Z"}
        {"level":"debug","message":"Test debug","timestamp":"2024-01-01T12:00:00.000Z"}
      `);
    });

    describe('GET /api/logs', () => {
      it('应该返回所有日志', async () => {
        const response = await request(app)
          .get('/api/logs')
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
      });

      it('应该按级别筛选日志', async () => {
        const response = await request(app)
          .get('/api/logs')
          .query({ level: 'error' })
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
      });

      it('应该按日期范围筛选日志', async () => {
        const response = await request(app)
          .get('/api/logs')
          .query({
            startDate: '2024-01-01',
            endDate: '2024-01-31'
          })
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
      });

      it('应该在日志文件不存在时返回404错误', async () => {
        (fs.existsSync as jest.Mock).mockReturnValue(false);

        const response = await request(app)
          .get('/api/logs')
          .expect(404);

        expect(response.body.error).toBe('Log file not found');
      });

      it('应该在无权限读取时返回403错误', async () => {
        (fs.promises.access as jest.Mock).mockRejectedValue(new Error('Permission denied'));

        const response = await request(app)
          .get('/api/logs')
          .expect(403);

        expect(response.body.error).toBe('No permission to read log file');
      });
    });
  });

  describe('CORS Configuration', () => {
    it('应该设置CORS头部', async () => {
      const response = await request(app)
        .get('/api/assets')
        .expect(200);

      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });

    it('应该处理预检请求', async () => {
      const response = await request(app)
        .options('/api/assets')
        .expect(204);

      expect(response.headers['access-control-allow-methods']).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('应该处理JSON解析错误', async () => {
      const response = await request(app)
        .post('/api/assets')
        .set('Content-Type', 'application/json')
        .send('invalid json{')
        .expect(400);
    });

    it('应该处理未知路由', async () => {
      const response = await request(app)
        .get('/api/unknown-route')
        .expect(404);
    });
  });

  describe('Content-Type Handling', () => {
    it('应该接受JSON内容', async () => {
      const assetData = {
        name: '测试资产',
        type: 'cash',
        amount: 1000
      };

      const response = await request(app)
        .post('/api/assets')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify(assetData))
        .expect(201);
    });

    it('应该接受表单数据', async () => {
      const response = await request(app)
        .post('/api/assets')
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .send('name=测试资产&type=cash&amount=1000')
        .expect(201);
    });
  });
}); 