import React, { useState, useEffect } from 'react';
import { apiFetch } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { Trophy, Medal } from 'lucide-react';
import { motion } from 'framer-motion';

interface LeaderboardUser {
  id: string;
  username: string;
  level: number;
  xp: number;
  points: number;
  rank: number;
}

export const Leaderboard: React.FC = () => {
  const { user } = useAuthStore();
  const [standings, setStandings] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const data = await apiFetch('/leaderboard');
      // Append ranks manually based on array index
      const rankedData = data.map((u: any, index: number) => ({
        ...u,
        rank: index + 1,
      }));
      setStandings(rankedData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();

    // Listen for WebSocket real-time updates
    const handleLeaderboardRefresh = () => {
      fetchLeaderboard();
    };
    window.addEventListener('leaderboard-updated', handleLeaderboardRefresh);
    return () => window.removeEventListener('leaderboard-updated', handleLeaderboardRefresh);
  }, []);

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500" />
      </div>
    );
  }

  // Slice top 3 for podium layout
  const topThree = standings.slice(0, 3);
  // Sort podium specifically to render [2nd, 1st, 3rd] visually
  const visualPodium = [];
  if (topThree[1]) visualPodium.push(topThree[1]); // 2nd
  if (topThree[0]) visualPodium.push(topThree[0]); // 1st
  if (topThree[2]) visualPodium.push(topThree[2]); // 3rd


  return (
    <div className="space-y-10">
      
      {/* Title Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-2 bg-yellow-950/20 border border-yellow-900/30 px-4 py-1.5 rounded-full text-yellow-500 text-xs font-bold uppercase tracking-wider">
          <Trophy size={14} />
          <span>Hall of Fame</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-extrabold text-white">
          GLOBAL STANDINGS
        </h2>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Compete in quests, gain experience points, and cement your name on the server leaderboard.
        </p>
      </div>

      {/* Visual Podium (Top 3 Users) */}
      {topThree.length > 0 && (
        <div className="flex flex-col md:flex-row items-end justify-center gap-6 md:gap-4 max-w-3xl mx-auto pt-6">
          
          {/* 2nd Place */}
          {topThree[1] && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="w-full md:w-56 glass-panel rounded-2xl p-5 border border-zinc-800 text-center flex flex-col items-center bg-zinc-900/10 order-2 md:order-1 h-64 justify-between"
            >
              <div className="space-y-2">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full bg-slate-700/30 border-2 border-slate-400 flex items-center justify-center text-white text-base font-bold uppercase">
                    {topThree[1].username.substring(0, 2)}
                  </div>
                  <Medal size={20} className="absolute -bottom-1 -right-1 text-slate-400 bg-zinc-950 rounded-full" />
                </div>
                <h3 className="font-bold text-white text-sm mt-2 line-clamp-1">{topThree[1].username}</h3>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Lvl {topThree[1].level}</span>
              </div>
              
              <div className="w-full bg-zinc-900/50 py-2.5 rounded-xl border border-zinc-900 mt-4">
                <span className="text-xs font-black text-slate-300">{topThree[1].xp} XP</span>
              </div>
            </motion.div>
          )}

          {/* 1st Place */}
          {topThree[0] && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="w-full md:w-64 glass-panel rounded-2xl p-6 border border-yellow-500/20 text-center flex flex-col items-center bg-yellow-950/5 order-1 md:order-2 h-76 justify-between relative"
            >
              {/* Crown indicator */}
              <div className="absolute -top-6 text-yellow-500 animate-bounce">
                👑
              </div>

              <div className="space-y-3">
                <div className="relative">
                  <div className="w-18 h-18 rounded-full bg-yellow-600/10 border-2 border-yellow-500 flex items-center justify-center text-white text-lg font-bold uppercase">
                    {topThree[0].username.substring(0, 2)}
                  </div>
                  <Medal size={22} className="absolute -bottom-1 -right-1 text-yellow-500 bg-zinc-950 rounded-full" />
                </div>
                <h3 className="font-extrabold text-white text-base mt-2 line-clamp-1 flex items-center justify-center space-x-1">
                  <span>{topThree[0].username}</span>
                </h3>
                <span className="text-xs font-extrabold text-yellow-500/80 uppercase tracking-widest block">Lvl {topThree[0].level}</span>
              </div>
              
              <div className="w-full bg-yellow-950/20 py-3 rounded-xl border border-yellow-900/30 mt-4">
                <span className="text-sm font-black text-yellow-400">{topThree[0].xp} XP</span>
              </div>
            </motion.div>
          )}

          {/* 3rd Place */}
          {topThree[2] && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="w-full md:w-56 glass-panel rounded-2xl p-5 border border-zinc-800 text-center flex flex-col items-center bg-zinc-900/10 order-3 h-58 justify-between"
            >
              <div className="space-y-2">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-amber-900/10 border-2 border-amber-600/60 flex items-center justify-center text-white text-sm font-bold uppercase">
                    {topThree[2].username.substring(0, 2)}
                  </div>
                  <Medal size={18} className="absolute -bottom-1 -right-1 text-amber-600 bg-zinc-950 rounded-full" />
                </div>
                <h3 className="font-bold text-white text-sm mt-2 line-clamp-1">{topThree[2].username}</h3>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Lvl {topThree[2].level}</span>
              </div>
              
              <div className="w-full bg-zinc-900/50 py-2.5 rounded-xl border border-zinc-900 mt-4">
                <span className="text-xs font-black text-amber-500">{topThree[2].xp} XP</span>
              </div>
            </motion.div>
          )}

        </div>
      )}

      {/* Rankings List (Table) */}
      <div className="max-w-4xl mx-auto rounded-2xl glass-panel border border-zinc-900 overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-900 bg-zinc-900/20">
          <h3 className="text-sm font-bold text-white uppercase tracking-widest">Global Rankings</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-900 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                <th className="py-4 px-6 text-center w-16">Rank</th>
                <th className="py-4 px-6">Hero Username</th>
                <th className="py-4 px-6 text-center">Level</th>
                <th className="py-4 px-6 text-right">Points</th>
                <th className="py-4 px-6 text-right">Experience</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900/50">
              {standings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs text-slate-500">
                    No heroes found. Register and complete quests to top the charts!
                  </td>
                </tr>
              ) : (
                standings.map((u) => {
                  const isCurrentUser = user && u.id === user.id;
                  return (
                    <tr
                      key={u.id}
                      className={`
                        transition-all
                        ${isCurrentUser ? 'bg-violet-950/15 font-semibold text-violet-300' : 'text-slate-350 hover:bg-zinc-900/20'}
                      `}
                    >
                      {/* Rank Column */}
                      <td className="py-4 px-6 text-center font-bold text-xs">
                        {u.rank === 1 ? '🥇' : u.rank === 2 ? '🥈' : u.rank === 3 ? '🥉' : u.rank}
                      </td>

                      {/* Username Column */}
                      <td className="py-4 px-6 flex items-center space-x-3">
                        <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700/80 flex items-center justify-center text-[10px] font-black uppercase text-slate-300">
                          {u.username.substring(0, 2)}
                        </div>
                        <span className="text-xs text-white">{u.username}</span>
                        {isCurrentUser && (
                          <span className="text-[8px] bg-violet-600 text-white font-bold uppercase tracking-wider px-1.5 py-0.5 rounded">
                            You
                          </span>
                        )}
                      </td>

                      {/* Level Column */}
                      <td className="py-4 px-6 text-center text-xs font-bold">
                        {u.level}
                      </td>

                      {/* Points Column */}
                      <td className="py-4 px-6 text-right text-xs font-black text-cyan-400">
                        {u.points}
                      </td>

                      {/* XP Column */}
                      <td className="py-4 px-6 text-right text-xs font-black text-violet-400">
                        {u.xp} XP
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
