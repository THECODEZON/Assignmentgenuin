import React, { useState, useEffect } from 'react';
import { apiFetch } from '../services/api';
import type { Quest } from '../types';
import { useAuthStore } from '../store/useAuthStore';
import { Compass, Clock, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'DAILY' | 'WEEKLY' | 'ACHIEVEMENT'>('ALL');

  const fetchQuests = async () => {
    try {
      setLoading(true);
      // Fetch only published quests for discover board
      const data = await apiFetch(`/quests?status=PUBLISHED`);
      setQuests(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuests();

    // Listen for socket events to refetch quests dynamically
    const handleRefetch = () => {
      fetchQuests();
    };
    window.addEventListener('quests-expired', handleRefetch);
    return () => window.removeEventListener('quests-expired', handleRefetch);
  }, []);

  const filteredQuests = quests.filter((q) => {
    if (activeFilter === 'ALL') return true;
    return q.type === activeFilter;
  });

  const getQuestStatus = (quest: Quest) => {
    if (!quest.submissions || quest.submissions.length === 0) return 'OPEN';
    return quest.submissions[0].status; // PENDING, APPROVED, REJECTED
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner / Header Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-gradient-to-r from-violet-950/20 to-cyan-950/10 border border-[rgba(255,255,255,0.06)] p-6 rounded-2xl">
        <div className="space-y-2">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white flex items-center space-x-2">
            <span>Welcome, {user?.username}!</span>
            <span className="animate-bounce">👋</span>
          </h2>
          <p className="text-sm text-slate-400">
            Explore the available quests, complete challenges, and claim your rewards!
          </p>
        </div>

        {/* Mini stats cards */}
        <div className="flex items-center space-x-4">
          <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl text-center w-24">
            <p className="text-2xl font-black text-violet-400">{user?.level}</p>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-1">Level</p>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl text-center w-24">
            <p className="text-2xl font-black text-cyan-400">{user?.points}</p>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-1">Points</p>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl text-center w-24">
            <p className="text-2xl font-black text-emerald-400">{user?.xp}</p>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-1">Total XP</p>
          </div>
        </div>
      </div>

      {/* Filter Options */}
      <div className="flex flex-wrap items-center gap-2 border-b border-zinc-900 pb-4">
        {(['ALL', 'DAILY', 'WEEKLY', 'ACHIEVEMENT'] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`
              px-4 py-2 rounded-xl text-xs font-bold tracking-wider uppercase transition cursor-pointer
              ${activeFilter === filter 
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/30' 
                : 'bg-zinc-900/50 border border-zinc-800 text-slate-400 hover:text-white hover:bg-zinc-900'
              }
            `}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Quests Display */}
      {loading ? (
        // Skeletons
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 rounded-2xl bg-zinc-900/40 border border-zinc-850 animate-pulse p-6 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="h-4 bg-zinc-800 w-1/4 rounded" />
                <div className="h-6 bg-zinc-800 w-3/4 rounded" />
                <div className="h-4 bg-zinc-800 w-full rounded" />
              </div>
              <div className="h-10 bg-zinc-800 rounded-xl w-full" />
            </div>
          ))}
        </div>
      ) : filteredQuests.length === 0 ? (
        <div className="p-12 text-center rounded-2xl glass-panel border border-zinc-900">
          <Compass size={40} className="text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white">No quests found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            All active challenges are completed or expired. Check back later for new quest releases!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuests.map((quest) => {
            const status = getQuestStatus(quest);
            return (
              <motion.div
                key={quest.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="rounded-2xl glass-panel glow-card flex flex-col justify-between p-6 h-68 relative overflow-hidden group bg-gradient-to-tr from-zinc-950 to-zinc-900 border border-zinc-800/40"
              >
                {/* Header card info */}
                <div>
                  <div className="flex justify-between items-center">
                    <span className={`
                      text-[9px] font-black tracking-widest px-2.5 py-1 rounded-full uppercase
                      ${quest.type === 'DAILY' ? 'bg-amber-950/40 border border-amber-900/30 text-amber-400' : ''}
                      ${quest.type === 'WEEKLY' ? 'bg-violet-950/40 border border-violet-900/30 text-violet-400' : ''}
                      ${quest.type === 'ACHIEVEMENT' ? 'bg-cyan-950/40 border border-cyan-800/30 text-cyan-400' : ''}
                    `}>
                      {quest.type}
                    </span>

                    {/* Expiry info */}
                    {quest.expiresAt && (
                      <span className="text-[10px] text-slate-500 font-medium flex items-center space-x-1">
                        <Clock size={10} />
                        <span>
                          {new Date(quest.expiresAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-white mt-4 line-clamp-1 group-hover:text-violet-400 transition">
                    {quest.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {quest.description}
                  </p>
                </div>

                {/* Footer card info */}
                <div className="space-y-4 pt-4 border-t border-zinc-900">
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-4">
                      <div>
                        <span className="text-[9px] text-slate-500 font-bold uppercase block">XP</span>
                        <span className="text-xs font-bold text-violet-400">+{quest.rewardXp}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 font-bold uppercase block">Points</span>
                        <span className="text-xs font-bold text-cyan-400">+{quest.rewardPoints}</span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span className={`
                      text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded
                      ${status === 'OPEN' ? 'bg-zinc-800 text-slate-300' : ''}
                      ${status === 'PENDING' ? 'bg-amber-500/10 border border-amber-900/30 text-amber-400' : ''}
                      ${status === 'APPROVED' ? 'bg-emerald-500/10 border border-emerald-900/30 text-emerald-400' : ''}
                      ${status === 'REJECTED' ? 'bg-rose-500/10 border border-rose-900/30 text-rose-400' : ''}
                    `}>
                      {status === 'APPROVED' ? 'Completed' : status}
                    </span>
                  </div>

                  <Link
                    to={`/quests/${quest.id}`}
                    className="w-full py-2.5 rounded-xl bg-zinc-900/80 group-hover:bg-violet-600 text-white font-bold text-xs tracking-wider uppercase flex items-center justify-center space-x-1.5 border border-zinc-800 group-hover:border-violet-600 transition-all cursor-pointer"
                  >
                    <span>View Quest</span>
                    <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
