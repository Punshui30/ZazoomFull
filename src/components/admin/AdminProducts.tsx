import React, { useState, useEffect } from 'react';
import { Package, Plus, Edit, Trash2, AlertTriangle, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { SheetsManager } from '../../lib/sheets';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  created_at: string;
}

interface SyncStatus {
  lastSync: Date | null;
  syncing: boolean;
}

export function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    lastSync: null,
    syncing: false
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setProducts(data || []);
    } catch (err) {
      setError('Failed to fetch products');
      console.error('Products error:', err);
    } finally {
      setLoading(false);
    }
  };

  const syncWithGoogleSheets = async () => {
    try {
      setSyncStatus(prev => ({ ...prev, syncing: true }));
      const sheets = SheetsManager.getInstance();
      await sheets.syncInventory(products);
      setSyncStatus({
        lastSync: new Date(),
        syncing: false
      });
      toast.success('Inventory synced with Google Sheets');
    } catch (err) {
      console.error('Sync error:', err);
      toast.error('Failed to sync with Google Sheets');
      setSyncStatus(prev => ({ ...prev, syncing: false }));
    }
  };

  const handleEdit = async (product: Product) => {
    try {
      setEditingProduct(product);
      // Also update in Google Sheets
      const sheets = SheetsManager.getInstance();
      await sheets.updateProduct(product.id, product);
    } catch (err) {
      console.error('Edit error:', err);
      toast.error('Failed to update product');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      setProducts(products.filter(product => product.id !== id));
    } catch (err) {
      console.error('Delete error:', err);
      // Show error toast
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-12 bg-black/30 rounded-lg"></div>
        <div className="h-64 bg-black/30 rounded-lg"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/50 text-red-400 p-4 rounded-lg border border-red-500/20">
        <AlertTriangle className="w-6 h-6 mb-2" />
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-black/50 backdrop-blur-sm p-6 rounded-lg border border-green-500/20">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Package className="w-6 h-6 text-green-500 mr-2" />
            <h2 className="text-2xl font-bold text-green-500">Products</h2>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={syncWithGoogleSheets}
              disabled={syncStatus.syncing}
              className="flex items-center bg-green-500/20 text-green-400 py-2 px-4 rounded-lg hover:bg-green-500/30 transition-colors border border-green-500/20"
            >
              <RefreshCw className={`w-5 h-5 mr-2 ${syncStatus.syncing ? 'animate-spin' : ''}`} />
              {syncStatus.syncing ? 'Syncing...' : 'Sync with Sheets'}
            </button>
            
            <button
              onClick={() => setEditingProduct({ id: '', name: '', description: '', price: 0, quantity: 0, created_at: '' })}
              className="flex items-center bg-green-500/20 text-green-400 py-2 px-4 rounded-lg hover:bg-green-500/30 transition-colors border border-green-500/20"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Product
            </button>
          </div>
        </div>

        {syncStatus.lastSync && (
          <p className="text-green-400/70 text-sm mb-4">
            Last synced: {syncStatus.lastSync.toLocaleString()}
          </p>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-green-500/20">
            <thead>
              <tr>
                <th className="px-6 py-3 bg-black/30 text-left text-xs font-medium text-green-400 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 bg-black/30 text-left text-xs font-medium text-green-400 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 bg-black/30 text-left text-xs font-medium text-green-400 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 bg-black/30 text-left text-xs font-medium text-green-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-green-500/20">
              {products.map((product) => (
                <tr key={product.id} className="bg-black/20">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-green-400">{product.name}</div>
                    <div className="text-xs text-green-500/70">{product.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-green-400">
                      ${product.price.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-green-400">
                      {product.quantity}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="p-1 text-green-400 hover:text-green-300"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-1 text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}