import { defineStore } from 'pinia';
import axios from 'axios';

interface Asset {
  id: number;
  name: string;
  type: string;
  amount: number;
  last_updated: string;
}

export const useAssetsStore = defineStore('assets', {
  state: () => ({
    assets: [] as Asset[],
    loading: false,
    error: null as string | null
  }),

  actions: {
    async fetchAssets() {
      this.loading = true;
      try {
        const response = await axios.get('/api/assets');
        this.assets = response.data;
      } catch (error) {
        this.error = 'Failed to fetch assets';
        console.error(error);
      } finally {
        this.loading = false;
      }
    },

    async createAsset(asset: Omit<Asset, 'id' | 'last_updated'>) {
      this.loading = true;
      try {
        await axios.post('/api/assets', asset);
        await this.fetchAssets();
      } catch (error) {
        this.error = 'Failed to create asset';
        console.error(error);
      } finally {
        this.loading = false;
      }
    },

    async updateAsset(id: number, amount: number) {
      this.loading = true;
      try {
        await axios.put(`/api/assets/${id}`, { amount });
        await this.fetchAssets();
      } catch (error) {
        this.error = 'Failed to update asset';
        console.error(error);
      } finally {
        this.loading = false;
      }
    }
  }
}); 