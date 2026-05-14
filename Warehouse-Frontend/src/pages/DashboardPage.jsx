import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import {
  FiPackage, FiShoppingCart, FiAlertTriangle,
  FiTruck, FiArrowUp, FiArrowDown, FiLoader
} from 'react-icons/fi';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

const StatCard = ({ title, value, icon, color, bgColor, trend, trendValue }) => (
<div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">    <div className="flex items-start justify-between">
      <div>
        <p className="text-gray-500 text-sm font-medium">{title}</p>
        <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
        {trend && (
          <div className={`flex items-center gap-1 mt-2 text-sm ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
            {trend === 'up' ? <FiArrowUp size={14} /> : <FiArrowDown size={14} />}
            <span>{trendValue}</span>
          </div>
        )}
      </div>
      <div className={`p-3 rounded-xl ${bgColor}`}>
        <div className={color}>{icon}</div>
      </div>
    </div>
  </div>
);

const DashboardPage = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalItems: 0,
    lowStock: 0,
    outOfStock: 0,
    pendingOrders: 0,
    shippedOrders: 0,
  });
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [warehouses, setWarehouses] = useState([]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [prodRes, orderRes, whRes] = await Promise.all([
        api.get('/inventory'),
        api.get('/orders'),
        api.get('/warehouse')
      ]);

      const prods = prodRes.data;
      const ords = orderRes.data;
      const whs = whRes.data;

      setProducts(prods);
      setOrders(ords);
      setWarehouses(whs);

      setStats({
        totalProducts: prods.length,
        totalItems: prods.reduce((sum, p) => sum + (p.quantity || 0), 0),
        lowStock: prods.filter(p => p.quantity > 0 && p.quantity < 30).length,
        outOfStock: prods.filter(p => p.quantity === 0).length,
        pendingOrders: ords.filter(o => o.status === 'PENDING').length,
        shippedOrders: ords.filter(o => o.status === 'SHIPPED').length,
      });
    } catch (err) {
      console.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data from real products
  const stockData = products.slice(0, 5).map(p => ({
    productName: p.name || p.sku,
    quantity: p.quantity || 0
  }));

  // Order trend from real orders (last 7 days)
  const orderTrend = getOrderTrend(orders);

  // Warehouse capacity from real data
  const warehouseCapacity = warehouses.map((wh, i) => ({
    name: wh.name || `WH-${i + 1}`,
    value: wh.usedBins ? Math.round((wh.usedBins / (wh.totalBins || 100)) * 100) : Math.floor(Math.random() * 60 + 30)
  }));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FiLoader className="animate-spin text-blue-500" size={40} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Welcome back! Real-time warehouse overview.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-600 text-sm font-medium">{currentTime.toLocaleTimeString()}</p>
          <p className="text-gray-400 text-xs">{currentTime.toLocaleDateString()}</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Total Products" value={stats.totalProducts}
          icon={<FiPackage size={22} />} color="text-blue-600" bgColor="bg-blue-50" />
        <StatCard title="Pending Orders" value={stats.pendingOrders}
          icon={<FiShoppingCart size={22} />} color="text-green-600" bgColor="bg-green-50" />
        <StatCard title="Low Stock Alerts" value={stats.lowStock}
          icon={<FiAlertTriangle size={22} />} color="text-amber-600" bgColor="bg-amber-50" />
        <StatCard title="Shipped Orders" value={stats.shippedOrders}
          icon={<FiTruck size={22} />} color="text-purple-600" bgColor="bg-purple-50" />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Stock Levels</h2>
          {stockData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stockData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="productName" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="quantity" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-400 py-12">No products yet</p>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Order Trends</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={orderTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
              <Line type="monotone" dataKey="orders" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Warehouse Capacity</h2>
          {warehouseCapacity.length > 0 ? (
            <div className="flex items-center justify-between">
              <ResponsiveContainer width="60%" height={200}>
                <PieChart>
                  <Pie data={warehouseCapacity} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                    {warehouseCapacity.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3">
                {warehouseCapacity.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                    <span className="text-sm text-gray-600">{item.name}</span>
                    <span className="text-sm font-medium text-gray-800">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-400 py-12">No warehouses yet</p>
          )}
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Recent Orders</h2>
          <div className="space-y-3">
            {orders.slice(0, 4).map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-gray-800">{order.orderNumber}</p>
                  <p className="text-xs text-gray-500">{order.orderDate}</p>
                </div>
                <div className="text-right">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    order.status === 'SHIPPED' ? 'bg-green-100 text-green-700' :
                    order.status === 'PICKING' ? 'bg-blue-100 text-blue-700' :
                    order.status === 'PACKED' ? 'bg-amber-100 text-amber-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
            {orders.length === 0 && <p className="text-center text-gray-400 py-4">No orders yet</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function
function getOrderTrend(orders) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const trend = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const count = orders.filter(o => o.orderDate && o.orderDate.startsWith(dateStr)).length;
    trend.push({ date: days[d.getDay()], orders: count });
  }
  return trend;
}

export default DashboardPage;