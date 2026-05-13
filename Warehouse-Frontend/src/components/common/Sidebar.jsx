import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FiGrid, FiPackage, FiTruck, FiShoppingCart,
  FiDatabase, FiLogOut, FiUser,
  FiSearch
} from 'react-icons/fi';

const Sidebar = () => {
  const { user, logout, isAdmin, isOperator } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', icon: <FiGrid size={20} />, label: 'Dashboard', roles: ['MANAGER', 'OPERATOR'] },
    { path: '/warehouses', icon: <FiDatabase size={20} />, label: 'Warehouses', roles: ['MANAGER'] },
    { path: '/inventory', icon: <FiPackage size={20} />, label: 'Inventory', roles: ['MANAGER', 'OPERATOR'] },
    { path: '/receiving', icon: <FiTruck size={20} />, label: 'Shipment', roles: ['MANAGER', 'OPERATOR'] },
    { path: '/orders', icon: <FiShoppingCart size={20} />, label: 'Orders', roles: ['MANAGER', 'OPERATOR'] },
    { path: '/Scan',icon:<FiSearch size={20}/>,label:'ScanItem',roles:['MANAGER','OPERATOR']},
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
              {isAdmin() ? 'Manager' : isOperator() ? 'Operator' : 'Manager'}
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