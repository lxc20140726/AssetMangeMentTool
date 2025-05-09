import { defineStore } from 'pinia';
import axios from 'axios';

interface Bill {
  id: number;
  date: string;
  category: string;
  amount: number;
  description?: string;
  tags?: string;
}

export const useBillsStore = defineStore('bills', {
  state: () => ({
    bills: [] as Bill[],
    loading: false,
    error: null as string | null
  }),

  actions: {
    async fetchBills() {
      this.loading = true;
      try {
        const response = await axios.get('/api/bills');
        this.bills = response.data;
      } catch (error) {
        this.error = 'Failed to fetch bills';
        console.error(error);
      } finally {
        this.loading = false;
      }
    },

    async fetchBillsByDateRange(startDate: string, endDate: string) {
      this.loading = true;
      try {
        const response = await axios.get('/api/bills/range', {
          params: { startDate, endDate }
        });
        this.bills = response.data;
      } catch (error) {
        this.error = 'Failed to fetch bills by date range';
        console.error(error);
      } finally {
        this.loading = false;
      }
    },

    async importBills(file: File) {
      this.loading = true;
      try {
        const formData = new FormData();
        formData.append('file', file);
        await axios.post('/api/bills/import', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        await this.fetchBills();
      } catch (error) {
        this.error = 'Failed to import bills';
        console.error(error);
      } finally {
        this.loading = false;
      }
    }
  }
}); 