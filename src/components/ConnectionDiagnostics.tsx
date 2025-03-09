import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { testApiConnection } from '../lib/api';

export function ConnectionDiagnostics() {
  const [checks, setChecks] = useState({
    backend: { status: 'pending', error: null },
    supabase: { status: 'pending', error: null }
  });

  const runDiagnostics = async () => {
    // Reset states
    setChecks({
      backend: { status: 'checking', error: null },
      supabase: { status: 'checking', error: null }
    });

    // Check backend connection
    try {
      const isConnected = await testApiConnection();
      setChecks(prev => ({
        ...prev,
        backend: { 
          status: isConnected ? 'success' : 'error',
          error: isConnected ? null : 'Backend health check failed'
        }
      }));
    } catch (error) {
      setChecks(prev => ({
        ...prev,
        backend: {
          status: 'error',
          error: error instanceof Error ? error.message : 'Backend connection failed'
        }
      }));
    }

    // Check Supabase connection
    try {
      const { data, error } = await supabase.from('profiles').select('count');
      if (error && error.code !== 'PGRST116') throw error;
      setChecks(prev => ({
        ...prev,
        supabase: { status: 'success', error: null }
      }));
    } catch (error) {
      setChecks(prev => ({
        ...prev,
        supabase: {
          status: 'error',
          error: error instanceof Error ? error.message : 'Supabase connection failed'
        }
      }));
    }
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-black/50 backdrop-blur-sm rounded-lg p-8 max-w-md w-full border border-[#39ff14]/20">
        <h1 className="text-2xl font-bold text-[#39ff14] text-center mb-6">Connection Diagnostics</h1>
        
        <div className="space-y-4 mb-6">
          {Object.entries(checks).map(([key, { status, error }]) => (
            <div key={key} className="bg-black/30 p-4 rounded-lg border border-[#39ff14]/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[#39ff14] font-semibold capitalize">{key} Connection</span>
                {status === 'success' && <CheckCircle2 className="w-5 h-5 text-[#39ff14]" />}
                {status === 'error' && <AlertTriangle className="w-5 h-5 text-red-500" />}
                {status === 'checking' && <RefreshCw className="w-5 h-5 text-yellow-500 animate-spin" />}
              </div>
              {error && (
                <p className="text-red-400 text-sm mt-2">{error}</p>
              )}
              {status === 'success' && (
                <p className="text-[#39ff14]/70 text-sm mt-2">Connection established successfully</p>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={runDiagnostics}
          className="w-full bg-[#39ff14]/20 text-[#39ff14] py-3 px-4 rounded-lg hover:bg-[#39ff14]/30 transition-colors border border-[#39ff14]/20 flex items-center justify-center"
        >
          <RefreshCw className="w-5 h-5 mr-2" />
          Run Diagnostics Again
        </button>
      </div>
    </div>
  );
}