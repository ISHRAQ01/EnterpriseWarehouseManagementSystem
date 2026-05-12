import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import toast from 'react-hot-toast';
import {
  FiShoppingCart, FiPlus, FiX, FiPackage,
  FiTruck, FiCheck, FiClock, FiEye, FiLoader, FiMapPin
} from 'react-icons/fi';

const statusConfig = {
  PENDING: { label: 'Pending', color: 'bg-gray-100 text-gray-700', icon: <FiClock size={14} />,
    next: 'PICKING', nextLabel: 'Start Picking', nextColor: 'bg-blue-600 hover:bg-blue-700' },
  PICKING: { label: 'Picking', color: 'bg-blue-100 text-blue-700', icon: <FiPackage size={14} />,
    next: 'PACKED', nextLabel: 'Mark as Packed', nextColor: 'bg-amber-500 hover:bg-amber-600' },
  PACKED: { label: 'Packed', color: 'bg-amber-100 text-amber-700', icon: <FiPackage size={14} />,
    next: 'SHIPPED', nextLabel: 'Mark as Shipped', nextColor: 'bg-green-600 hover:bg-green-700' },
  SHIPPED: { label: 'Shipped', color: 'bg-green-100 text-green-700', icon: <FiTruck size={14} />,
    next: null, nextLabel: null, nextColor: null },
};

const NewOrderModal = ({ onClose, onAdd }) => {
  const [form, setForm] = useState({ sku: '', quantity: '', customerName: '', phone: '', address: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.sku || !form.quantity || !form.customerName || !form.phone || !form.address) {
      toast.error('Please fill all fields');
      return;
    }
    setLoading(true);
    try {
      const orderNumber = `ORD-${Date.now().toString().slice(-6)}|SKU:${form.sku}|QTY:${form.quantity}|CUST:${form.customerName}|PHONE:${form.phone}|ADDR:${form.address}`;
      await api.get('/orders/create', { params: { orderNumber } });
      toast.success('Order created!');
      onAdd(); onClose();
    } catch (err) { toast.error('Failed to create order'); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6"><h2 className="text-xl font-bold text-gray-800">New Order</h2><button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><FiX size={20} /></button></div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label><input placeholder="e.g. John Doe" value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" required /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label><input type="tel" placeholder="e.g. +1 234 567 8900" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" required /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Address *</label><textarea placeholder="e.g. 123 Main St, New York, NY 10001" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} rows="2" className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" required /></div>
          <div className="border-t pt-4"><p className="text-sm font-semibold text-gray-700 mb-2">Order Details</p>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Product SKU *</label><input placeholder="e.g. M1" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" required /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label><input type="number" placeholder="e.g. 5" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" required /></div>
            </div>
          </div>
          <div className="flex gap-3 pt-2"><button type="button" onClick={onClose} className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl hover:bg-gray-50">Cancel</button><button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2">{loading ? <FiLoader className="animate-spin" /> : null} Create Order</button></div>
        </form>
      </div>
    </div>
  );
};

const OrderDetailModal = ({ order, onClose }) => {
  const [product, setProduct] = useState(null);

  useEffect(() => {
    const parts = order.orderNumber.split('|');
    const sku = parts[1]?.replace('SKU:', '');
    if (sku) {
      api.get(`/inventory/${sku}`).then(res => setProduct(res.data)).catch(() => setProduct(null));
    }
  }, [order]);

  const info = parseOrderInfo(order.orderNumber);
  const parts = order.orderNumber.split('|');
  const sku = parts[1]?.replace('SKU:', '') || 'N/A';
  const qty = parts[2]?.replace('QTY:', '') || '0';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-6"><h2 className="text-xl font-bold text-gray-800">Order {order.orderNumber.split('|')[0]}</h2><button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><FiX size={20} /></button></div>
        <div className="space-y-4">
          <div className="flex justify-between text-sm"><span className="text-gray-500">Date</span><span className="font-medium">{order.orderDate || 'N/A'}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-500">Status</span><span className="font-bold">{order.status}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-500">Customer</span><span className="font-medium">{info.customer}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-500">Phone</span><span className="font-medium">{info.phone}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-500">Address</span><span className="font-medium text-xs">{info.address}</span></div>
          <div className="border-t pt-4"><p className="text-sm font-semibold text-gray-700 mb-3">Items & Bin Locations:</p>
            <div className="p-4 bg-gray-50 rounded-xl space-y-3">
              <div><p className="text-sm font-semibold text-gray-800">{product ? product.name : 'Product'}</p><p className="text-xs text-gray-500">SKU: {sku}</p><p className="text-xs text-gray-500">Quantity: {qty}</p><p className="text-xs text-purple-600 mt-1"><FiMapPin className="inline" size={12} /> Location: {product?.binCode || 'Not assigned'}</p></div>
            </div>
          </div>
          {order.barcodeImage && (<div className="flex justify-center p-3 bg-gray-50 rounded-xl"><img src={`data:image/png;base64,${order.barcodeImage}`} alt="QR" className="w-40 h-40" /></div>)}
        </div>
      </div>
    </div>
  );
};

