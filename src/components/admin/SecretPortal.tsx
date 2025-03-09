import React, { useState } from 'react';
import { Shield, Lock, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export function SecretPortal() {
  const [accessKey, setAccessKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Verify access key
      const { data: keyData, error: keyError } = await supabase
        .from('manual_access_keys')
        .select('*')
        .eq('key', accessKey)
        .single();

      if (keyError || !keyData) {
        throw new Error('Invalid access key');
      }

      if (keyData.valid_until < new Date().toISOString()) {
        throw new Error('Access key has expired');
      }

      // Update last used timestamp
      await supabase
        .from('manual_access_keys')
        .update({ last_used_at: new Date().toISOString() })
        .eq('id', keyData.id);

      // Log access attempt
      await supabase
        .from('admin_audit_logs')
        .insert({
          user_id: keyData.created_by,
          action: 'manual_access',
          details: { method: 'secret_portal' }
        });

      // Success - redirect to admin panel
      toast.success('Access granted');
      navigate('/admin');
    } catch (err) {
      console.error('Access error:', err);
      setError(err instanceof Error ? err.message : 'Access denied');
      toast.error('Access denied');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50">
      <div className="bg-black/50 backdrop-blur-sm rounded-lg p-8 max-w-md w-full border border-[#39ff14]/20">
        <div className="flex items-center justify-center mb-8">
          <Shield className="w-12 h-12 text-[#39ff14]" />
        </div>

        <h2 className="text-2xl font-bold text-[#39ff14] text-center mb-6">
          Restricted Access
        </h2>

        {error && (
          <div className="bg-red-900/50 text-red-400 p-4 rounded mb-6 border border-red-500/20">
            <AlertTriangle className="w-5 h-5 inline-block mr-2" />
            {error}
          </div>
        )}

        <form onSubmit={handleAccess} className="space-y-6">
          <div>
            <label htmlFor="accessKey" className="block text-sm font-medium text-[#39ff14] mb-2">
              Access Key
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#39ff14]/50" />
              <input
                id="accessKey"
                type="password"
                value={accessKey}
                onChange={(e) => setAccessKey(e.target.value)}
                className="w-full bg-black/30 border border-[#39ff14]/20 rounded-lg py-2 pl-10 pr-4 text-[#39ff14] placeholder-[#39ff14]/50 focus:outline-none focus:border-[#39ff14]/50"
                placeholder="Enter access key"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#39ff14]/20 text-[#39ff14] py-3 px-4 rounded-lg hover:bg-[#39ff14]/30 transition-colors border border-[#39ff14]/20 flex items-center justify-center"
          >
            {loading ? (
              <span className="flex items-center">
                <Lock className="w-5 h-5 mr-2 animate-spin" />
                Verifying...
              </span>
            ) : (
              <span className="flex items-center">
                <Lock className="w-5 h-5 mr-2" />
                Access Portal
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}