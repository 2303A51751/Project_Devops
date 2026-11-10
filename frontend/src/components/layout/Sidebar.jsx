import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Building2, DoorOpen, Users, FileText, CreditCard,
  Wrench, BarChart3, Settings, User, ChevronLeft, ChevronRight,
  Home, Search, ClipboardList, Building, Menu, X, LogOut, Sparkles
} from 'lucide-react';

const navConfig = {
  admin: [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Properties', path: '/properties', icon: Building2 },
    { label: 'Units', path: '/units', icon: DoorOpen },
    { label: 'Tenants', path: '/tenants', icon: Users },
    { label: 'Applications', path: '/applications', icon: ClipboardList },
    { label: 'Leases', path: '/leases', icon: FileText },
    { label: 'Payments', path: '/payments', icon: CreditCard },
    { label: 'Maintenance', path: '/maintenance', icon: Wrench },
    { label: 'Reports', path: '/reports', icon: BarChart3 },
    { label: 'Users', path: '/users', icon: Users },
    { label: 'Settings', path: '/profile', icon: Settings },
  ],
  owner: [
    { label: 'Dashboard', path: '/owner/dashboard', icon: LayoutDashboard },
    { label: 'My Properties', path: '/properties', icon: Building2 },
    { label: 'Units', path: '/units', icon: DoorOpen },
    { label: 'Applications', path: '/applications', icon: ClipboardList },
    { label: 'Leases', path: '/leases', icon: FileText },
    { label: 'Payments', path: '/payments', icon: CreditCard },
    { label: 'Reports', path: '/reports', icon: BarChart3 },
    { label: 'Profile', path: '/profile', icon: User },
  ],
  tenant: [
    { label: 'Dashboard', path: '/tenant/dashboard', icon: LayoutDashboard },
    { label: 'Browse Properties', path: '/browse', icon: Search },
    { label: 'My Applications', path: '/applications', icon: ClipboardList },
    { label: 'My Leases', path: '/leases', icon: FileText },
    { label: 'My Payments', path: '/payments', icon: CreditCard },
    { label: 'Maintenance', path: '/maintenance', icon: Wrench },
    { label: 'Profile', path: '/profile', icon: User },
  ],
  manager: [
    { label: 'Dashboard', path: '/manager/dashboard', icon: LayoutDashboard },
    { label: 'Properties', path: '/properties', icon: Building2 },
    { label: 'Units', path: '/units', icon: DoorOpen },
    { label: 'Tenants', path: '/tenants', icon: Users },
    { label: 'Applications', path: '/applications', icon: ClipboardList },
    { label: 'Leases', path: '/leases', icon: FileText },
    { label: 'Payments', path: '/payments', icon: CreditCard },
    { label: 'Maintenance', path: '/maintenance', icon: Wrench },
    { label: 'Reports', path: '/reports', icon: BarChart3 },
    { label: 'Profile', path: '/profile', icon: User },
  ],
};

const roleBadgeColors = {
  admin: 'bg-sky-100 text-sky-800 border border-sky-200',
  owner: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
  manager: 'bg-amber-100 text-amber-800 border border-amber-200',
  tenant: 'bg-purple-100 text-purple-800 border border-purple-200',
};

const Sidebar = ({ collapsed, onToggle, mobileOpen, onMobileClose }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const items = navConfig[user?.role] || navConfig.tenant;

  const roleColorClass = roleBadgeColors[user?.role] || 'bg-slate-100 text-slate-700 border border-slate-200';

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Light Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white/95 backdrop-blur-md border-r border-slate-200/90 shadow-sm z-50 transition-all duration-300 flex flex-col
          ${collapsed ? 'w-20' : 'w-64'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-100 bg-gradient-to-r from-sky-50/50 via-white to-emerald-50/30">
          {!collapsed && (
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-gradient-to-br from-sky-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-sm shadow-sky-500/20 text-white">
                <Building className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-extrabold text-slate-900 tracking-tight leading-none">
                  PropManage<span className="text-sky-600">Hub</span>
                </span>
                <span className="text-[10px] font-semibold text-emerald-600 tracking-wider uppercase mt-0.5">
                  Light Edition
                </span>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="w-9 h-9 bg-gradient-to-br from-sky-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto text-white shadow-sm shadow-sky-500/20">
              <Building className="w-5 h-5" />
            </div>
          )}
          <button
            onClick={onMobileClose}
            className="lg:hidden p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-4 space-y-1.5">
          {items.map((item) => {
            const isActive = location.pathname === item.path ||
              (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onMobileClose}
                className={isActive ? 'sidebar-link-active' : 'sidebar-link'}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* User Info & Controls Footer */}
        <div className="border-t border-slate-100 bg-slate-50/70 p-3 space-y-2">
          {!collapsed && (
            <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-white border border-slate-200/70 shadow-xs">
              <div className="w-8 h-8 bg-gradient-to-tr from-sky-400 to-emerald-400 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-xs">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">{user?.name || 'User'}</p>
                <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize mt-0.5 ${roleColorClass}`}>
                  {user?.role || 'guest'}
                </span>
              </div>
            </div>
          )}
          <button
            onClick={logout}
            className="sidebar-link w-full text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-colors"
            title={collapsed ? 'Logout' : undefined}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
          <button
            onClick={onToggle}
            className="hidden lg:flex sidebar-link w-full text-slate-500 hover:bg-sky-50 hover:text-sky-700"
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5 mx-auto" />
            ) : (
              <>
                <ChevronLeft className="w-5 h-5" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