// Helper function
function parseOrderInfo(orderNumber) {
  const parts = orderNumber.split('|');
  return {
    sku: parts[1]?.replace('SKU:', '') || 'N/A',
    qty: parts[2]?.replace('QTY:', '') || '0',
    customer: parts[3]?.replace('CUST:', '') || 'Unknown',
    phone: parts[4]?.replace('PHONE:', '') || 'N/A',
    address: parts[5]?.replace('ADDR:', '') || 'N/A'
  };
}

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
      const customerOrders = res.data.filter(o => o.orderNumber.startsWith('ORD-'));
      setOrders(customerOrders);
    } catch { toast.error('Failed to load orders'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (orderNumber, newStatus) => {
    try { await api.get(`/orders/${orderNumber}/status`, { params: { newStatus } }); toast.success(`Order ${newStatus}`); fetchOrders(); }
    catch { toast.error('Failed to update order'); }
  };

  const filteredOrders = filterStatus === 'ALL' ? orders : orders.filter(o => o.status === filterStatus);
  const counts = { ALL: orders.length, PENDING: orders.filter(o => o.status === 'PENDING').length, PICKING: orders.filter(o => o.status === 'PICKING').length, PACKED: orders.filter(o => o.status === 'PACKED').length, SHIPPED: orders.filter(o => o.status === 'SHIPPED').length };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><FiLoader className="animate-spin text-blue-500" size={40} /></div>;

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold text-gray-800">Orders</h1><p className="text-gray-500 text-sm mt-1">Manage and track all orders</p></div><button onClick={() => setShowNewModal(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl"><FiPlus size={18} /> New Order</button></div>
      <div className="flex gap-2 flex-wrap">{['ALL', 'PENDING', 'PICKING', 'PACKED', 'SHIPPED'].map(status => (<button key={status} onClick={() => setFilterStatus(status)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filterStatus === status ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}>{status} ({counts[status]})</button>))}</div>
      <div className="space-y-3">
        {filteredOrders.map(order => {
          const config = statusConfig[order.status] || statusConfig['PENDING'];
          const info = parseOrderInfo(order.orderNumber);
          return (
            <div key={order.id} className="bg-white rounded-2xl p-5 shadow-sm border hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4"><div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center"><FiShoppingCart className="text-blue-500" size={20} /></div><div><div className="flex items-center gap-3"><p className="font-bold text-gray-800">{order.orderNumber.split('|')[0]}</p><span className={`flex items-center gap-1 text-xs px-3 py-1 rounded-full font-medium ${config.color}`}>{config.icon}{config.label}</span></div><p className="text-sm text-gray-500 mt-0.5">{info.customer} • {info.qty} items • {order.orderDate}</p></div></div>
                <div className="flex items-center gap-3"><button onClick={() => setSelectedOrder(order)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"><FiEye size={18} /></button>{config.next && (<button onClick={() => updateStatus(order.orderNumber, config.next)} className={`text-sm text-white px-4 py-2 rounded-xl transition-colors ${config.nextColor}`}>{config.nextLabel}</button>)}{!config.next && (<div className="flex items-center gap-1 text-green-600 bg-green-50 px-3 py-2 rounded-xl text-sm"><FiCheck size={16} /> Completed</div>)}</div>
              </div>
              <div className="mt-4"><div className="flex justify-between text-xs text-gray-400 mb-1"><span>Pending</span><span>Picking</span><span>Packed</span><span>Shipped</span></div><div className="w-full bg-gray-100 rounded-full h-2"><div className={`h-2 rounded-full transition-all ${order.status === 'PENDING' ? 'w-1/4 bg-gray-400' : order.status === 'PICKING' ? 'w-2/4 bg-blue-500' : order.status === 'PACKED' ? 'w-3/4 bg-amber-500' : 'w-full bg-green-500'}`} /></div></div>
              {order.barcodeImage && (<div className="mt-3 flex justify-center"><img src={`data:image/png;base64,${order.barcodeImage}`} alt="QR" className="w-16 h-16 opacity-50" /></div>)}
            </div>
          );
        })}
        {filteredOrders.length === 0 && (<div className="text-center py-12 text-gray-400"><FiShoppingCart size={40} className="mx-auto mb-3" /><p>No orders found</p></div>)}
      </div>
      {showNewModal && <NewOrderModal onClose={() => setShowNewModal(false)} onAdd={fetchOrders} />}
      {selectedOrder && <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />}
    </div>
  );
};

export default OrdersPage;