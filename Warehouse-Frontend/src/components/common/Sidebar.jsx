import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FiGrid, FiPackage, FiTruck, FiShoppingCart,
  FiDatabase, FiLogOut, FiUser, FiSettings,
  FiHome, FiLayers, FiBox, FiChevronDown, FiChevronUp
} from 'react-icons/fi';

const Sidebar = () => {
  const { user, logout, isAdmin, isOperator } = useAuth();
  const navigate = useNavigate();
  const [setupOpen, setSetupOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', icon: <FiGrid size={20} />, label: 'Dashboard', roles: ['ADMIN', 'MANAGER'] },
    { path: '/operator', icon: <FiGrid size={20} />, label: 'Dashboard', roles: ['OPERATOR'] },
    { path: '/warehouses', icon: <FiDatabase size={20} />, label: 'Warehouses', roles: ['ADMIN', 'MANAGER'] },
    { path: '/inventory', icon: <FiPackage size={20} />, label: 'Inventory', roles: ['MANAGER'] },
    { path: '/receiving', icon: <FiTruck size={20} />, label: 'Receiving', roles: ['MANAGER'] },
    { path: '/orders', icon: <FiShoppingCart size={20} />, label: 'Orders', roles: ['MANAGER'] },
  ];

  const setupItems = [
    { path: '/admin/warehouse', icon: <FiHome size={16} />, label: 'Add Warehouse' },
    { path: '/admin/zone', icon: <FiGrid size={16} />, label: 'Add Zone' },
    { path: '/admin/aisle', icon: <FiLayers size={16} />, label: 'Add Aisle' },
    { path: '/admin/bin', icon: <FiBox size={16} />, label: 'Add Bin' },
  ];

  return (
    <aside className="w-64 bg-slate-800 min-h-screen flex flex-col">
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
            <FiPackage className="text-white" size={22} />
          </div>
          <div>
            <h1 className="text-white font-bold text-sm">WMS Portal</h1>
            <p className="text-slate-400 text-xs">Warehouse Management</p>
          </div>
        </div>
      </div>

      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <FiUser className="text-white" size={16} />
          </div>
          <div>
            <p className="text-white text-sm font-medium">{user?.username}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              isAdmin() ? 'bg-purple-500/20 text-purple-300' : isOperator() ? 'bg-green-500/20 text-green-300' : 'bg-blue-500/20 text-blue-300'
            }`}>
              {isAdmin() ? 'Admin' : isOperator() ? 'Operator' : 'Manager'}
            </span>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => {
            if (!item.roles.includes(user?.role)) return null;
            return (
              <li key={item.path}>
                <NavLink to={item.path} className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}>
                  {item.icon}<span className="text-sm font-medium">{item.label}</span>
                </NavLink>
              </li>
            );
          })}

          {user?.role === 'ADMIN' && (
            <li>
              <button onClick={() => setSetupOpen(!setupOpen)}
                className="flex items-center justify-between w-full px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-700 hover:text-white transition-colors">
                <div className="flex items-center gap-3"><FiSettings size={20} /><span className="text-sm font-medium">Warehouse Setup</span></div>
                {setupOpen ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
              </button>
              {setupOpen && (
                <ul className="mt-1 ml-8 space-y-1">
                  {setupItems.map((item) => (
                    <li key={item.path}>
                      <NavLink to={item.path} className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm ${isActive ? 'bg-blue-600/50 text-white' : 'text-slate-500 hover:text-white hover:bg-slate-700'}`}>
                        {item.icon}<span>{item.label}</span>
                      </NavLink>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          )}
        </ul>
      </nav>

      <div className="p-4 border-t border-slate-700">
        <button onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition-colors">
          <FiLogOut size={20} /><span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;