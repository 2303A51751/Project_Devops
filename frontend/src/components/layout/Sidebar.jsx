import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Building2, DoorOpen, Users, FileText, CreditCard,
  Wrench, BarChart3, Settings, User, ChevronLeft, ChevronRight,
  Home, Search, ClipboardList, Building, Menu, X, LogOut
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

const Sidebar = ({ collapsed, onToggle, mobileOpen, onMobileClose }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const items = navConfig[user?.role] || navConfig.tenant;

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-slate-900 z-50 transition-all duration-300 flex flex-col
          ${collapsed ? 'w-20' : 'w-64'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Building className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">PropertyPro</span>
            </div>
          )}
          {collapsed && (
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mx-auto">
              <Building className="w-5 h-5 text-white" />
            </div>
          )}
          <button
            onClick={onMobileClose}
            className="lg:hidden p-1 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-4 space-y-1">
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

        {/* User info & collapse toggle */}
        <div className="border-t border-slate-800 p-3 space-y-2">
          {!collapsed && (
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.name || 'User'}</p>
                <p className="text-xs text-slate-400 capitalize">{user?.role || 'guest'}</p>
              </div>
            </div>
          )}
          <button
            onClick={logout}
            className="sidebar-link w-full"
            title={collapsed ? 'Logout' : undefined}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
          <button
            onClick={onToggle}
            className="hidden lg:flex sidebar-link w-full"
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
