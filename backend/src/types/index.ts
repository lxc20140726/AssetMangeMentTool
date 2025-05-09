export interface Bill {
  id: number;
  date: string;
  category: string;
  amount: number;
  description: string;
  tags?: string;
}

export interface Asset {
  id: number;
  name: string;
  type: string;
  amount: number;
  last_updated: string;
}

export interface AssetHistory {
  id: number;
  asset_id: number;
  amount: number;
  date: string;
}

export interface Category {
  id: number;
  name: string;
  type: 'income' | 'expense';
}

export interface ApiError extends Error {
  status?: number;
  code?: string;
} 