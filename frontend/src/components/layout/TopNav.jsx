import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Menu, Bell, ChevronRight, User, Settings, LogOut, Search, Sparkles
} from 'lucide-react';
import { getInitials } from '../../utils/helpers';

const breadcrumbMap = {
  admin: 'Admin',
  owner: 'Owner',
  tenant: 'Tenant',
  manager: 'Manager',
  dashboard: 'Dashboard',
  properties: 'Properties',
  units: 'Units',
  tenants: 'Tenants',
  applications: 'Applications',
  leases: 'Leases',
  payments: 'Payments',
  maintenance: 'Maintenance',
  reports: 'Reports',
  users: 'Users',
  profile: 'Profile',
  browse: 'Browse Properties',
  settings: 'Settings',
};

const TopNav = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const userMenuRef = useRef(null);
  const notifRef = useRef(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Generate breadcrumbs from path
  const pathParts = location.pathname.split('/').filter(Boolean);
  const breadcrumbs = pathParts.map((part, index) => ({
    label: breadcrumbMap[part] || part.charAt(0).toUpperCase() + part.slice(1),
    path: '/' + pathParts.slice(0, index + 1).join('/'),
    isLast: index === pathParts.length - 1,
  }));

  const notifications = [
    { id: 1, text: 'New maintenance request submitted', time: '5 min ago', unread: true },
    { id: 2, text: 'Rent payment received from John Doe', time: '1 hour ago', unread: true },
    { id: 3, text: 'Lease expiring in 30 days for Unit 4B', time: '2 hours ago', unread: false },
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 h-16 shadow-xs">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        {/* Left: Menu button + Breadcrumbs */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-xl hover:bg-sky-50 text-slate-600 transition"
          >
            <Menu className="w-5 h-5" />
          </button>

          <nav className="hidden sm:flex items-center gap-1.5 text-xs">
            {breadcrumbs.map((crumb, index) => (
              <div key={crumb.path} className="flex items-center gap-1.5">
                {index > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                {crumb.isLast ? (
                  <span className="font-bold text-sky-900 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200/70">
                    {crumb.label}
                  </span>
                ) : (
                  <button
                    onClick={() => navigate(crumb.path)}
                    className="text-slate-500 hover:text-sky-600 transition font-medium"
                  >
                    {crumb.label}
                  </button>
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* Right: Notifications + User menu */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative p-2 rounded-xl hover:bg-sky-50 text-slate-600 transition"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 animate-scale-in overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-sky-50 to-emerald-50">
                  <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                    Notifications
                  </h3>
                </div>
                <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`px-4 py-3 hover:bg-sky-50/50 cursor-pointer transition ${
                        notif.unread ? 'bg-sky-50/70 border-l-4 border-sky-500' : ''
                      }`}
                    >
                      <p className="text-xs text-slate-800 font-medium">{notif.text}</p>
                      <p className="text-[10px] text-slate-400 mt-1">{notif.time}</p>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2 text-center border-t border-slate-100 bg-slate-50/50">
                  <button className="text-xs text-sky-600 hover:text-sky-700 font-bold transition">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-sky-50 border border-slate-200/80 transition"
            >
              <div className="w-8 h-8 bg-gradient-to-tr from-sky-500 to-emerald-500 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-xs">
                {getInitials(user?.name)}
              </div>
              <div className="hidden md:block text-left pr-1">
                <p className="text-xs font-bold text-slate-800 leading-tight">{user?.name || 'User'}</p>
                <p className="text-[10px] text-slate-500 capitalize leading-tight">{user?.role || 'guest'}</p>
              </div>
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 animate-scale-in overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-sky-50 via-white to-emerald-50">
                  <p className="text-xs font-bold text-slate-900">{user?.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => { navigate('/profile'); setUserMenuOpen(false); }}
                    className="flex items-center gap-2 w-full px-4 py-2 text-xs font-medium text-slate-700 hover:bg-sky-50 transition"
                  >
                    <User className="w-4 h-4 text-sky-600" /> Profile
                  </button>
                  <button
                    onClick={() => { navigate('/profile'); setUserMenuOpen(false); }}
                    className="flex items-center gap-2 w-full px-4 py-2 text-xs font-medium text-slate-700 hover:bg-sky-50 transition"
                  >
                    <Settings className="w-4 h-4 text-emerald-600" /> Settings
                  </button>
                </div>
                <div className="border-t border-slate-100 py-1 bg-slate-50/50">
                  <button
                    onClick={() => { logout(); navigate('/login'); }}
                    className="flex items-center gap-2 w-full px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNav;
