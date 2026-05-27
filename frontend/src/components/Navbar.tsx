import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { Bell, LogOut, ShieldAlert, Award, CheckCheck, Menu } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface NavbarProps {
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuthStore();
  const { notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead } = useNotificationStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // XP Progress Calculation
  const xp = user?.xp || 0;
  const level = user?.level || 1;
  const xpInCurrentLevel = xp % 1000;
  const xpPercent = (xpInCurrentLevel / 1000) * 100;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-[rgba(255,255,255,0.08)] bg-[rgba(9,9,11,0.85)] backdrop-blur-md px-4 py-3 flex items-center justify-between">
      {/* Left side: Logo & Toggle */}
      <div className="flex items-center space-x-3">
        <button 
          onClick={onToggleSidebar} 
          className="p-2 md:hidden hover:bg-[rgba(255,255,255,0.05)] rounded-lg text-slate-400 hover:text-white"
        >
          <Menu size={20} />
        </button>
        <Link to="/dashboard" className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center font-bold text-white shadow-lg shadow-violet-900/40">
            ⚔️
          </div>
          <span className="font-extrabold text-xl bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent tracking-wider">
            QUEST<span className="text-violet-500">CRAFT</span>
          </span>
        </Link>
      </div>

      {/* Right side: Stats & Profiling */}
      <div className="flex items-center space-x-4">
        {/* User stats widget (hidden on small screen) */}
        {user && (
          <div className="hidden md:flex items-center space-x-4 bg-[rgba(255,255,255,0.03)] px-4 py-1.5 rounded-full border border-[rgba(255,255,255,0.05)]">
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-semibold text-violet-400 uppercase tracking-widest">Lvl</span>
              <span className="font-extrabold text-white text-sm">{level}</span>
            </div>
            
            {/* XP Bar */}
            <div className="flex flex-col w-32">
              <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                <span>{xpInCurrentLevel}/1000 XP</span>
                <span>{Math.round(xpPercent)}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mt-0.5">
                <div 
                  className="h-full bg-gradient-to-r from-violet-500 to-cyan-400 rounded-full transition-all duration-500"
                  style={{ width: `${xpPercent}%` }}
                />
              </div>
            </div>

            <div className="h-4 w-px bg-slate-800" />

            <div className="flex items-center space-x-1">
              <Award size={14} className="text-cyan-400" />
              <span className="text-xs font-semibold text-slate-300">{user.points} pts</span>
            </div>
          </div>
        )}

        {/* Notifications Icon & Dropdown */}
        {user && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 relative bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.08)] rounded-full text-slate-300 hover:text-white border border-[rgba(255,255,255,0.05)] transition"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-violet-600 rounded-full text-[10px] font-bold text-white flex items-center justify-center border border-zinc-950 animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Menu */}
            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 glass-panel shadow-2xl rounded-xl overflow-hidden border border-zinc-800 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-3 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
                  <span className="font-bold text-sm text-white">Notifications</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => markAllAsRead()}
                      className="text-xs text-violet-400 hover:text-violet-300 font-semibold flex items-center space-x-1 cursor-pointer"
                    >
                      <CheckCheck size={14} />
                      <span>Mark read</span>
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-zinc-800/40">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => !notif.read && markAsRead(notif.id)}
                        className={`p-4 transition cursor-pointer hover:bg-[rgba(255,255,255,0.02)] ${
                          !notif.read ? 'bg-violet-950/15 border-l-2 border-violet-500' : ''
                        }`}
                      >
                        <p className="text-xs text-slate-300 leading-relaxed font-medium">
                          {notif.message}
                        </p>
                        <span className="text-[9px] text-slate-500 block mt-2">
                          {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                <Link
                  to="/profile"
                  onClick={() => setShowNotifications(false)}
                  className="block text-center py-2.5 text-[11px] font-bold text-slate-400 hover:text-white bg-zinc-900/30 border-t border-zinc-850 hover:bg-zinc-900/60"
                >
                  View Activity Timeline
                </Link>
              </div>
            )}
          </div>
        )}

        {/* User profile avatar / logout */}
        {user && (
          <div className="flex items-center space-x-3">
            <Link 
              to="/profile" 
              className="flex items-center space-x-2 bg-zinc-900/50 border border-[rgba(255,255,255,0.05)] py-1.5 px-3 rounded-full hover:bg-zinc-900 transition"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold uppercase">
                {user.username.substring(0, 2)}
              </div>
              <span className="hidden md:inline text-xs font-bold text-slate-300 hover:text-white">
                {user.username}
              </span>
            </Link>

            {user.role === 'ADMIN' && (
              <Link
                to="/admin"
                className="p-2 bg-amber-950/20 hover:bg-amber-950/40 text-amber-400 hover:text-amber-300 rounded-full border border-amber-900/30 transition"
                title="Admin Dashboard"
              >
                <ShieldAlert size={18} />
              </Link>
            )}

            <button
              onClick={handleLogout}
              className="p-2 hover:bg-rose-950/20 text-slate-400 hover:text-rose-400 rounded-full border border-transparent hover:border-rose-950 transition cursor-pointer"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};
