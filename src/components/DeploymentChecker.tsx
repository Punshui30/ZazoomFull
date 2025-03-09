import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, RefreshCw, ExternalLink } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function DeploymentChecker() {
  const [status, setStatus] = useState<'checking' | 'success' | 'error'>('checking');
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const deployUrl = window.location.origin;

  useEffect(() => {
    checkDeployment();
  }, []);

  const checkDeployment = async () => {
    setStatus('checking');
    setError(null);
    
    try {
      // Check Supabase connection
      const { data, error: supabaseError } = await supabase
        .from('profiles')
        .select('count')
        .single();

      if (supabaseError && supabaseError.code !== 'PGRST116') {
        throw supabaseError;
      }
      
      setStatus('success');
    } catch (err) {
      console.error('Deployment check failed:', err);
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    }
  };

  const handleRetry = async () => {
    setIsRetrying(true);
    await checkDeployment();
    setIsRetrying(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-black/50 backdrop-blur-sm rounded-lg p-8 max-w-md w-full border border-green-500/20">
        <h1 className="text-2xl font-bold text-green-500 text-center mb-6">Deployment Status</h1>
        
        {status === 'checking' && (
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-green-400">Checking deployment status...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <p className="text-green-400 mb-4">Your project is live!</p>
            <div className="p-4 bg-black/30 rounded-lg border border-green-500/20">
              <p className="text-green-400/70 text-sm mb-2">View your project at:</p>
              <a
                href={deployUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-400 hover:text-green-300 flex items-center justify-between break-all"
              >
                <span>{deployUrl}</span>
                <ExternalLink className="w-4 h-4 ml-2 flex-shrink-0" />
              </a>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-400 mb-4">
              {error || 'Failed to check deployment status'}
            </p>
            <div className="bg-red-900/20 p-4 rounded-lg mb-4">
              <p className="text-red-400/80 text-sm">
                Please make sure:
                <br />1. You've clicked "Connect to Supabase" in the top right
                <br />2. Your database tables are set up correctly
                <br />3. Your environment variables are configured
              </p>
            </div>
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className="bg-red-500/20 text-red-400 px-4 py-2 rounded hover:bg-red-500/30 transition-colors disabled:opacity-50 flex items-center justify-center w-full"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRetrying ? 'animate-spin' : ''}`} />
              {isRetrying ? 'Retrying...' : 'Try Again'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}