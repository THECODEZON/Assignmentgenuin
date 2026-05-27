import React from 'react';
import { NavLink } from 'react-router-dom';
import { Trophy, Compass, User, ShieldAlert } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuthStore();

  const menuItems = [
    {
      name: 'Discover Quests',
      path: '/dashboard',
      icon: Compass,
    },
    {
      name: 'Leaderboard',
      path: '/leaderboard',
      icon: Trophy,
    },
    {
      name: 'My Profile',
      path: '/profile',
      icon: User,
    },
  ];

  if (user?.role === 'ADMIN') {
    menuItems.push({
      name: 'Admin Panel',
      path: '/admin',
      icon: ShieldAlert,
    });
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/60 md:hidden backdrop-blur-sm"
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed top-[57px] bottom-0 left-0 z-30 w-64 border-r border-[rgba(255,255,255,0.06)] bg-[#09090b] px-4 py-6
        transform transition-transform duration-300 ease-in-out md:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Navigation list */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) => `
                  flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-bold tracking-wide transition-all duration-200
                  ${isActive 
                    ? 'bg-gradient-to-r from-violet-600/20 to-cyan-500/10 border-l-2 border-violet-500 text-violet-400' 
                    : 'text-slate-400 hover:text-white hover:bg-[rgba(255,255,255,0.02)]'
                  }
                `}
              >
                <Icon size={18} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Dynamic Sidebar card showing leveling */}
        {user && (
          <div className="absolute bottom-6 left-4 right-4 p-4 rounded-2xl glass-panel border border-zinc-800/60 bg-gradient-to-tr from-zinc-950 to-zinc-900">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Level</h4>
            <div className="flex items-center space-x-3 mt-2">
              <div className="w-10 h-10 rounded-xl bg-violet-950/40 border border-violet-800/40 flex items-center justify-center font-extrabold text-violet-400 shadow-md">
                {user.level}
              </div>
              <div>
                <p className="text-sm font-bold text-white">{user.username}</p>
                <p className="text-xs text-slate-500 font-semibold uppercase">{user.role}</p>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
