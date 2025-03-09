import React, { useState } from 'react';
import { Book, Lock, LogIn, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface ManualAuthProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function ManualAuth({ onSuccess, onCancel }: ManualAuthProps) {
  const [accessKey, setAccessKey] = useState('');
  const [newKey, setNewKey] = useState('');
  const [confirmKey, setConfirmKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showReset, setShowReset] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Verify access key against Supabase
      const { data, error: verifyError } = await supabase
        .from('manual_access_keys')
        .select('valid_until, reset_required')
        .eq('key', accessKey)
        .single();

      if (verifyError || !data) {
        throw new Error('Invalid access key');
      }

      const validUntil = new Date(data.valid_until);
      if (validUntil < new Date()) {
        throw new Error('Access key has expired');
      }

      if (data.reset_required) {
        setShowReset(true);
        setLoading(false);
        return;
      }

      toast.success('Access granted');
      onSuccess();
    } catch (err) {
      console.error('Manual auth error:', err);
      setError(err instanceof Error ? err.message : 'Authentication failed');
      toast.error('Invalid access key');
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (newKey.length < 8) {
        throw new Error('New key must be at least 8 characters');
      }

      if (newKey !== confirmKey) {
        throw new Error('Keys do not match');
      }

      // Update the access key
      const { error: updateError } = await supabase
        .from('manual_access_keys')
        .update({ 
          key: newKey,
          reset_required: false,
          valid_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
        })
        .eq('key', accessKey);

      if (updateError) throw updateError;

      toast.success('Access key updated successfully');
      onSuccess();
    } catch (err) {
      console.error('Key reset error:', err);
      setError(err instanceof Error ? err.message : 'Failed to reset key');
      toast.error('Failed to reset key');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50">
      <div className="bg-black/50 backdrop-blur-sm rounded-lg p-8 max-w-md w-full border border-[#39ff14]/20">
        <div className="flex items-center justify-center mb-8">
          <Book className="w-12 h-12 text-[#39ff14]" />
        </div>

        <h2 className="text-2xl font-bold text-[#39ff14] text-center mb-6">
          {showReset ? 'Reset Access Key' : 'Manual Access Required'}
        </h2>

        {error && (
          <div className="bg-red-900/50 text-red-400 p-4 rounded mb-6 border border-red-500/20">
            <AlertTriangle className="w-5 h-5 inline-block mr-2" />
            {error}
          </div>
        )}

        {!showReset ? (
          <form onSubmit={handleSubmit} className="space-y-6">
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

            <div className="flex gap-4">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 bg-black/30 text-[#39ff14]/70 py-3 px-4 rounded-lg hover:bg-[#39ff14]/10 transition-colors border border-[#39ff14]/20"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-[#39ff14]/20 text-[#39ff14] py-3 px-4 rounded-lg hover:bg-[#39ff14]/30 transition-colors border border-[#39ff14]/20 flex items-center justify-center"
              >
                {loading ? (
                  <span className="flex items-center">
                    <LogIn className="w-5 h-5 mr-2 animate-spin" />
                    Verifying...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <LogIn className="w-5 h-5 mr-2" />
                    Access Manual
                  </span>
                )}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleReset} className="space-y-6">
            <div className="bg-yellow-900/20 text-yellow-400 p-4 rounded-lg border border-yellow-500/20 mb-6">
              <AlertTriangle className="w-5 h-5 inline-block mr-2" />
              For security reasons, you must set a new access key
            </div>

            <div>
              <label htmlFor="newKey" className="block text-sm font-medium text-[#39ff14] mb-2">
                New Access Key
              </label>
              <input
                id="newKey"
                type="password"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                className="w-full bg-black/30 border border-[#39ff14]/20 rounded-lg py-2 px-4 text-[#39ff14] placeholder-[#39ff14]/50 focus:outline-none focus:border-[#39ff14]/50"
                placeholder="Enter new access key"
                required
                minLength={8}
              />
            </div>

            <div>
              <label htmlFor="confirmKey" className="block text-sm font-medium text-[#39ff14] mb-2">
                Confirm New Key
              </label>
              <input
                id="confirmKey"
                type="password"
                value={confirmKey}
                onChange={(e) => setConfirmKey(e.target.value)}
                className="w-full bg-black/30 border border-[#39ff14]/20 rounded-lg py-2 px-4 text-[#39ff14] placeholder-[#39ff14]/50 focus:outline-none focus:border-[#39ff14]/50"
                placeholder="Confirm new access key"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#39ff14]/20 text-[#39ff14] py-3 px-4 rounded-lg hover:bg-[#39ff14]/30 transition-colors border border-[#39ff14]/20 flex items-center justify-center"
            >
              {loading ? (
                <span className="flex items-center">
                  <LogIn className="w-5 h-5 mr-2 animate-spin" />
                  Updating...
                </span>
              ) : (
                <span className="flex items-center">
                  <LogIn className="w-5 h-5 mr-2" />
                  Set New Key
                </span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}