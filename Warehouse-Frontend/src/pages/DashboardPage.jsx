import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import {
  FiPackage, FiShoppingCart, FiAlertTriangle,
  FiTruck, FiArrowUp, FiArrowDown, FiDatabase, FiLoader, FiClock, FiBox, FiTrendingUp
} from 'react-icons/fi';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

// ===================== Stat Card =====================
const StatCard = ({ title, value, icon, color, bgColor, trend, trendValue, subtitle }) => (
  <div className="bg-white rounded-2xl p-5 border border-gray-200 hover:shadow-lg transition-all duration-300 group cursor-default">
    <div className="flex items-start justify-between mb-3">
      <div className={`w-12 h-12 ${bgColor} rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300`}>
        <div className={color}>{icon}</div>
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
          trend === 'up' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
        }`}>
          {trend === 'up' ? <FiArrowUp size={12} /> : <FiArrowDown size={12} />}
          {trendValue}
        </div>
      )}
    </div>
    <div>
      <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">{title}</p>
      <p className="text-3xl font-bold text-gray-800 tracking-tight">{value}</p>
      {subtitle && <p className="text-gray-400 text-xs mt-1">{subtitle}</p>}
    </div>
  </div>
);

// ===================== Calculate Warehouse Capacity =====================
const calculateWarehouseCapacity = async (whs) => {
  const capacityData = [];
  for (const wh of whs) {
    const totalBins = (wh.zones || []).reduce((sum, z) =>
      sum + (z.aisles || []).reduce((aSum, a) => aSum + (a.bins || []).length, 0), 0
    );
    let usedBins = 0;
    try {
      const occRes = await api.get(`/warehouse/${wh.id}/occupancy`);
      usedBins = occRes.data?.usedBins || 0;
    } catch {}
    capacityData.push({
      name: wh.name || `WH-${wh.id}`,
      value: totalBins > 0 ? Math.round((usedBins / totalBins) * 100) : 0,
      totalBins,
      usedBins
    });
  }
  return capacityData;
};

// ===================== Get Order Trend =====================
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

// ===================== Dashboard Page =====================
const DashboardPage = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0, totalItems: 0, lowStock: 0,
    outOfStock: 0, pendingOrders: 0, shippedOrders: 0,
  });
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [warehouseCapacity, setWarehouseCapacity] = useState([]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => { fetchAllData(); }, []);

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

      const capacityData = await calculateWarehouseCapacity(whs);
      setWarehouseCapacity(capacityData);

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

  const stockData = products.slice(0, 8).map(p => ({
    productName: p.name || p.sku,
    quantity: p.quantity || 0,
    fill: p.quantity === 0 ? '#ef4444' : p.quantity < 30 ? '#f59e0b' : '#3b82f6'
  }));

  const orderTrend = getOrderTrend(orders);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <FiLoader className="animate-spin text-blue-500 mb-4" size={48} />
        <p className="text-gray-400 font-medium">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{getGreeting()} 👋</h1>
          <p className="text-gray-500 text-sm mt-1">Here's what's happening in your warehouse today.</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 px-5 py-3 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
            <FiClock size={18} className="text-blue-500" />
          </div>
          <div>
            <p className="text-gray-800 text-lg font-bold tracking-tight">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
            <p className="text-gray-400 text-xs">{currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Total Products" value={stats.totalProducts}
          icon={<FiBox size={22} />} color="text-blue-600" bgColor="bg-blue-50"
          subtitle={`${stats.totalItems.toLocaleString()} total items`} />
        <StatCard title="Pending Orders" value={stats.pendingOrders}
          icon={<FiShoppingCart size={22} />} color="text-green-600" bgColor="bg-green-50"
          trend="up" trendValue="Needs attention" />
        <StatCard title="Low Stock Alerts" value={stats.lowStock + stats.outOfStock}
          icon={<FiAlertTriangle size={22} />} color="text-amber-600" bgColor="bg-amber-50"
          subtitle={`${stats.outOfStock} out of stock`}
          trend={stats.outOfStock > 0 ? 'down' : null}
          trendValue={stats.outOfStock > 0 ? `${stats.outOfStock} critical` : ''} />
        <StatCard title="Shipped Orders" value={stats.shippedOrders}
          icon={<FiTruck size={22} />} color="text-purple-600" bgColor="bg-purple-50"
          subtitle="All time" />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 hover:shadow-md transition-all overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div><h2 className="text-lg font-semibold text-gray-800">Stock Levels</h2><p className="text-sm text-gray-400">Top products by quantity</p></div>
              <FiTrendingUp size={18} className="text-gray-400" />
            </div>
          </div>
          <div className="p-6">
            {stockData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={stockData} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="productName" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 10px 40px rgba(0,0,0,0.08)', fontSize: '13px' }} />
                  <Bar dataKey="quantity" radius={[8, 8, 0, 0]}>
                    {stockData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.fill} />))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-16"><FiBox size={48} className="mx-auto mb-3 text-gray-300" /><p className="text-gray-400 font-medium">No products yet</p></div>
            )}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 hover:shadow-md transition-all overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div><h2 className="text-lg font-semibold text-gray-800">Order Trends</h2><p className="text-sm text-gray-400">Last 7 days</p></div>
              <FiTrendingUp size={18} className="text-gray-400" />
            </div>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={orderTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 10px 40px rgba(0,0,0,0.08)', fontSize: '13px' }} />
                <defs>
                  <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Line type="monotone" dataKey="orders" stroke="#10b981" strokeWidth={3}
                  dot={{ fill: '#10b981', r: 6, strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 8, fill: '#10b981', stroke: '#fff', strokeWidth: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 hover:shadow-md transition-all overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div><h2 className="text-lg font-semibold text-gray-800">Warehouse Capacity</h2><p className="text-sm text-gray-400">Distribution across warehouses</p></div>
            </div>
          </div>
          <div className="p-6">
            {warehouseCapacity.length > 0 ? (
              <div className="flex items-center gap-6">
                <ResponsiveContainer width="55%" height={220}>
                  <PieChart>
                    <Pie data={warehouseCapacity} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" strokeWidth={0}>
                      {warehouseCapacity.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-4 flex-1">
                  {warehouseCapacity.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span className="text-sm font-medium text-gray-700">{item.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-gray-800">{item.value}%</span>
                        <p className="text-xs text-gray-400">{item.usedBins}/{item.totalBins} bins</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-16"><FiDatabase size={48} className="mx-auto mb-3 text-gray-300" /><p className="text-gray-400 font-medium">No warehouses yet</p></div>
            )}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 hover:shadow-md transition-all overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div><h2 className="text-lg font-semibold text-gray-800">Recent Orders</h2><p className="text-sm text-gray-400">Latest 5 orders</p></div>
              <FiShoppingCart size={18} className="text-gray-400" />
            </div>
          </div>
          <div className="p-4 space-y-2">
            {orders.slice(0, 5).map((order) => {
              const statusColors = {
                'PENDING': 'bg-gray-100 text-gray-700', 'PICKING': 'bg-blue-100 text-blue-700',
                'PACKED': 'bg-amber-100 text-amber-700', 'SHIPPED': 'bg-green-100 text-green-700',
                'RECEIVED': 'bg-green-100 text-green-700', 'PROCESSING': 'bg-blue-100 text-blue-700',
              };
              const statusColor = statusColors[order.status] || 'bg-gray-100 text-gray-700';
              return (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full group-hover:scale-125 transition-transform"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{order.orderNumber?.split('|')[0] || order.orderNumber}</p>
                      <p className="text-xs text-gray-400">{order.orderDate ? new Date(order.orderDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColor}`}>{order.status}</span>
                </div>
              );
            })}
            {orders.length === 0 && (
              <div className="text-center py-12"><FiShoppingCart size={40} className="mx-auto mb-3 text-gray-300" /><p className="text-gray-400 font-medium">No orders yet</p></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;