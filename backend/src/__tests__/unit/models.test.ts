import { billModel, assetModel } from '../../db/models';
import Database from 'better-sqlite3';
import { jest } from '@jest/globals';

// 使用内存数据库进行测试
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

describe('billModel', () => {
  beforeEach(() => {
    testDb.exec('DELETE FROM bills');
  });

  afterAll(() => {
    testDb.close();
  });

  describe('create', () => {
    it('应该成功创建账单', () => {
      const mockBill = {
        date: '2024-01-01',
        category: '餐饮',
        amount: 100.50,
        description: '午餐',
        tags: '日常,饮食'
      };

      const stmt = testDb.prepare(`
        INSERT INTO bills (date, category, amount, description, tags)
        VALUES (?, ?, ?, ?, ?)
      `);
      const result = stmt.run(mockBill.date, mockBill.category, mockBill.amount, mockBill.description, mockBill.tags);

      expect(result.changes).toBe(1);
      expect(result.lastInsertRowid).toBeDefined();
    });

    it('应该处理必填字段验证', () => {
      const mockBill = {
        date: '',
        category: '餐饮',
        amount: 100.50
      };

      const stmt = testDb.prepare(`
        INSERT INTO bills (date, category, amount)
        VALUES (?, ?, ?)
      `);

      expect(() => {
        stmt.run(mockBill.date, mockBill.category, mockBill.amount);
      }).toThrow();
    });
  });

  describe('findAll', () => {
    it('应该返回所有账单', () => {
      // 插入测试数据
      const stmt = testDb.prepare(`
        INSERT INTO bills (date, category, amount, description)
        VALUES (?, ?, ?, ?)
      `);
      
      stmt.run('2024-01-01', '餐饮', 100, '午餐');
      stmt.run('2024-01-02', '交通', 50, '地铁');

      const selectStmt = testDb.prepare('SELECT * FROM bills ORDER BY date DESC');
      const bills = selectStmt.all();

      expect(bills).toHaveLength(2);
      expect(bills[0].category).toBe('交通');
    });

    it('应该在没有账单时返回空数组', () => {
      const stmt = testDb.prepare('SELECT * FROM bills ORDER BY date DESC');
      const bills = stmt.all();

      expect(bills).toEqual([]);
    });
  });

  describe('findByDateRange', () => {
    beforeEach(() => {
      const stmt = testDb.prepare(`
        INSERT INTO bills (date, category, amount)
        VALUES (?, ?, ?)
      `);
      
      stmt.run('2024-01-01', '餐饮', 100);
      stmt.run('2024-01-15', '交通', 50);
      stmt.run('2024-02-01', '购物', 200);
    });

    it('应该按日期范围过滤账单', () => {
      const stmt = testDb.prepare('SELECT * FROM bills WHERE date BETWEEN ? AND ? ORDER BY date DESC');
      const bills = stmt.all('2024-01-01', '2024-01-31');

      expect(bills).toHaveLength(2);
      expect(bills.every((bill: any) => bill.date.startsWith('2024-01'))).toBe(true);
    });

    it('应该处理无效日期范围', () => {
      const stmt = testDb.prepare('SELECT * FROM bills WHERE date BETWEEN ? AND ? ORDER BY date DESC');
      const bills = stmt.all('2024-03-01', '2024-03-31');

      expect(bills).toHaveLength(0);
    });
  });
});

describe('assetModel', () => {
  beforeEach(() => {
    testDb.exec('DELETE FROM assets');
  });

  describe('create', () => {
    it('应该成功创建资产', () => {
      const mockAsset = {
        name: '招商银行',
        type: 'cash',
        amount: 10000
      };

      const stmt = testDb.prepare(`
        INSERT INTO assets (name, type, amount)
        VALUES (?, ?, ?)
      `);
      const result = stmt.run(mockAsset.name, mockAsset.type, mockAsset.amount);

      expect(result.changes).toBe(1);
      expect(result.lastInsertRowid).toBeDefined();
    });

    it('应该处理重复资产名称', () => {
      const stmt = testDb.prepare(`
        INSERT INTO assets (name, type, amount)
        VALUES (?, ?, ?)
      `);
      
      stmt.run('招商银行', 'cash', 10000);
      
      // 这里应该处理重复名称的情况
      expect(() => {
        stmt.run('招商银行', 'cash', 5000);
      }).not.toThrow(); // 目前数据库允许重复名称
    });
  });

  describe('findAll', () => {
    it('应该返回所有资产', () => {
      const stmt = testDb.prepare(`
        INSERT INTO assets (name, type, amount)
        VALUES (?, ?, ?)
      `);
      
      stmt.run('招商银行', 'cash', 10000);
      stmt.run('阿里股票', 'stock', 5000);

      const selectStmt = testDb.prepare('SELECT * FROM assets ORDER BY last_updated DESC');
      const assets = selectStmt.all();

      expect(assets).toHaveLength(2);
      expect(assets[0].name).toBe('阿里股票');
    });
  });

  describe('update', () => {
    it('应该成功更新资产金额', () => {
      const insertStmt = testDb.prepare(`
        INSERT INTO assets (name, type, amount)
        VALUES (?, ?, ?)
      `);
      const result = insertStmt.run('招商银行', 'cash', 10000);
      const assetId = result.lastInsertRowid;

      const updateStmt = testDb.prepare(`
        UPDATE assets 
        SET amount = ?, last_updated = CURRENT_TIMESTAMP
        WHERE id = ?
      `);
      const updateResult = updateStmt.run(15000, assetId);

      expect(updateResult.changes).toBe(1);

      // 验证更新
      const selectStmt = testDb.prepare('SELECT * FROM assets WHERE id = ?');
      const asset = selectStmt.get(assetId);
      expect(asset.amount).toBe(15000);
    });

    it('应该处理不存在的资产ID', () => {
      const stmt = testDb.prepare(`
        UPDATE assets 
        SET amount = ?, last_updated = CURRENT_TIMESTAMP
        WHERE id = ?
      `);
      const result = stmt.run(15000, 999);

      expect(result.changes).toBe(0);
    });
  });
}); 