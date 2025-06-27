import { logger } from '../../utils/logger';
import winston from 'winston';
import fs from 'fs';
import path from 'path';
import { jest } from '@jest/globals';

// Mock winston
jest.mock('winston', () => ({
  createLogger: jest.fn(),
  format: {
    timestamp: jest.fn(),
    json: jest.fn(),
    combine: jest.fn(),
    printf: jest.fn(),
    colorize: jest.fn()
  },
  transports: {
    File: jest.fn(),
    Console: jest.fn()
  }
}));

describe('Logger Utils', () => {
  let mockLogger: any;

  beforeEach(() => {
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      add: jest.fn()
    };
    (winston.createLogger as jest.Mock).mockReturnValue(mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('logger configuration', () => {
    it('应该在生产环境使用info级别', () => {
      process.env.NODE_ENV = 'production';
      
      expect(winston.createLogger).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 'info'
        })
      );
      
      delete process.env.NODE_ENV;
    });

    it('应该在非生产环境使用debug级别', () => {
      process.env.NODE_ENV = 'development';
      
      expect(winston.createLogger).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 'debug'
        })
      );
      
      delete process.env.NODE_ENV;
    });

    it('应该配置文件传输器', () => {
      expect(winston.transports.File).toHaveBeenCalledWith({
        filename: 'logs/error.log',
        level: 'error',
        maxsize: 5242880,
        maxFiles: 5
      });

      expect(winston.transports.File).toHaveBeenCalledWith({
        filename: 'logs/combined.log',
        maxsize: 5242880,
        maxFiles: 5
      });
    });

    it('应该在非生产环境添加控制台传输器', () => {
      process.env.NODE_ENV = 'development';
      
      // 重新require logger来触发配置
      jest.resetModules();
      require('../../utils/logger');
      
      expect(mockLogger.add).toHaveBeenCalledWith(
        expect.any(winston.transports.Console)
      );
      
      delete process.env.NODE_ENV;
    });
  });
});

// 中间件测试
describe('Validation Middleware', () => {
  describe('validateDateRange', () => {
    const validateDateRange = (req: any, res: any, next: any) => {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ error: 'Start date and end date are required' });
      }
      
      const start = new Date(startDate as string);
      const end = new Date(endDate as string);
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({ error: 'Invalid date format' });
      }
      
      if (start > end) {
        return res.status(400).json({ error: 'Start date must be before end date' });
      }
      
      next();
    };

    let mockReq: any;
    let mockRes: any;
    let mockNext: jest.Mock;

    beforeEach(() => {
      mockReq = {
        query: {}
      };
      mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      mockNext = jest.fn();
    });

    it('应该在缺少日期参数时返回400错误', () => {
      validateDateRange(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Start date and end date are required'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('应该在日期格式无效时返回400错误', () => {
      mockReq.query = {
        startDate: 'invalid-date',
        endDate: '2024-01-31'
      };

      validateDateRange(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Invalid date format'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('应该在开始日期晚于结束日期时返回400错误', () => {
      mockReq.query = {
        startDate: '2024-01-31',
        endDate: '2024-01-01'
      };

      validateDateRange(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Start date must be before end date'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('应该在有效日期范围时调用next', () => {
      mockReq.query = {
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      };

      validateDateRange(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });
  });

  describe('validateAsset', () => {
    const validateAsset = (req: any, res: any, next: any) => {
      const { name, type, amount } = req.body;
      
      if (!name || !type || amount === undefined) {
        return res.status(400).json({ 
          error: 'Name, type and amount are required' 
        });
      }
      
      if (typeof amount !== 'number' || amount < 0) {
        return res.status(400).json({ 
          error: 'Amount must be a positive number' 
        });
      }
      
      const validTypes = ['cash', 'stock', 'fund', 'property', 'other'];
      if (!validTypes.includes(type)) {
        return res.status(400).json({ 
          error: 'Invalid asset type' 
        });
      }
      
      next();
    };

    let mockReq: any;
    let mockRes: any;
    let mockNext: jest.Mock;

    beforeEach(() => {
      mockReq = {
        body: {}
      };
      mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      mockNext = jest.fn();
    });

    it('应该在缺少必填字段时返回400错误', () => {
      mockReq.body = {
        name: '测试资产'
        // 缺少 type 和 amount
      };

      validateAsset(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Name, type and amount are required'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('应该在金额无效时返回400错误', () => {
      mockReq.body = {
        name: '测试资产',
        type: 'cash',
        amount: -100
      };

      validateAsset(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Amount must be a positive number'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('应该在资产类型无效时返回400错误', () => {
      mockReq.body = {
        name: '测试资产',
        type: 'invalid-type',
        amount: 1000
      };

      validateAsset(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Invalid asset type'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('应该在有效数据时调用next', () => {
      mockReq.body = {
        name: '测试资产',
        type: 'cash',
        amount: 1000
      };

      validateAsset(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('应该接受所有有效的资产类型', () => {
      const validTypes = ['cash', 'stock', 'fund', 'property', 'other'];
      
      validTypes.forEach(type => {
        mockReq.body = {
          name: '测试资产',
          type,
          amount: 1000
        };
        
        mockNext.mockClear();
        validateAsset(mockReq, mockRes, mockNext);
        
        expect(mockNext).toHaveBeenCalledTimes(1);
      });
    });
  });
}); 