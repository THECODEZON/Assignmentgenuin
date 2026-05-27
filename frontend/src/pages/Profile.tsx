import React, { useState, useEffect } from 'react';
import { apiFetch } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { CalendarDays, Trophy, Activity } from 'lucide-react';
import toast from 'react-hot-toast';

interface TimelineItem {
  id: string;
  type: 'QUEST_COMPLETION' | 'ACHIEVEMENT_UNLOCK';
  title: string;
  timestamp: string;
  xpEarned?: number;
  badgeUrl?: string;
}

interface AchievementWithStatus {
  id: string;
  name: string;
  description: string;
  badgeUrl: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export const Profile: React.FC = () => {
  const { user } = useAuthStore();
  const [profileData, setProfileData] = useState<any>(null);
  const [allAchievements, setAllAchievements] = useState<AchievementWithStatus[]>([]);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        setLoading(true);
        // Fetch detailed profile calculations
        const profile = await apiFetch(`/users/${user.id}`);
        setProfileData(profile.user);
        setTimeline(profile.activityTimeline);

        // Fetch all achievements from achievements directory
        const achievementsData = await apiFetch('/achievements');
        const unlockedIds = new Set(profile.achievements.map((a: any) => a.achievementId));

        // Map status
        const achievementsWithStatus = achievementsData.map((ach: any) => {
          const unlockedItem = profile.achievements.find((a: any) => a.achievementId === ach.id);
          return {
            ...ach,
            unlocked: unlockedIds.has(ach.id),
            unlockedAt: unlockedItem?.unlockedAt,
          };
        });

        setAllAchievements(achievementsWithStatus);
      } catch (err: any) {
        toast.error('Failed to load profile details');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  if (loading || !profileData) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500" />
      </div>
    );
  }

  // Level calculations
  const xp = profileData.xp || 0;
  const level = profileData.level || 1;
  const xpInCurrentLevel = xp % 1000;
  const xpPercent = (xpInCurrentLevel / 1000) * 100;

  return (
    <div className="space-y-8">
      
      {/* Profile Header Box */}
      <div className="rounded-2xl glass-panel bg-gradient-to-tr from-zinc-950 to-zinc-900 border border-zinc-800/40 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Large Avatar */}
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center text-white text-3xl font-extrabold uppercase shadow-xl shadow-violet-950/50">
            {profileData.username.substring(0, 2)}
          </div>
          
          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-extrabold text-white">{profileData.username}</h2>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <span className="text-[10px] font-black tracking-widest px-2.5 py-1 rounded bg-violet-950/40 border border-violet-900/30 text-violet-400 uppercase">
                Lvl {level} Hero
              </span>
              <span className="text-xs text-slate-500 font-semibold flex items-center space-x-1">
                <CalendarDays size={14} />
                <span>Joined {new Date(profileData.createdAt).toLocaleDateString([], { month: 'short', year: 'numeric' })}</span>
              </span>
            </div>
          </div>
        </div>

        {/* XP and Level Bar */}
        <div className="w-full md:w-80 space-y-2 bg-zinc-900/40 p-4 rounded-xl border border-zinc-900">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-slate-400">Level Progression</span>
            <span className="text-violet-400">{xpInCurrentLevel} / 1000 XP ({Math.round(xpPercent)}%)</span>
          </div>
          <div className="h-2.5 w-full bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-violet-500 to-cyan-400 rounded-full transition-all duration-500"
              style={{ width: `${xpPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Grid of Achievements & Activity Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Achievements Gallery (Left 2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl glass-panel bg-gradient-to-tr from-zinc-950 to-zinc-900 border border-zinc-800/40 p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center space-x-2">
                <Trophy size={16} className="text-yellow-500" />
                <span>Achievement Unlocks</span>
              </h3>
              <span className="text-xs text-slate-500 font-bold">
                {allAchievements.filter(a => a.unlocked).length} / {allAchievements.length} Unlocked
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {allAchievements.map((ach) => (
                <div 
                  key={ach.id} 
                  className={`
                    p-4 rounded-xl border flex items-center space-x-3 transition-all
                    ${ach.unlocked 
                      ? 'bg-zinc-900/40 border-zinc-800/60' 
                      : 'bg-zinc-950 border-zinc-900/40 opacity-40'
                    }
                  `}
                >
                  <div className={`
                    w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold shadow-md
                    ${ach.unlocked 
                      ? 'bg-violet-950/20 border border-violet-800/40 text-violet-400' 
                      : 'bg-zinc-900 border border-zinc-850 text-slate-650'
                    }
                  `}>
                    {ach.badgeUrl}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">{ach.name}</h4>
                    <p className="text-[10px] text-slate-500 leading-normal mt-0.5">{ach.description}</p>
                    {ach.unlockedAt && (
                      <span className="text-[8px] text-violet-400 font-semibold block mt-1 uppercase">
                        Unlocked {new Date(ach.unlockedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Activity Timeline Log (Right 1 col) */}
        <div className="space-y-6">
          <div className="rounded-2xl glass-panel bg-gradient-to-tr from-zinc-950 to-zinc-900 border border-zinc-800/40 p-6 space-y-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center space-x-2">
              <Activity size={16} className="text-violet-500" />
              <span>Activity Log</span>
            </h3>

            {timeline.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No recent actions completed.
              </div>
            ) : (
              <div className="relative border-l border-zinc-900 pl-4 space-y-6">
                {timeline.map((act) => (
                  <div key={act.id} className="relative">
                    {/* Timeline Node */}
                    <div className={`
                      absolute -left-[21px] top-0.5 w-2.5 h-2.5 rounded-full border-2 border-zinc-950
                      ${act.type === 'QUEST_COMPLETION' ? 'bg-emerald-500' : 'bg-violet-500'}
                    `} />
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-200">{act.title}</p>
                      <div className="flex justify-between items-center text-[10px] text-slate-500">
                        <span>
                          {new Date(act.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {act.xpEarned && (
                          <span className="text-emerald-400 font-bold">+{act.xpEarned} XP</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
