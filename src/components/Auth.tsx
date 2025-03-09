import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, LogIn } from 'lucide-react';

export function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <div className="bg-black/50 backdrop-blur-sm p-6 rounded-lg shadow-lg shadow-green-500/20 max-w-md mx-auto border border-green-500/20">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-green-500">
          {isLogin ? 'Login' : 'Sign Up'}
        </h2>
        {isLogin ? (
          <LogIn className="w-6 h-6 text-green-500" />
        ) : (
          <User className="w-6 h-6 text-green-500" />
        )}
      </div>

      {error && (
        <div className="bg-red-900/50 text-red-400 p-3 rounded mb-4 border border-red-500/20">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-green-400 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-black/30 border border-green-500/20 rounded-lg py-2 px-4 text-green-400 placeholder-green-500/50 focus:outline-none focus:border-green-500/50"
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-green-400 mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-black/30 border border-green-500/20 rounded-lg py-2 px-4 text-green-400 placeholder-green-500/50 focus:outline-none focus:border-green-500/50"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-green-500/20 text-green-400 py-3 px-4 rounded-lg hover:bg-green-500/30 transition-colors border border-green-500/20"
        >
          {isLogin ? 'Login' : 'Sign Up'}
        </button>

        <button
          type="button"
          onClick={() => setIsLogin(!isLogin)}
          className="w-full text-green-400 text-sm hover:text-green-300"
        >
          {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Login'}
        </button>
      </form>
    </div>
  );
}