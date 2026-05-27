import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Compass, Trophy, Award, Zap, ChevronRight, Swords, Sparkles } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export const Landing: React.FC = () => {
  const { isAuthenticated } = useAuthStore();

  const containerVariants: import('framer-motion').Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants: import('framer-motion').Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring' as const, stiffness: 100 } },
  };

  return (
    <div className="min-h-screen text-white relative overflow-hidden flex flex-col justify-between scanlines">
      {/* Decorative neon blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-radial-glow opacity-30 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-radial-glow-cyan opacity-20 pointer-events-none" />

      {/* Header */}
      <header className="max-w-7xl mx-auto w-full px-6 py-6 flex justify-between items-center relative z-10">
        <div className="flex items-center space-x-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center font-bold text-white shadow-lg shadow-violet-900/40 text-lg">
            ⚔️
          </div>
          <span className="font-display font-black text-xl tracking-wider">
            QUEST<span className="text-violet-400 glow-text-primary">CRAFT</span>
          </span>
        </div>
        
        <Link
          to={isAuthenticated ? '/dashboard' : '/login'}
          className="px-5 py-2.5 rounded-full border border-violet-500/30 hover:border-violet-500 bg-violet-950/20 hover:bg-violet-900/30 text-violet-400 hover:text-violet-300 font-bold text-sm tracking-wide transition-all shadow-md shadow-violet-950/50 cursor-pointer"
        >
          {isAuthenticated ? 'Enter App' : 'Sign In'}
        </Link>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto w-full px-6 py-12 md:py-24 grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10 flex-1">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center space-x-2 bg-violet-950/40 border border-violet-900/50 px-3 py-1 rounded-full text-violet-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles size={12} className="animate-spin" />
            <span>Inspired by Discord Quests</span>
          </motion.div>

          <motion.h1 variants={itemVariants} className="font-display text-4xl md:text-6xl font-black tracking-tight leading-tight">
            Embark on Your <br />
            <span className="bg-gradient-to-r from-violet-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              Epic Questing
            </span> <br />
            Adventure.
          </motion.h1>

          <motion.p variants={itemVariants} className="text-slate-400 text-lg leading-relaxed max-w-lg">
            Discover quests, join challenges, track real-time progress, upload proof, earn XP, unlock achievements, and climb the leaderboard standings.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-2">
            <Link
              to={isAuthenticated ? '/dashboard' : '/register'}
              className="group px-8 py-4 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-bold text-base tracking-wide flex items-center space-x-2 shadow-lg shadow-violet-800/20 hover:shadow-cyan-500/20 transition-all hover:scale-105 duration-300 cursor-pointer"
            >
              <span>Get Started Free</span>
              <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link
              to="/login"
              className="px-8 py-4 rounded-xl border border-border bg-card/20 hover:bg-card/50 text-slate-300 hover:text-white font-semibold text-base transition cursor-pointer hover:border-violet-500/30"
            >
              Explore Quests
            </Link>
          </motion.div>

          {/* User statistics preview */}
          <motion.div variants={itemVariants} className="grid grid-cols-3 gap-6 border-t border-border pt-8 max-w-md">
            <div>
              <p className="text-2xl font-bold text-white">100%</p>
              <p className="text-xs text-slate-500 font-semibold uppercase mt-0.5">Real-Time Sync</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">25+</p>
              <p className="text-xs text-slate-500 font-semibold uppercase mt-0.5">Epic Badges</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">5k+</p>
              <p className="text-xs text-slate-500 font-semibold uppercase mt-0.5">Active Questers</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Hero Graphic / Cards stack mockups */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, type: 'spring' }}
          className="relative flex justify-center items-center"
        >
          {/* Main card */}
          <div className="w-full max-w-md p-6 rounded-2xl glass-panel glow-border-primary glow-card bg-gradient-to-tr from-card to-card/65 relative z-20">
            <div className="flex justify-between items-start">
              <div className="bg-cyan-950/40 border border-cyan-800/30 text-cyan-400 text-[10px] font-bold tracking-widest px-2 py-0.5 rounded-full uppercase">
                Active Quest
              </div>
              <span className="text-xs text-slate-500 font-medium">Expires in 2 days</span>
            </div>

            <h3 className="text-xl font-bold mt-4 flex items-center space-x-2">
              <Swords size={20} className="text-violet-500" />
              <span>Gamer Guild Champion</span>
            </h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Complete 5 competitive matchups and stream your gameplay in the community channel to claim this exclusive profile card badge.
            </p>

            {/* Progress */}
            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-400">Match Completion Progress</span>
                <span className="text-cyan-400">3 / 5 completed</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-violet-600 to-cyan-400 rounded-full w-[60%]" />
              </div>
            </div>

            {/* Rewards info */}
            <div className="mt-6 flex justify-between items-center pt-4 border-t border-border">
              <div className="flex space-x-4">
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase">XP Reward</p>
                  <p className="text-sm font-bold text-violet-400">+500 XP</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Tokens</p>
                  <p className="text-sm font-bold text-cyan-400">200 pts</p>
                </div>
              </div>
              <div className="flex items-center space-x-1.5 bg-card border border-border py-1 px-2.5 rounded-lg text-xs font-bold text-yellow-500">
                <Award size={14} />
                <span>Champion Badge</span>
              </div>
            </div>
          </div>

          {/* Underlay Cards */}
          <div className="absolute w-[90%] max-w-[380px] p-6 rounded-2xl glass-panel bg-card border border-border opacity-40 top-8 z-10 translate-y-2 translate-x-4 scale-95 pointer-events-none" />
          <div className="absolute w-[80%] max-w-[340px] p-6 rounded-2xl glass-panel bg-card border border-border opacity-20 top-16 z-0 translate-y-4 translate-x-8 scale-90 pointer-events-none" />
        </motion.div>
      </main>

      {/* Feature Grid */}
      <section className="bg-background/80 backdrop-blur-md border-t border-border relative z-10 py-16 px-6">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="p-6 rounded-2xl bg-card/20 border border-border hover:border-violet-500/30 transition glow-card">
            <div className="w-10 h-10 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-4">
              <Compass size={20} />
            </div>
            <h4 className="text-base font-bold text-white">Daily & Weekly Quests</h4>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Explore dynamic challenge rotations matching your game playstyles. Refreshed daily and weekly.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-card/20 border border-border hover:border-violet-500/30 transition glow-card">
            <div className="w-10 h-10 rounded-xl bg-cyan-600/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4">
              <Zap size={20} />
            </div>
            <h4 className="text-base font-bold text-white">Real-time Progress</h4>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              WS connected server tracking progress percentage. Level-up immediately on quest approvals.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-card/20 border border-border hover:border-violet-500/30 transition glow-card">
            <div className="w-10 h-10 rounded-xl bg-pink-600/10 border border-pink-500/20 flex items-center justify-center text-pink-400 mb-4">
              <Award size={20} />
            </div>
            <h4 className="text-base font-bold text-white">Badges & Achievements</h4>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Claim custom badge unlocks and display them proudly in your user achievement gallery.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-card/20 border border-border hover:border-violet-500/30 transition glow-card">
            <div className="w-10 h-10 rounded-xl bg-amber-600/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4">
              <Trophy size={20} />
            </div>
            <h4 className="text-base font-bold text-white">Global Leaderboard</h4>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Compete against players worldwide. Accumulate XP points to secure the 1st place podium.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/60 py-6 text-center text-xs text-slate-600 relative z-10 px-6">
        <div className="max-w-7xl mx-auto w-full flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} QuestCraft. All rights reserved.</p>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-slate-400 transition">Terms of Service</a>
            <a href="#" className="hover:text-slate-400 transition">Privacy Policy</a>
            <a href="#" className="hover:text-slate-400 transition">API Documentation</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
