import { jest } from '@jest/globals';
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

// 测试环境配置
export const TEST_CONFIG = {
  testTimeout: 10000,
  dbTimeout: 5000,
  apiTimeout: 3000
};

// 测试数据库设置
export class TestDatabase {
  private db: Database.Database;

  constructor() {
    this.db = new Database(':memory:');
    this.setupTables();
  }

  private setupTables() {
    this.db.exec(`
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
  }

  getDatabase() {
    return this.db;
  }

  cleanup() {
    this.db.exec('DELETE FROM bills');
    this.db.exec('DELETE FROM assets');
  }

  close() {
    this.db.close();
  }

  // 插入测试数据
  insertTestBills() {
    const stmt = this.db.prepare(`
      INSERT INTO bills (date, category, amount, description, tags)
      VALUES (?, ?, ?, ?, ?)
    `);

    const testBills = [
      ['2024-01-01', '餐饮', 100, '午餐', '日常'],
      ['2024-01-02', '交通', 50, '地铁', '通勤'],
      ['2024-01-03', '购物', 200, '衣服', '生活'],
      ['2024-01-04', '娱乐', 80, '电影', '休闲'],
      ['2024-01-05', '医疗', 300, '体检', '健康']
    ];

    testBills.forEach(bill => {
      stmt.run(...bill);
    });
  }

  insertTestAssets() {
    const stmt = this.db.prepare(`
      INSERT INTO assets (name, type, amount)
      VALUES (?, ?, ?)
    `);

    const testAssets = [
      ['招商银行', 'cash', 10000],
      ['支付宝', 'cash', 5000],
      ['阿里股票', 'stock', 15000],
      ['腾讯股票', 'stock', 12000],
      ['余额宝', 'fund', 8000]
    ];

    testAssets.forEach(asset => {
      stmt.run(...asset);
    });
  }
}

// 测试工具类
export class TestHelper {
  // 创建测试目录
  static createTestDir(dirPath: string) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  // 清理测试目录
  static cleanupTestDir(dirPath: string) {
    if (fs.existsSync(dirPath)) {
      fs.rmSync(dirPath, { recursive: true, force: true });
    }
  }

  // 创建测试文件
  static createTestFile(filePath: string, content: string) {
    const dir = path.dirname(filePath);
    this.createTestDir(dir);
    fs.writeFileSync(filePath, content);
  }

  // 等待指定时间
  static async wait(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 生成随机字符串
  static randomString(length: number = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // 生成随机数字
  static randomNumber(min: number = 0, max: number = 1000) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // 生成测试日期
  static randomDate(start: Date = new Date(2024, 0, 1), end: Date = new Date()) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  }

  // 格式化日期为字符串
  static formatDate(date: Date) {
    return date.toISOString().split('T')[0];
  }
}

// 模拟数据生成器
export class MockDataGenerator {
  static generateBill(overrides: Partial<any> = {}) {
    return {
      date: TestHelper.formatDate(TestHelper.randomDate()),
      category: this.randomCategory(),
      amount: TestHelper.randomNumber(10, 500),
      description: this.randomDescription(),
      tags: this.randomTags(),
      ...overrides
    };
  }

  static generateAsset(overrides: Partial<any> = {}) {
    return {
      name: this.randomAssetName(),
      type: this.randomAssetType(),
      amount: TestHelper.randomNumber(1000, 100000),
      ...overrides
    };
  }

  private static randomCategory() {
    const categories = ['餐饮', '交通', '购物', '娱乐', '医疗', '教育', '住房', '其他'];
    return categories[Math.floor(Math.random() * categories.length)];
  }

  private static randomDescription() {
    const descriptions = [
      '早餐', '午餐', '晚餐', '地铁', '公交', '打车', '购物', '电影', 
      '体检', '买药', '学费', '房租', '水电费', '网费', '其他支出'
    ];
    return descriptions[Math.floor(Math.random() * descriptions.length)];
  }

  private static randomTags() {
    const tags = ['日常', '必需', '娱乐', '健康', '学习', '工作', '生活'];
    const numTags = Math.floor(Math.random() * 3) + 1;
    const selectedTags = [];
    
    for (let i = 0; i < numTags; i++) {
      const tag = tags[Math.floor(Math.random() * tags.length)];
      if (!selectedTags.includes(tag)) {
        selectedTags.push(tag);
      }
    }
    
    return selectedTags.join(',');
  }

  private static randomAssetName() {
    const bankNames = ['招商银行', '工商银行', '建设银行', '农业银行', '中国银行'];
    const stockNames = ['阿里股票', '腾讯股票', '百度股票', '字节跳动', '美团股票'];
    const fundNames = ['余额宝', '理财通', '货币基金', '股票基金', '债券基金'];
    
    const allNames = [...bankNames, ...stockNames, ...fundNames];
    return allNames[Math.floor(Math.random() * allNames.length)];
  }

  private static randomAssetType() {
    const types = ['cash', 'stock', 'fund', 'property', 'other'];
    return types[Math.floor(Math.random() * types.length)];
  }
}

// 自定义断言匹配器
export const customMatchers = {
  toBeValidBill(received: any) {
    const pass = 
      typeof received === 'object' &&
      received !== null &&
      typeof received.date === 'string' &&
      typeof received.category === 'string' &&
      typeof received.amount === 'number' &&
      received.amount > 0;

    if (pass) {
      return {
        message: () => `期望 ${JSON.stringify(received)} 不是有效的账单`,
        pass: true,
      };
    } else {
      return {
        message: () => `期望 ${JSON.stringify(received)} 是有效的账单`,
        pass: false,
      };
    }
  },

  toBeValidAsset(received: any) {
    const validTypes = ['cash', 'stock', 'fund', 'property', 'other'];
    const pass = 
      typeof received === 'object' &&
      received !== null &&
      typeof received.name === 'string' &&
      received.name.length > 0 &&
      typeof received.type === 'string' &&
      validTypes.includes(received.type) &&
      typeof received.amount === 'number' &&
      received.amount >= 0;

    if (pass) {
      return {
        message: () => `期望 ${JSON.stringify(received)} 不是有效的资产`,
        pass: true,
      };
    } else {
      return {
        message: () => `期望 ${JSON.stringify(received)} 是有效的资产`,
        pass: false,
      };
    }
  },

  toBeValidDate(received: any) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const pass = 
      typeof received === 'string' &&
      dateRegex.test(received) &&
      !isNaN(Date.parse(received));

    if (pass) {
      return {
        message: () => `期望 ${received} 不是有效的日期格式`,
        pass: true,
      };
    } else {
      return {
        message: () => `期望 ${received} 是有效的日期格式 (YYYY-MM-DD)`,
        pass: false,
      };
    }
  }
};

// 性能测试工具
export class PerformanceHelper {
  private startTime: number = 0;
  
  start() {
    this.startTime = Date.now();
  }
  
  end() {
    return Date.now() - this.startTime;
  }
  
  static async measureAsync<T>(fn: () => Promise<T>): Promise<{ result: T; duration: number }> {
    const start = Date.now();
    const result = await fn();
    const duration = Date.now() - start;
    return { result, duration };
  }
  
  static measure<T>(fn: () => T): { result: T; duration: number } {
    const start = Date.now();
    const result = fn();
    const duration = Date.now() - start;
    return { result, duration };
  }
}

// 错误模拟工具
export class ErrorSimulator {
  static async networkError(delay: number = 100) {
    await TestHelper.wait(delay);
    throw new Error('Network error');
  }
  
  static async timeoutError(delay: number = 5000) {
    await TestHelper.wait(delay);
    throw new Error('Request timeout');
  }
  
  static databaseError() {
    throw new Error('Database connection failed');
  }
  
  static validationError(field: string) {
    throw new Error(`Validation failed for field: ${field}`);
  }
  
  static authenticationError() {
    throw new Error('Authentication failed');
  }
  
  static permissionError() {
    throw new Error('Permission denied');
  }
}

// 全局测试设置
export function setupTestEnvironment() {
  // 设置测试超时时间
  jest.setTimeout(TEST_CONFIG.testTimeout);
  
  // 设置环境变量
  process.env.NODE_ENV = 'test';
  
  // 创建测试目录
  const testDirs = ['logs', 'uploads', 'data'];
  testDirs.forEach(dir => {
    TestHelper.createTestDir(path.join(process.cwd(), dir));
  });
  
  // 全局错误处理
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  });
  
  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
  });
}

// 清理测试环境
export function cleanupTestEnvironment() {
  // 清理测试文件
  const testDirs = ['logs', 'uploads'];
  testDirs.forEach(dir => {
    const dirPath = path.join(process.cwd(), dir);
    if (fs.existsSync(dirPath)) {
      fs.readdirSync(dirPath).forEach(file => {
        if (file.startsWith('test-')) {
          fs.unlinkSync(path.join(dirPath, file));
        }
      });
    }
  });
}

// 导出所有工具
export {
  TestDatabase,
  TestHelper,
  MockDataGenerator,
  PerformanceHelper,
  ErrorSimulator
}; 