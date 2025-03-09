import axios from 'axios';
import { supabase } from './supabase';

export class SheetsManager {
  private static instance: SheetsManager;
  private apiUrl: string;
  private syncInterval: NodeJS.Timeout | null = null;
  private readonly SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes

  private constructor() {
    this.apiUrl = import.meta.env.VITE_API_URL || window.location.origin;
  }

  public static getInstance(): SheetsManager {
    if (!SheetsManager.instance) {
      SheetsManager.instance = new SheetsManager();
    }
    return SheetsManager.instance;
  }

  public startAutoSync() {
    // Clear any existing sync interval
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    // Start periodic sync
    this.syncInterval = setInterval(async () => {
      try {
        const { data: products } = await supabase
          .from('products')
          .select('*')
          .order('name');
        
        await this.syncInventory(products || []);
        console.log('Auto-sync with Google Sheets completed');
      } catch (error) {
        console.error('Auto-sync failed:', error);
      }
    }, this.SYNC_INTERVAL);
  }

  public stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  async syncInventory(products: any[]) {
    try {
      const response = await axios.post(
        `${this.apiUrl}/api/sheets/sync`,
        { products },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      // Update last sync timestamp in Supabase
      await supabase
        .from('system_settings')
        .upsert({ 
          id: 'sheets_sync',
          last_sync: new Date().toISOString()
        });

      return response.data.success;
    } catch (error) {
      console.error('Error syncing with Google Sheets:', error);
      throw error;
    }
  }

  async getInventory() {
    try {
      const response = await axios.get(`${this.apiUrl}/api/sheets/inventory`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      // Compare with Supabase data and reconcile differences
      const { data: supabaseProducts } = await supabase
        .from('products')
        .select('*');

      const sheetsProducts = response.data.products;
      
      // Update Supabase if sheets data is newer
      for (const sheetProduct of sheetsProducts) {
        const supabaseProduct = supabaseProducts?.find(p => p.id === sheetProduct.id);
        if (!supabaseProduct || new Date(sheetProduct.last_updated) > new Date(supabaseProduct.updated_at)) {
          await supabase
            .from('products')
            .upsert({
              id: sheetProduct.id,
              name: sheetProduct.name,
              description: sheetProduct.description,
              price: sheetProduct.price,
              quantity: sheetProduct.quantity,
              updated_at: sheetProduct.last_updated
            });
        }
      }

      return sheetsProducts;
    } catch (error) {
      console.error('Error fetching from Google Sheets:', error);
      throw error;
    }
  }

  async updateProduct(productId: string, updates: any) {
    try {
      // Update Supabase first
      const { data: supabaseUpdate, error: supabaseError } = await supabase
        .from('products')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId)
        .select()
        .single();

      if (supabaseError) throw supabaseError;

      // Then sync with Google Sheets
      const response = await axios.patch(
        `${this.apiUrl}/api/sheets/products/${productId}`,
        updates,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      return response.data.success && supabaseUpdate;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }
}

// Export a pre-initialized instance
export const sheetsManager = SheetsManager.getInstance();