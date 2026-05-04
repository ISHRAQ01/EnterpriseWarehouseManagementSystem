import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import {
  FiPackage, FiShoppingCart, FiAlertTriangle,
  FiTruck, FiArrowUp, FiArrowDown
} from 'react-icons/fi';

// ============================================
// DUMMY DATA (Backend Connect ஆகும் வரை)
// ============================================
const stockData = [
  { productName: 'Product A', quantity: 120 },
  { productName: 'Product B', quantity: 45 },
  { productName: 'Product C', quantity: 89 },
  { productName: 'Product D', quantity: 12 },
  { productName: 'Product E', quantity: 200 },
];

const orderTrend = [
  { date: 'Mon', orders: 12 },
  { date: 'Tue', orders: 19 },
  { date: 'Wed', orders: 8 },
  { date: 'Thu', orders: 25 },
  { date: 'Fri', orders: 30 },
  { date: 'Sat', orders: 15 },
  { date: 'Sun', orders: 10 },
];

const warehouseCapacity = [
  { name: 'Zone A', value: 75 },
  { name: 'Zone B', value: 45 },
  { name: 'Zone C', value: 90 },
  { name: 'Zone D', value: 30 },
];

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

// ============================================
// STAT CARD COMPONENT
// ============================================
const StatCard = ({ title, value, icon, color, bgColor, trend, trendValue }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100
                  hover:shadow-md transition-shadow duration-300">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-gray-500 text-sm font-medium">{title}</p>
        <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
        {trend && (
          <div className={`flex items-center gap-1 mt-2 text-sm ${
            trend === 'up' ? 'text-green-500' : 'text-red-500'
          }`}>
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

// ============================================
// MAIN DASHBOARD
// ============================================
const DashboardPage = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            Welcome back! Here's what's happening today.
          </p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-600 text-sm font-medium">
            {currentTime.toLocaleTimeString()}
          </p>
          <p className="text-gray-400 text-xs">
            {currentTime.toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Products"
          value="1,284"
          icon={<FiPackage size={22} />}
          color="text-blue-600"
          bgColor="bg-blue-50"
          trend="up"
          trendValue="+12% this week"
        />
        <StatCard
          title="Pending Orders"
          value="48"
          icon={<FiShoppingCart size={22} />}
          color="text-green-600"
          bgColor="bg-green-50"
          trend="up"
          trendValue="+5 today"
        />
        <StatCard
          title="Low Stock Alerts"
          value="7"
          icon={<FiAlertTriangle size={22} />}
          color="text-amber-600"
          bgColor="bg-amber-50"
          trend="down"
          trendValue="-2 from yesterday"
        />
        <StatCard
          title="Shipments Today"
          value="23"
          icon={<FiTruck size={22} />}
          color="text-purple-600"
          bgColor="bg-purple-50"
          trend="up"
          trendValue="+8 from yesterday"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* Stock Levels Bar Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-700">
              Stock Levels
            </h2>
            <span className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full">
              This Week
            </span>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={stockData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="productName" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  borderRadius: '10px',
                  border: 'none',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                }}
              />
              <Bar dataKey="quantity" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Order Trend Line Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-700">
              Order Trends
            </h2>
            <span className="text-xs bg-green-50 text-green-600 px-3 py-1 rounded-full">
              Last 7 Days
            </span>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={orderTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  borderRadius: '10px',
                  border: 'none',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                }}
              />
              <Line
                type="monotone"
                dataKey="orders"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ fill: '#10b981', r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* Warehouse Capacity Pie Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Warehouse Capacity
          </h2>
          <div className="flex items-center justify-between">
            <ResponsiveContainer width="60%" height={200}>
              <PieChart>
                <Pie
                  data={warehouseCapacity}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="value"
                >
                  {warehouseCapacity.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div className="space-y-3">
              {warehouseCapacity.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index] }}
                  />
                  <span className="text-sm text-gray-600">{item.name}</span>
                  <span className="text-sm font-medium text-gray-800">
                    {item.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Recent Orders
          </h2>
          <div className="space-y-3">
            {[
              { id: '#00123', customer: 'John Doe', status: 'SHIPPED', amount: '$234' },
              { id: '#00124', customer: 'Jane Smith', status: 'PICKING', amount: '$189' },
              { id: '#00125', customer: 'Bob Johnson', status: 'PENDING', amount: '$456' },
              { id: '#00126', customer: 'Alice Brown', status: 'PACKED', amount: '$123' },
            ].map((order) => (
              <div key={order.id}
                className="flex items-center justify-between p-3 
                           bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div>
                  <p className="text-sm font-medium text-gray-800">{order.id}</p>
                  <p className="text-xs text-gray-500">{order.customer}</p>
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
                  <p className="text-sm font-bold text-gray-800 mt-1">{order.amount}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;