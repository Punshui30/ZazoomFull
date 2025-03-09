import { supabase } from './supabase';

// Initialize database tables
export async function initializeDatabase() {
  try {
    // First check if we can connect to Supabase
    const { data: healthCheck, error: healthError } = await supabase.from('profiles').select('count');
    
    if (healthError && healthError.code === 'PGRST116') {
      console.log('Database connected, tables will be created by migrations');
      return true;
    }

    if (healthError) {
      throw new Error(`Database connection failed: ${healthError.message}`);
    }

    console.log('Database connection established');
    return true;
  } catch (error) {
    if (error.code === 'PGRST116') {
      return true;
    }
    throw new Error(`Database initialization failed: ${error.message}`);
  }
}

// Validate all required environment variables
export function validateConfig() {
  const required = {
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
    VITE_ADMIN_WALLET: import.meta.env.VITE_ADMIN_WALLET,
  };

  const missing = Object.entries(required)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  return true;
}

// Get configuration with proper error handling
export function getRequiredConfig() {
  try {
    validateConfig();
    
    return {
      supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
      supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      adminWallet: import.meta.env.VITE_ADMIN_WALLET,
      isConfigured: true
    };
  } catch (error) {
    console.error('Configuration error:', error);
    return {
      isConfigured: false,
      error: error.message
    };
  }
}