import React, { useState } from 'react';
import { Shield, LogIn } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export function AdminLogin() {
  const [email, setEmail] = useState('phunguss10@gmail.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      console.log('Attempting admin login with:', email);
      
      const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) {
        console.error('Sign in error:', signInError);
        throw signInError;
      }

      console.log('User signed in:', user);

      // Check if user has admin role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user?.id)
        .single();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        throw profileError;
      }

      console.log('User profile:', profile);

      if (profile?.role !== 'admin') {
        throw new Error('Unauthorized access - not an admin');
      }

      // Success - redirect to admin panel
      toast.success('Welcome back, admin!');
      navigate('/admin');
      
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Login failed');
      toast.error(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-black/50 backdrop-blur-sm rounded-lg shadow-lg shadow-[#39ff14]/20 p-8 max-w-md w-full border border-[#39ff14]/20">
        <div className="flex items-center justify-center mb-8">
          <Shield className="w-12 h-12 text-[#39ff14]" />
        </div>

        <h1 className="text-2xl font-bold text-[#39ff14] text-center mb-6">
          Admin Access
        </h1>

        {error && (
          <div className="bg-red-900/50 text-red-400 p-4 rounded mb-6 border border-red-500/20">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#39ff14] mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/30 border border-[#39ff14]/20 rounded-lg py-2 px-4 text-[#39ff14] placeholder-[#39ff14]/50 focus:outline-none focus:border-[#39ff14]/50"
              placeholder="admin@example.com"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#39ff14] mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/30 border border-[#39ff14]/20 rounded-lg py-2 px-4 text-[#39ff14] placeholder-[#39ff14]/50 focus:outline-none focus:border-[#39ff14]/50"
              placeholder="••••••••"
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
                Authenticating...
              </span>
            ) : (
              <span className="flex items-center">
                <LogIn className="w-5 h-5 mr-2" />
                Login
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}