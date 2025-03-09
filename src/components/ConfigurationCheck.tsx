import React, { useEffect, useState } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ConfigProps {
  children: React.ReactNode;
}

export function ConfigurationCheck({ children }: ConfigProps) {
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkConfiguration();
  }, []);

  const checkConfiguration = async () => {
    try {
      // Check if we have the required settings
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        throw new Error("Missing Supabase settings. Please make sure you've connected to Supabase using the 'Connect to Supabase' button in the top right corner.");
      }

      // Test Supabase connection
      const { error: supabaseError } = await supabase.from('profiles').select('count');
      if (supabaseError && supabaseError.code !== 'PGRST116') {
        throw new Error('Failed to connect to Supabase. Please check your connection settings.');
      }

      setChecking(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown configuration error');
      setChecking(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-black/50 backdrop-blur-sm rounded-lg p-8 max-w-md w-full border border-green-500/20">
          <div className="flex items-center justify-center mb-4">
            <RefreshCw className="w-12 h-12 text-green-500 animate-spin" />
          </div>
          <p className="text-green-400 text-center">Checking configuration...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-black/50 backdrop-blur-sm rounded-lg p-8 max-w-md w-full border border-red-500/20">
          <div className="flex items-center justify-center mb-4">
            <AlertTriangle className="w-12 h-12 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-red-500 text-center mb-4">
            Configuration Error
          </h1>
          <div className="space-y-4">
            <p className="text-red-400 text-center">{error}</p>
            <div className="bg-red-900/20 p-4 rounded-lg">
              <p className="text-red-400/80 text-sm">
                To fix this:
                <br />1. Look for the "Connect to Supabase" button in the top right
                <br />2. Click it and follow the setup steps
                <br />3. The page will reload automatically when connected
              </p>
            </div>
            <button
              onClick={checkConfiguration}
              className="w-full bg-red-500/20 text-red-400 py-3 px-4 rounded-lg hover:bg-red-500/30 transition-colors border border-red-500/20 flex items-center justify-center"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}