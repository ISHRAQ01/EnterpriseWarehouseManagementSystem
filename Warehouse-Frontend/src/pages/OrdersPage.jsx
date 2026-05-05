import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import toast from 'react-hot-toast';
import {
  FiShoppingCart, FiPlus, FiX, FiPackage,
  FiTruck, FiCheck, FiClock, FiEye, FiLoader
} from 'react-icons/fi';

const statusConfig = {
  PENDING: {
    label: 'Pending', color: 'bg-gray-100 text-gray-700', icon: <FiClock size={14} />,
    next: 'PICKING', nextLabel: 'Start Picking', nextColor: 'bg-blue-600 hover:bg-blue-700'
  },
  PICKING: {
    label: 'Picking', color: 'bg-blue-100 text-blue-700', icon: <FiPackage size={14} />,
    next: 'PACKED', nextLabel: 'Mark Packed', nextColor: 'bg-amber-500 hover:bg-amber-600'
  },
  PACKED: {
    label: 'Packed', color: 'bg-amber-100 text-amber-700', icon: <FiPackage size={14} />,
    next: 'SHIPPED', nextLabel: 'Mark Shipped', nextColor: 'bg-green-600 hover:bg-green-700'
  },
  SHIPPED: {
    label: 'Shipped', color: 'bg-green-100 text-green-700', icon: <FiTruck size={14} />,
    next: null, nextLabel: null, nextColor: null
  },
};

const NewOrderModal = ({ onClose, onAdd }) => {
  const [orderNumber, setOrderNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.get('/orders/create', { params: { orderNumber } });
      toast.success('Order created!');
      onAdd(res.data);
      onClose();
    } catch (err) {
      toast.error('Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">New Order</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><FiX size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input placeholder="Order Number (ORD-001)" value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2">
              {loading ? <FiLoader className="animate-spin" /> : null} Create Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const OrderDetailModal = ({ order, onClose }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">Order {order.orderNumber}</h2>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><FiX size={20} /></button>
      </div>
      <p className="text-gray-500 mb-4">Status: <span className="font-bold">{order.status}</span></p>
      {order.barcodeImage && (
        <div className="p-4 bg-gray-50 rounded-xl inline-block">
          <img src={`data:image/png;base64,${order.barcodeImage}`} alt="QR Code" className="w-48 h-48 mx-auto" />
          <p className="text-xs text-gray-400 mt-2">Scan for order details</p>
        </div>
      )}
      {!order.barcodeImage && (
        <p className="text-gray-400 text-sm">No barcode available</p>
      )}
    </div>
  </div>
);

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/orders');
      setOrders(res.data);
    } catch (err) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (orderNumber, newStatus) => {
    try {
      await api.get(`/orders/${orderNumber}/status`, { params: { newStatus } });
      toast.success(`Order ${newStatus}`);
      fetchOrders();
    } catch (err) {
      toast.error('Failed to update order');
    }
  };

  const filteredOrders = filterStatus === 'ALL' ? orders : orders.filter(o => o.status === filterStatus);

  const counts = {
    ALL: orders.length,
    PENDING: orders.filter(o => o.status === 'PENDING').length,
    PICKING: orders.filter(o => o.status === 'PICKING').length,
    PACKED: orders.filter(o => o.status === 'PACKED').length,
    SHIPPED: orders.filter(o => o.status === 'SHIPPED').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FiLoader className="animate-spin text-blue-500" size={40} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Orders</h1>
          <p className="text-gray-500 text-sm mt-1">Manage and track all orders</p>
        </div>
        <button onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl">
          <FiPlus size={18} /> New Order
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['ALL', 'PENDING', 'PICKING', 'PACKED', 'SHIPPED'].map((status) => (
          <button key={status} onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors
              ${filterStatus === status ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}>
            {status} ({counts[status]})
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredOrders.map((order) => {
          const config = statusConfig[order.status] || statusConfig['PENDING'];
          return (
            <div key={order.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                    <FiShoppingCart className="text-blue-500" size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <p className="font-bold text-gray-800">{order.orderNumber}</p>
                      <span className={`flex items-center gap-1 text-xs px-3 py-1 rounded-full font-medium ${config.color}`}>
                        {config.icon}{config.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {order.orderDate} • Last updated: {order.lastUpdated}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Barcode/QR Button */}
                  <button onClick={() => setSelectedOrder(order)}
                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg" title="View QR Code">
                    <FiEye size={18} />
                  </button>

                  {config.next && (
                    <button onClick={() => updateStatus(order.orderNumber, config.next)}
                      className={`text-sm text-white px-4 py-2 rounded-xl transition-colors ${config.nextColor}`}>
                      {config.nextLabel}
                    </button>
                  )}
                  {!config.next && (
                    <div className="flex items-center gap-1 text-green-600 bg-green-50 px-3 py-2 rounded-xl text-sm">
                      <FiCheck size={16} /> Completed
                    </div>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Pending</span><span>Picking</span><span>Packed</span><span>Shipped</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className={`h-2 rounded-full transition-all duration-500 ${
                    order.status === 'PENDING' ? 'w-1/4 bg-gray-400' :
                    order.status === 'PICKING' ? 'w-2/4 bg-blue-500' :
                    order.status === 'PACKED' ? 'w-3/4 bg-amber-500' :
                    'w-full bg-green-500'
                  }`} />
                </div>
              </div>

              {/* Small Barcode Preview */}
              {order.barcodeImage && (
                <div className="mt-3 flex justify-center">
                  <img src={`data:image/png;base64,${order.barcodeImage}`} alt="QR" className="w-16 h-16 opacity-50" />
                </div>
              )}
            </div>
          );
        })}
        {filteredOrders.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <FiShoppingCart size={40} className="mx-auto mb-3" />
            <p>No orders found</p>
          </div>
        )}
      </div>

      {showNewModal && (
        <NewOrderModal onClose={() => setShowNewModal(false)} onAdd={fetchOrders} />
      )}

      {selectedOrder && (
        <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </div>
  );
};

export default OrdersPage;