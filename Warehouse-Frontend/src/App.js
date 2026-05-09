import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Sidebar from './components/common/Sidebar';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import InventoryPage from './pages/InventoryPage';
import OrdersPage from './pages/OrdersPage';
import ReceivingPage from './pages/ReceivingPage';
import WarehousePage from './pages/WarehousePage';

// Layout
const Layout = () => (
  <div className="flex">
    <Sidebar />
    <main className="flex-1 overflow-auto bg-gray-50 min-h-screen">
      <Outlet />
    </main>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/receiving" element={<ReceivingPage />} />
            <Route path="/warehouses" element={<WarehousePage />} />
          </Route>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
// Day 2: Tailwind CSS configuration
// Day 3: Created 3D Login Page with Glassmorphism Effect and Dashboard Layout with Sidebar Navigation
 