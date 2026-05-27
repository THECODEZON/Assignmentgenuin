import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Lock, Mail, ChevronRight, AlertCircle, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export const Login: React.FC = () => {
  const { login, isAuthenticated, loading, error } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await login(email, password);
      toast.success('Logged in successfully! Welcome back.');
      navigate('/dashboard');
    } catch (err: any) {
      // toast.error is also handled or shown
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-radial-glow opacity-25 rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-radial-glow-cyan opacity-15 rounded-full pointer-events-none" />

      {/* Main card panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 100 }}
        className="w-full max-w-md p-8 rounded-2xl glass-panel glow-border-primary bg-gradient-to-tr from-zinc-950 to-zinc-900 shadow-2xl relative z-10"
      >
        {/* Title */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center font-bold text-white shadow-lg shadow-violet-900/40 text-xl mb-3">
            ⚔️
          </div>
          <h2 className="text-2xl font-extrabold text-white text-center tracking-wide">
            WELCOME BACK, HERO
          </h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">
            Sign in to check your quests
          </p>
        </div>

        {/* Global Error message */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-950/20 border border-rose-900/30 text-rose-400 flex items-center space-x-2 text-xs font-semibold">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email field */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hero@questcraft.com"
                className="w-full pl-11 pr-4 py-3 bg-zinc-900/50 border border-zinc-800 focus:border-violet-500 rounded-xl text-sm text-white placeholder-slate-600 outline-none transition"
              />
            </div>
          </div>

          {/* Password field */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 bg-zinc-900/50 border border-zinc-800 focus:border-violet-500 rounded-xl text-sm text-white placeholder-slate-600 outline-none transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white rounded-xl font-bold text-sm tracking-wide flex items-center justify-center space-x-2 transition-all hover:shadow-lg hover:shadow-violet-900/20 active:scale-95 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <Loader size={18} className="animate-spin" />
            ) : (
              <>
                <span>Enter Tavern</span>
                <ChevronRight size={16} />
              </>
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-slate-400 font-medium">
          New to the realm?{' '}
          <Link to="/register" className="text-violet-400 hover:text-violet-300 font-bold underline transition">
            Create an Account
          </Link>
        </p>
      </motion.div>
    </div>
  );
};
