import Database from 'better-sqlite3';
import { logger } from '../utils/logger';

const db = new Database('data/finance.db');

// 创建表
db.exec(`
  CREATE TABLE IF NOT EXISTS bills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    category TEXT NOT NULL,
    amount REAL NOT NULL,
    description TEXT,
    tags TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS assets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    amount REAL NOT NULL,
    last_updated TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

// 账单相关操作
export const billModel = {
  create: (bill: {
    date: string;
    category: string;
    amount: number;
    description?: string;
    tags?: string;
  }) => {
    const stmt = db.prepare(`
      INSERT INTO bills (date, category, amount, description, tags)
      VALUES (?, ?, ?, ?, ?)
    `);
    return stmt.run(bill.date, bill.category, bill.amount, bill.description, bill.tags);
  },

  findAll: () => {
    const stmt = db.prepare('SELECT * FROM bills ORDER BY date DESC');
    return stmt.all();
  },

  findByDateRange: (startDate: string, endDate: string) => {
    const stmt = db.prepare('SELECT * FROM bills WHERE date BETWEEN ? AND ? ORDER BY date DESC');
    return stmt.all(startDate, endDate);
  }
};

// 资产相关操作
export const assetModel = {
  create: (asset: {
    name: string;
    type: string;
    amount: number;
  }) => {
    const stmt = db.prepare(`
      INSERT INTO assets (name, type, amount)
      VALUES (?, ?, ?)
    `);
    return stmt.run(asset.name, asset.type, asset.amount);
  },

  findAll: () => {
    const stmt = db.prepare('SELECT * FROM assets ORDER BY last_updated DESC');
    return stmt.all();
  },

  update: (id: number, amount: number) => {
    const stmt = db.prepare(`
      UPDATE assets 
      SET amount = ?, last_updated = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    return stmt.run(amount, id);
  }
}; 