import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FiGrid, FiPackage, FiTruck, FiShoppingCart,
  FiDatabase, FiLogOut, FiUser, FiSearch, FiBox
} from 'react-icons/fi';

const Sidebar = () => {
  const { user, logout, isAdmin, isOperator, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', icon: <FiGrid size={18} />, label: 'Dashboard', roles: ['MANAGER', 'OPERATOR'] },
    { path: '/warehouses', icon: <FiDatabase size={18} />, label: 'Warehouses', roles: ['MANAGER'] },
    { path: '/inventory', icon: <FiBox size={18} />, label: 'Inventory', roles: ['MANAGER', 'OPERATOR'] },
    { path: '/receiving', icon: <FiTruck size={18} />, label: 'Shipments', roles: ['MANAGER', 'OPERATOR'] },
    { path: '/orders', icon: <FiShoppingCart size={18} />, label: 'Orders', roles: ['MANAGER', 'OPERATOR'] },
    { path: '/scan', icon: <FiSearch size={18} />, label: 'Scan Item', roles: ['OPERATOR'] },
  ];

  const getRoleBadge = () => {
    if (isAdmin()) return { label: 'Manager', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' };
    if (isOperator()) return { label: 'Operator', color: 'bg-green-500/20 text-green-300 border-green-500/30' };
    return { label: 'Manager', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' };
  };

  const roleBadge = getRoleBadge();

  // ✅ Show loading skeleton while auth is being checked
  if (loading) {
    return (
      <aside className="w-64 bg-gradient-to-b from-slate-800 to-slate-900 min-h-screen flex flex-col border-r border-slate-700/50 animate-pulse">
        <div className="p-5 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-700 rounded-xl"></div>
            <div>
              <div className="h-4 w-24 bg-slate-700 rounded"></div>
              <div className="h-3 w-16 bg-slate-700 rounded mt-2"></div>
            </div>
          </div>
        </div>
        <div className="px-4 py-4 border-b border-slate-700/50">
          <div className="flex items-center gap-3 bg-slate-700/30 rounded-xl p-3">
            <div className="w-9 h-9 bg-slate-700 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 w-20 bg-slate-700 rounded"></div>
              <div className="h-3 w-14 bg-slate-700 rounded mt-2"></div>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-2">
          <div className="h-3 w-16 bg-slate-700 rounded mb-3 px-3"></div>
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-10 bg-slate-700/50 rounded-lg"></div>
          ))}
        </nav>
        <div className="p-3 border-t border-slate-700/50">
          <div className="h-10 bg-slate-700/50 rounded-lg"></div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-64 bg-gradient-to-b from-slate-800 to-slate-900 min-h-screen flex flex-col border-r border-slate-700/50">
      {/* Logo Section */}
      <div className="p-5 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <FiPackage className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-white font-bold text-sm tracking-wide">WMS Portal</h1>
            <p className="text-slate-400 text-xs">Warehouse Management</p>
          </div>
        </div>
      </div>

      {/* User Section */}
      <div className="px-4 py-4 border-b border-slate-700/50">
        <div className="flex items-center gap-3 bg-slate-700/30 rounded-xl p-3">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md">
            <FiUser className="text-white" size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{user?.username || 'User'}</p>
            <span className={`inline-flex items-center text-xs px-2 py-0.5 rounded-full border ${roleBadge.color} font-medium mt-0.5`}>
              {roleBadge.label}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-3 px-3">Main Menu</p>
        <ul className="space-y-1">
          {navItems.map((item) => {
            // ✅ Show items user has access to
            if (user?.role && !item.roles.includes(user.role)) return null;
            
            return (
              <li key={item.path}>
                <NavLink 
                  to={item.path} 
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                      isActive 
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' 
                        : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                    }`
                  }
                >
                  {item.icon}
                  <span className="text-sm font-medium">{item.label}</span>
                  
                  {({ isActive }) => isActive && (
                    <span className="ml-auto w-1.5 h-1.5 bg-white rounded-full"></span>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-slate-700/50">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 group"
        >
          <FiLogOut size={18} className="group-hover:translate-x-0.5 transition-transform" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;