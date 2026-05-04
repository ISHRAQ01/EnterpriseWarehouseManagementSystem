import React, { useState } from 'react';
import api from '../api/axiosConfig';
import toast from 'react-hot-toast';
import { FiCamera, FiPackage, FiTruck, FiSearch, FiMapPin } from 'react-icons/fi';

const OperatorDashboard = () => {
  const [activeTab, setActiveTab] = useState('scan');
  const [scanInput, setScanInput] = useState('');
  const [product, setProduct] = useState(null);

  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [barcode, setBarcode] = useState('');
  const [binCode, setBinCode] = useState('');
  const [quantity, setQuantity] = useState('');

  const [orderNumber, setOrderNumber] = useState('');
  const [order, setOrder] = useState(null);

  const handleScan = async () => {
    if (!scanInput) return;
    try {
      const res = await api.get(`/inventory/${scanInput}`);
      setProduct(res.data);
      toast.success('Item found!');
    } catch (err) {
      toast.error('Item not found');
      setProduct(null);
    }
  };

  const handleReceive = async (e) => {
    e.preventDefault();
    try {
      await api.get('/inventory/receive', { params: { sku, name, barcode, binCode, quantity } });
      toast.success('Item received and putaway to bin!');
      setSku(''); setName(''); setBarcode(''); setBinCode(''); setQuantity('');
    } catch (err) {
      toast.error('Failed to receive item');
    }
  };

  const handlePick = async (e) => {
    e.preventDefault();
    try {
      const res = await api.get(`/orders/${orderNumber}`);
      setOrder(res.data);
      toast.success(`Order ${orderNumber} found!`);
    } catch (err) {
      toast.error('Order not found');
      setOrder(null);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      await api.get(`/orders/${orderNumber}/status`, { params: { newStatus } });
      toast.success(`Order updated to ${newStatus}`);
      setOrder({ ...order, status: newStatus });
    } catch (err) {
      toast.error('Failed to update order');
    }
  };

  const tabs = [
    { id: 'scan', label: '📷 Scan Item', icon: <FiCamera /> },
    { id: 'receive', label: '📥 Receive & Putaway', icon: <FiPackage /> },
    { id: 'pick', label: '📦 Pick & Ship', icon: <FiTruck /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">🚚 Operator Console</h1>
        <p className="text-blue-200 text-sm mb-8">Scan inbound items, putaway to bins, and pick for shipping</p>

        <div className="flex gap-2 mb-8">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); setProduct(null); setOrder(null); }}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all text-sm
                ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg' : 'bg-white/10 text-blue-200 hover:bg-white/20'}`}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* ========== SCAN ========== */}
        {activeTab === 'scan' && (
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 text-center">
            <FiCamera className="text-blue-300 mx-auto mb-4" size={50} />
            <h2 className="text-xl font-bold text-white mb-2">Scan Barcode or SKU</h2>
            <p className="text-blue-200 text-sm mb-4">Use barcode scanner or type SKU to find item location</p>
            <div className="flex gap-2">
              <input type="text" placeholder="Scan or type SKU/Barcode..." value={scanInput}
                onChange={e => setScanInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleScan()}
                className="flex-1 p-4 bg-white/10 border border-white/20 rounded-xl text-white text-lg placeholder-blue-300/50 focus:outline-none" autoFocus />
              <button onClick={handleScan} className="px-6 py-4 bg-blue-600 text-white rounded-xl font-bold">
                <FiSearch size={20} />
              </button>
            </div>

            {product && (
              <div className="mt-6 p-6 bg-white/5 rounded-xl border border-white/10 text-left">
                <h3 className="text-white font-bold text-lg mb-3">{product.name}</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <p className="text-blue-200">SKU: <span className="text-white font-bold">{product.sku}</span></p>
                  <p className="text-blue-200">Barcode: <span className="text-white">{product.barcode || 'N/A'}</span></p>
                  <p className="text-blue-200">Quantity: <span className={product.quantity < 10 ? 'text-red-400 font-bold' : 'text-green-400 font-bold'}>{product.quantity}</span></p>
                  <p className="text-blue-200">Location: <span className="text-white font-bold">{product.bin?.binCode || 'Not assigned'}</span></p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========== RECEIVE ========== */}
        {activeTab === 'receive' && (
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8">
            <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2"><FiPackage /> Receive & Putaway</h2>
            <p className="text-blue-200 text-sm mb-6">Scan incoming items and assign to storage bin</p>
            <form onSubmit={handleReceive} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="SKU *" value={sku} onChange={e => setSku(e.target.value)}
                  className="p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300/50 focus:outline-none" required />
                <input type="text" placeholder="Barcode *" value={barcode} onChange={e => setBarcode(e.target.value)}
                  className="p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300/50 focus:outline-none" required />
              </div>
              <input type="text" placeholder="Product Name *" value={name} onChange={e => setName(e.target.value)}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300/50 focus:outline-none" required />
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <FiMapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300" />
                  <input type="text" placeholder="Bin Code (BIN-001) *" value={binCode} onChange={e => setBinCode(e.target.value)}
                    className="w-full pl-10 p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300/50 focus:outline-none" required />
                </div>
                <input type="number" placeholder="Quantity *" value={quantity} onChange={e => setQuantity(e.target.value)}
                  className="p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300/50 focus:outline-none" required />
              </div>
              <button type="submit" className="w-full py-3 bg-green-600 text-white font-bold rounded-xl text-lg">
                📥 Receive & Putaway to Bin
              </button>
            </form>
          </div>
        )}

        {/* ========== PICK ========== */}
        {activeTab === 'pick' && (
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8">
            <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2"><FiTruck /> Pick for Shipping</h2>
            <p className="text-blue-200 text-sm mb-6">Lookup order and update status for outbound shipping</p>
            <form onSubmit={handlePick} className="space-y-4">
              <input type="text" placeholder="Order Number (ORD-001)" value={orderNumber} onChange={e => setOrderNumber(e.target.value)}
                className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white text-lg placeholder-blue-300/50 focus:outline-none" required />
              <button type="submit" className="w-full py-4 bg-orange-600 text-white font-bold rounded-xl text-lg">
                📦 Lookup Order
              </button>
            </form>

            {order && (
              <div className="mt-6 p-6 bg-white/5 rounded-xl border border-white/10">
                <h3 className="text-white font-bold text-lg mb-2">Order: {order.orderNumber}</h3>
                <p className="text-blue-200 mb-4">Status: <span className={`font-bold ${order.status === 'SHIPPED' ? 'text-green-400' : 'text-yellow-400'}`}>{order.status}</span></p>
                <div className="flex gap-2">
                  {order.status === 'PENDING' && (
                    <button onClick={() => handleUpdateStatus('PICKING')} className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold">Start Picking</button>
                  )}
                  {order.status === 'PICKING' && (
                    <button onClick={() => handleUpdateStatus('PACKED')} className="flex-1 py-2 bg-purple-600 text-white rounded-lg text-sm font-bold">Mark Packed</button>
                  )}
                  {order.status === 'PACKED' && (
                    <button onClick={() => handleUpdateStatus('SHIPPED')} className="flex-1 py-2 bg-green-600 text-white rounded-lg text-sm font-bold">🚀 Ship Order</button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OperatorDashboard;