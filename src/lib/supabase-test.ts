import { supabase } from './supabase';

async function testConnection() {
  try {
    const { data, error } = await supabase.from('profiles').select('count');
    
    if (error) {
      console.error('Supabase connection error:', error);
      return false;
    }
    
    console.log('Supabase connection successful');
    return true;
  } catch (err) {
    console.error('Supabase test failed:', err);
    return false;
  }
}

testConnection();