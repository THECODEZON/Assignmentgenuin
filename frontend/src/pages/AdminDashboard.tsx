import React, { useState, useEffect } from 'react';
import { apiFetch } from '../services/api';
import type { AdminStats, Quest, User } from '../types';
import { 
  Users, Swords, CheckSquare, Plus, Clock, Globe, Megaphone, Trash, Check, X 
} from 'lucide-react';
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from 'recharts';
import toast from 'react-hot-toast';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Active Tab: STATS, MODERATION, QUESTS, USERS, BROADCAST
  const [activeTab, setActiveTab] = useState<'STATS' | 'MODERATION' | 'QUESTS' | 'USERS' | 'BROADCAST'>('STATS');

  // Quest Creation Form State
  const [questTitle, setQuestTitle] = useState('');
  const [questDesc, setQuestDesc] = useState('');
  const [questType, setQuestType] = useState<'DAILY' | 'WEEKLY' | 'ACHIEVEMENT'>('DAILY');
  const [rewardXp, setRewardXp] = useState(100);
  const [rewardPoints, setRewardPoints] = useState(50);
  const [rewardBadge, setRewardBadge] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [questSubmitting, setQuestSubmitting] = useState(false);

  // Broadcast Message State
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [broadcasting, setBroadcasting] = useState(false);

  // Moderation Notes map
  const [notes, setNotes] = useState<{ [subId: string]: string }>({});
  const [modifyingSub, setModifyingSub] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsData, questsData, usersData] = await Promise.all([
        apiFetch('/users/stats'),
        apiFetch('/quests?admin=true'), // Fetch all statuses
        apiFetch('/users')
      ]);

      setStats(statsData);
      setQuests(questsData);
      setAllUsers(usersData);
    } catch (e: any) {
      toast.error(e.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateQuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questTitle || !questDesc) {
      toast.error('Please fill in Title and Description');
      return;
    }

    setQuestSubmitting(true);
    try {
      await apiFetch('/quests', {
        method: 'POST',
        body: {
          title: questTitle,
          description: questDesc,
          type: questType,
          targetValue: 1, // Default baseline targets
          rewardXp: Number(rewardXp),
          rewardPoints: Number(rewardPoints),
          rewardBadge: rewardBadge || null,
          expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
        },
      });

      toast.success('Quest created in DRAFT state!');
      setQuestTitle('');
      setQuestDesc('');
      setRewardBadge('');
      setExpiresAt('');
      
      // Refresh
      await fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Creation failed');
    } finally {
      setQuestSubmitting(false);
    }
  };

  const handlePublishQuest = async (questId: string) => {
    try {
      await apiFetch(`/quests/${questId}/publish`, { method: 'PATCH' });
      toast.success('Quest published successfully!');
      await fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Publish failed');
    }
  };

  const handleDeleteQuest = async (questId: string) => {
    if (!confirm('Are you sure you want to delete this quest?')) return;
    try {
      await apiFetch(`/quests/${questId}`, { method: 'DELETE' });
      toast.success('Quest deleted successfully');
      await fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Deletion failed');
    }
  };

  const handleModerate = async (subId: string, status: 'APPROVED' | 'REJECTED') => {
    setModifyingSub(subId);
    try {
      await apiFetch(`/submissions/${subId}/moderate`, {
        method: 'PATCH',
        body: {
          status,
          adminNotes: notes[subId] || '',
        },
      });

      toast.success(`Submission ${status.toLowerCase()}!`);
      // clear note
      setNotes(prev => {
        const copy = { ...prev };
        delete copy[subId];
        return copy;
      });

      await fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Moderation failed');
    } finally {
      setModifyingSub(null);
    }
  };

  const handleToggleUserRole = async (userId: string, currentRole: string) => {
    const nextRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
    if (!confirm(`Are you sure you want to change this user role to ${nextRole}?`)) return;

    try {
      await apiFetch(`/users/${userId}/role`, {
        method: 'PATCH',
        body: { role: nextRole },
      });
      toast.success('User role updated successfully');
      await fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update role');
    }
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMsg) return;

    setBroadcasting(true);
    try {
      await apiFetch('/notifications/broadcast', {
        method: 'POST',
        body: { message: broadcastMsg },
      });
      toast.success('Global announcement broadcasted via WebSocket!');
      setBroadcastMsg('');
    } catch (err: any) {
      toast.error(err.message || 'Broadcast failed');
    } finally {
      setBroadcasting(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500" />
      </div>
    );
  }

  // Pending submissions list
  const pendingSubmissions = stats.recentSubmissions.filter(s => s.status === 'PENDING');

  return (
    <div className="space-y-8">
      
      {/* Top Banner */}
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold text-white">ADMIN CONTROL PANEL</h1>
        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
          Moderate submissions, manage quests, configure user roles, and send system updates
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-zinc-900 pb-3">
        {(['STATS', 'MODERATION', 'QUESTS', 'USERS', 'BROADCAST'] as const).map((tab) => {
          const badgeCount = tab === 'MODERATION' ? pendingSubmissions.length : 0;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                px-4 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase transition cursor-pointer flex items-center space-x-1.5
                ${activeTab === tab 
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/30' 
                  : 'bg-zinc-900/50 border border-zinc-800 text-slate-400 hover:text-white hover:bg-zinc-900'
                }
              `}
            >
              <span>{tab}</span>
              {badgeCount > 0 && (
                <span className="w-5 h-5 bg-rose-600 rounded-full text-[9px] font-black text-white flex items-center justify-center">
                  {badgeCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content Tab Pages */}
      {activeTab === 'STATS' && (
        <div className="space-y-8">
          
          {/* Stats Cards grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl glass-panel bg-zinc-900/40 border border-zinc-800">
              <div className="flex justify-between items-start text-slate-500">
                <span className="text-[10px] font-bold uppercase tracking-widest">Active Questers</span>
                <Users size={16} />
              </div>
              <h3 className="text-3xl font-black text-white mt-3">{stats.summary.totalUsers}</h3>
              <p className="text-[9px] text-emerald-400 font-bold mt-1">
                {stats.summary.activeConnections} active sockets
              </p>
            </div>

            <div className="p-5 rounded-2xl glass-panel bg-zinc-900/40 border border-zinc-800">
              <div className="flex justify-between items-start text-slate-500">
                <span className="text-[10px] font-bold uppercase tracking-widest">Quests Pool</span>
                <Swords size={16} />
              </div>
              <h3 className="text-3xl font-black text-white mt-3">{stats.summary.totalQuests}</h3>
              <p className="text-[9px] text-slate-500 font-bold mt-1">Active daily rotation</p>
            </div>

            <div className="p-5 rounded-2xl glass-panel bg-zinc-900/40 border border-zinc-800">
              <div className="flex justify-between items-start text-slate-500">
                <span className="text-[10px] font-bold uppercase tracking-widest">Total Proofs</span>
                <CheckSquare size={16} />
              </div>
              <h3 className="text-3xl font-black text-white mt-3">{stats.summary.totalSubmissions}</h3>
              <p className="text-[9px] text-emerald-400 font-bold mt-1">
                {stats.summary.approvedSubmissions} approved proofs
              </p>
            </div>

            <div className="p-5 rounded-2xl glass-panel bg-zinc-900/40 border border-zinc-800">
              <div className="flex justify-between items-start text-slate-500">
                <span className="text-[10px] font-bold uppercase tracking-widest">Inbox Pending</span>
                <Clock size={16} className="text-amber-500" />
              </div>
              <h3 className="text-3xl font-black text-amber-500 mt-3">{stats.summary.pendingSubmissions}</h3>
              <p className="text-[9px] text-amber-500 font-bold mt-1">Awaiting review</p>
            </div>
          </div>

          {/* Recharts Analytics Graphic */}
          <div className="p-6 rounded-2xl glass-panel bg-gradient-to-tr from-zinc-950 to-zinc-900 border border-zinc-800/40 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center space-x-2">
              <Globe size={16} className="text-violet-500" />
              <span>Activity Trends (Past 7 Days)</span>
            </h3>
            
            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.activityTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="date" stroke="#9ca3af" fontSize={11} />
                  <YAxis stroke="#9ca3af" fontSize={11} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a' }}
                    labelStyle={{ color: '#ffffff', fontWeight: 'bold' }}
                  />
                  <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px' }} />
                  <Line type="monotone" dataKey="completions" name="Quest Completions" stroke="#8b5cf6" strokeWidth={3} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="signups" name="New Registrations" stroke="#06b6d4" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'MODERATION' && (
        <div className="space-y-6">
          <h3 className="text-base font-bold text-white uppercase tracking-wider">Moderation Inbox ({pendingSubmissions.length} pending)</h3>
          
          {pendingSubmissions.length === 0 ? (
            <div className="p-12 text-center rounded-2xl glass-panel border border-zinc-900 text-slate-500">
              Moderation Inbox is empty. Good job, Game Master!
            </div>
          ) : (
            <div className="space-y-4">
              {pendingSubmissions.map((sub) => (
                <div key={sub.id} className="p-6 rounded-2xl glass-panel bg-zinc-950 border border-zinc-900 flex flex-col md:flex-row justify-between gap-6">
                  
                  {/* Left info details */}
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center space-x-2 text-[10px] text-slate-500">
                      <span className="font-extrabold text-white text-xs uppercase">{sub.user?.username}</span>
                      <span>•</span>
                      <span>{new Date(sub.createdAt).toLocaleString()}</span>
                    </div>

                    <h4 className="text-sm font-bold text-violet-400">Quest: {sub.quest?.title}</h4>
                    
                    {sub.proofText && (
                      <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-850 text-xs text-slate-350 leading-relaxed font-medium">
                        <span className="text-[9px] text-slate-500 font-bold uppercase block mb-1">User text proof:</span>
                        {sub.proofText}
                      </div>
                    )}

                    {sub.proofUrl && (
                      <div className="pt-2">
                        <a 
                          href={`http://localhost:5000${sub.proofUrl}`}
                          target="_blank" 
                          rel="noreferrer"
                          className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 underline"
                        >
                          View Uploaded File Proof
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Right moderation action forms */}
                  <div className="md:w-72 space-y-3 shrink-0 flex flex-col justify-end">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                        Moderation Feedback Note (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="Great screenshots! Approved."
                        value={notes[sub.id] || ''}
                        onChange={(e) => setNotes({ ...notes, [sub.id]: e.target.value })}
                        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white outline-none focus:border-violet-500 transition"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleModerate(sub.id, 'APPROVED')}
                        disabled={modifyingSub === sub.id}
                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-1.5 transition cursor-pointer disabled:opacity-50"
                      >
                        <Check size={14} />
                        <span>Approve</span>
                      </button>

                      <button
                        onClick={() => handleModerate(sub.id, 'REJECTED')}
                        disabled={modifyingSub === sub.id}
                        className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-1.5 transition cursor-pointer disabled:opacity-50"
                      >
                        <X size={14} />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'QUESTS' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Quest Creation Form (Left 1 col) */}
          <div className="rounded-2xl glass-panel bg-gradient-to-tr from-zinc-950 to-zinc-900 border border-zinc-800/40 p-6 space-y-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center space-x-1.5">
              <Plus size={16} />
              <span>Create New Quest</span>
            </h3>

            <form onSubmit={handleCreateQuest} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Title</label>
                <input
                  type="text"
                  required
                  placeholder="Gamer Champion Match"
                  value={questTitle}
                  onChange={(e) => setQuestTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white placeholder-slate-650 outline-none focus:border-violet-500 transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Description</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Details of the quest, targets, and criteria..."
                  value={questDesc}
                  onChange={(e) => setQuestDesc(e.target.value)}
                  className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white placeholder-slate-650 outline-none focus:border-violet-500 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Type</label>
                  <select
                    value={questType}
                    onChange={(e) => setQuestType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white outline-none focus:border-violet-500 transition"
                  >
                    <option value="DAILY">DAILY</option>
                    <option value="WEEKLY">WEEKLY</option>
                    <option value="ACHIEVEMENT">ACHIEVEMENT</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Expires At</label>
                  <input
                    type="date"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white outline-none focus:border-violet-500 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Reward XP</label>
                  <input
                    type="number"
                    value={rewardXp}
                    onChange={(e) => setRewardXp(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white outline-none focus:border-violet-500 transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Reward Points</label>
                  <input
                    type="number"
                    value={rewardPoints}
                    onChange={(e) => setRewardPoints(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white outline-none focus:border-violet-500 transition"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Custom Badge Icon (Optional)</label>
                <input
                  type="text"
                  placeholder="🧙‍♂️ or 🛡️ or ⚔️"
                  value={rewardBadge}
                  onChange={(e) => setRewardBadge(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white placeholder-slate-650 outline-none focus:border-violet-500 transition"
                />
              </div>

              <button
                type="submit"
                disabled={questSubmitting}
                className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white rounded-lg font-bold text-xs tracking-wider uppercase flex items-center justify-center space-x-1.5 transition cursor-pointer disabled:opacity-50"
              >
                <span>{questSubmitting ? 'Creating...' : 'Create Quest'}</span>
              </button>
            </form>
          </div>

          {/* Quests Directory List (Right 2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest">Quests Directory</h3>
            
            <div className="space-y-3">
              {quests.map((q) => (
                <div key={q.id} className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800 flex items-center justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className={`
                        text-[9px] font-black tracking-widest px-2 py-0.5 rounded uppercase
                        ${q.type === 'DAILY' ? 'bg-amber-950/40 text-amber-400' : ''}
                        ${q.type === 'WEEKLY' ? 'bg-violet-950/40 text-violet-400' : ''}
                        ${q.type === 'ACHIEVEMENT' ? 'bg-cyan-950/40 text-cyan-400' : ''}
                      `}>
                        {q.type}
                      </span>
                      <span className={`
                        text-[9px] font-black tracking-widest px-2 py-0.5 rounded uppercase
                        ${q.status === 'DRAFT' ? 'bg-zinc-850 text-slate-350 border border-zinc-805' : ''}
                        ${q.status === 'PUBLISHED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-900/20' : ''}
                        ${q.status === 'EXPIRED' ? 'bg-rose-500/10 text-rose-450 border border-rose-900/20' : ''}
                      `}>
                        {q.status}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-white">{q.title}</h4>
                    <p className="text-[10px] text-slate-500 line-clamp-1">{q.description}</p>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    {q.status === 'DRAFT' && (
                      <button
                        onClick={() => handlePublishQuest(q.id)}
                        className="p-2 bg-emerald-600/10 hover:bg-emerald-650 text-emerald-400 rounded-lg border border-emerald-900/30 transition cursor-pointer"
                        title="Publish Quest"
                      >
                        Publish
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteQuest(q.id)}
                      className="p-2 bg-rose-600/10 hover:bg-rose-650 text-rose-400 rounded-lg border border-rose-900/30 transition cursor-pointer"
                      title="Delete Quest"
                    >
                      <Trash size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {activeTab === 'USERS' && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-widest">Registered User Accounts</h3>
          
          <div className="rounded-2xl glass-panel border border-zinc-900 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-900 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                  <th className="py-3 px-5">Username</th>
                  <th className="py-3 px-5">Email Address</th>
                  <th className="py-3 px-5 text-center">Level</th>
                  <th className="py-3 px-5 text-center">XP</th>
                  <th className="py-3 px-5 text-center">Role</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900/40 text-xs text-slate-300">
                {allUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-zinc-900/20 transition-all">
                    <td className="py-3.5 px-5 font-bold text-white">{u.username}</td>
                    <td className="py-3.5 px-5 text-slate-400">{u.email}</td>
                    <td className="py-3.5 px-5 text-center font-bold text-violet-400">{u.level}</td>
                    <td className="py-3.5 px-5 text-center">{u.xp} XP</td>
                    <td className="py-3.5 px-5 text-center">
                      <span className={`
                        px-2 py-0.5 rounded text-[10px] font-black uppercase
                        ${u.role === 'ADMIN' ? 'bg-amber-600/10 text-amber-400 border border-amber-900/20' : 'bg-zinc-800 text-slate-300'}
                      `}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => handleToggleUserRole(u.id, u.role)}
                        className="py-1 px-2.5 rounded bg-zinc-800 hover:bg-zinc-700 text-[10px] font-bold text-slate-200 border border-zinc-700 transition cursor-pointer"
                      >
                        Toggle Role
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'BROADCAST' && (
        <div className="max-w-xl mx-auto rounded-2xl glass-panel bg-gradient-to-tr from-zinc-950 to-zinc-900 border border-zinc-800/40 p-6 space-y-6">
          <div className="text-center space-y-2">
            <Megaphone size={30} className="text-violet-500 mx-auto" />
            <h3 className="text-base font-bold text-white uppercase tracking-wider">SYSTEM BROADCAST</h3>
            <p className="text-[10px] text-slate-500 max-w-xs mx-auto leading-relaxed">
              Send a real-time message notification banner to all connected players currently inside the app.
            </p>
          </div>

          <form onSubmit={handleSendBroadcast} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-550 uppercase tracking-widest">Announcement message</label>
              <textarea
                rows={4}
                required
                placeholder="Attention Heroes! The dungeon gates open at 18:00 UTC. Prepare your gear..."
                value={broadcastMsg}
                onChange={(e) => setBroadcastMsg(e.target.value)}
                className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white placeholder-slate-650 outline-none focus:border-violet-500 transition"
              />
            </div>

            <button
              type="submit"
              disabled={broadcasting || !broadcastMsg}
              className="w-full py-3 bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white rounded-lg font-bold text-xs tracking-wider uppercase flex items-center justify-center space-x-1.5 transition cursor-pointer disabled:opacity-50"
            >
              <span>{broadcasting ? 'Broadcasting...' : 'Broadcast Announcement'}</span>
            </button>
          </form>
        </div>
      )}

    </div>
  );
};
