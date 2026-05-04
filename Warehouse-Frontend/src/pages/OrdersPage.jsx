import React, { useState } from 'react';
import {
  FiShoppingCart, FiPlus, FiX, FiPackage,
  FiTruck, FiCheck, FiClock, FiEye
} from 'react-icons/fi';

// Dummy Orders Data
const initialOrders = [
  {
    id: 1, orderNo: '#00001', customer: 'John Doe',
    items: [
      { name: 'Laptop Dell XPS', qty: 2, price: 1200 },
      { name: 'Wireless Mouse', qty: 1, price: 25 },
    ],
    status: 'PENDING', date: '2026-04-27', total: 2425
  },
  {
    id: 2, orderNo: '#00002', customer: 'Jane Smith',
    items: [
      { name: 'Monitor 27 inch', qty: 1, price: 350 },
    ],
    status: 'PICKING', date: '2026-04-27', total: 350
  },
  {
    id: 3, orderNo: '#00003', customer: 'Bob Johnson',
    items: [
      { name: 'Keyboard Mechanical', qty: 2, price: 89 },
      { name: 'USB Hub 7 Port', qty: 1, price: 35 },
    ],
    status: 'PACKED', date: '2026-04-26', total: 213
  },
  {
    id: 4, orderNo: '#00004', customer: 'Alice Brown',
    items: [
      { name: 'Webcam HD 1080p', qty: 3, price: 75 },
    ],
    status: 'SHIPPED', date: '2026-04-26', total: 225
  },
  {
    id: 5, orderNo: '#00005', customer: 'Charlie Wilson',
    items: [
      { name: 'Headphones Sony', qty: 1, price: 199 },
      { name: 'HDMI Cable 2m', qty: 2, price: 12 },
    ],
    status: 'PENDING', date: '2026-04-27', total: 223
  },
];

// Status Config
const statusConfig = {
  PENDING: {
    label: 'Pending',
    color: 'bg-gray-100 text-gray-700',
    icon: <FiClock size={14} />,
    next: 'PICKING',
    nextLabel: 'Start Picking',
    nextColor: 'bg-blue-600 hover:bg-blue-700'
  },
  PICKING: {
    label: 'Picking',
    color: 'bg-blue-100 text-blue-700',
    icon: <FiPackage size={14} />,
    next: 'PACKED',
    nextLabel: 'Mark as Packed',
    nextColor: 'bg-amber-500 hover:bg-amber-600'
  },
  PACKED: {
    label: 'Packed',
    color: 'bg-amber-100 text-amber-700',
    icon: <FiPackage size={14} />,
    next: 'SHIPPED',
    nextLabel: 'Mark as Shipped',
    nextColor: 'bg-green-600 hover:bg-green-700'
  },
  SHIPPED: {
    label: 'Shipped',
    color: 'bg-green-100 text-green-700',
    icon: <FiTruck size={14} />,
    next: null,
    nextLabel: null,
    nextColor: null
  },
};

// Order Detail Modal
const OrderDetailModal = ({ order, onClose }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">
          Order {order.orderNo}
        </h2>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
          <FiX size={20} />
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Customer</span>
          <span className="font-medium text-gray-800">{order.customer}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Date</span>
          <span className="font-medium text-gray-800">{order.date}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Status</span>
          <span className={`text-xs px-3 py-1 rounded-full font-medium
                           ${statusConfig[order.status].color}`}>
            {statusConfig[order.status].label}
          </span>
        </div>

        <div className="border-t pt-4">
          <p className="text-sm font-semibold text-gray-700 mb-3">Items:</p>
          <div className="space-y-2">
            {order.items.map((item, index) => (
              <div key={index}
                className="flex justify-between items-center p-3
                           bg-gray-50 rounded-xl text-sm">
                <div>
                  <p className="font-medium text-gray-800">{item.name}</p>
                  <p className="text-gray-500">Qty: {item.qty}</p>
                </div>
                <p className="font-semibold text-gray-800">
                  ${item.price * item.qty}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t pt-4 flex justify-between">
          <span className="font-bold text-gray-800">Total</span>
          <span className="font-bold text-blue-600 text-lg">${order.total}</span>
        </div>
      </div>
    </div>
  </div>
);

// Main Orders Page
const OrdersPage = () => {
  const [orders, setOrders] = useState(initialOrders);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Update Order Status
  const updateStatus = (orderId, newStatus) => {
    setOrders(orders.map(order =>
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
  };

  // Filter Orders
  const filteredOrders = orders.filter(order =>
    filterStatus === 'ALL' || order.status === filterStatus
  );

  // Count by Status
  const counts = {
    ALL: orders.length,
    PENDING: orders.filter(o => o.status === 'PENDING').length,
    PICKING: orders.filter(o => o.status === 'PICKING').length,
    PACKED: orders.filter(o => o.status === 'PACKED').length,
    SHIPPED: orders.filter(o => o.status === 'SHIPPED').length,
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Orders</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage and track all orders
          </p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700
                           text-white px-5 py-2.5 rounded-xl transition-colors">
          <FiPlus size={18} />
          New Order
        </button>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {['ALL', 'PENDING', 'PICKING', 'PACKED', 'SHIPPED'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors
                        ${filterStatus === status
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                        }`}
          >
            {status} ({counts[status]})
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {filteredOrders.map((order) => {
          const config = statusConfig[order.status];
          return (
            <div key={order.id}
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100
                         hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">

                {/* Order Info */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl
                                  flex items-center justify-center">
                    <FiShoppingCart className="text-blue-500" size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <p className="font-bold text-gray-800">{order.orderNo}</p>
                      <span className={`flex items-center gap-1 text-xs px-3 py-1
                                       rounded-full font-medium ${config.color}`}>
                        {config.icon}
                        {config.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {order.customer} •{' '}
                      {order.items.length} items •{' '}
                      {order.date}
                    </p>
                  </div>
                </div>

                {/* Right Side */}
                <div className="flex items-center gap-3">
                  <p className="font-bold text-gray-800 text-lg">
                    ${order.total}
                  </p>

                  {/* View Button */}
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                  >
                    <FiEye size={18} />
                  </button>

                  {/* Next Status Button */}
                  {config.next && (
                    <button
                      onClick={() => updateStatus(order.id, config.next)}
                      className={`text-sm text-white px-4 py-2 rounded-xl
                                  transition-colors ${config.nextColor}`}
                    >
                      {config.nextLabel}
                    </button>
                  )}

                  {/* Completed Badge */}
                  {!config.next && (
                    <div className="flex items-center gap-1 text-green-600
                                    bg-green-50 px-3 py-2 rounded-xl text-sm">
                      <FiCheck size={16} />
                      Completed
                    </div>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Pending</span>
                  <span>Picking</span>
                  <span>Packed</span>
                  <span>Shipped</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      order.status === 'PENDING' ? 'w-1/4 bg-gray-400' :
                      order.status === 'PICKING' ? 'w-2/4 bg-blue-500' :
                      order.status === 'PACKED'  ? 'w-3/4 bg-amber-500' :
                      'w-full bg-green-500'
                    }`}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
};

export default OrdersPage;