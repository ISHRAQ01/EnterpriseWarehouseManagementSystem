import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import toast from 'react-hot-toast';
import {
  FiTruck, FiPlus, FiX, FiPackage,
  FiCheck, FiClock, FiLoader
} from 'react-icons/fi';

const statusConfig = {
  PENDING: { label: 'Pending', color: 'bg-gray-100 text-gray-700', icon: <FiClock size={14} /> },
  PROCESSING: { label: 'Processing', color: 'bg-blue-100 text-blue-700', icon: <FiPackage size={14} /> },
  RECEIVED: { label: 'Received', color: 'bg-green-100 text-green-700', icon: <FiCheck size={14} /> },
};

const NewShipmentModal = ({ onClose, onAdd }) => {
  const [form, setForm] = useState({
    sku: '', name: '', barcode: '', binCode: '', quantity: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.get('/inventory/receive', {
        params: {
          sku: form.sku,
          name: form.name,
          barcode: form.barcode,
          binCode: form.binCode,
          quantity: parseInt(form.quantity)
        }
      });
      toast.success('Product received and putaway!');
      onAdd();
      onClose();
    } catch (err) {
      toast.error('Failed to receive product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Receive Product</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><FiX size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="SKU *" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })}
              className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            <input placeholder="Barcode" value={form.barcode} onChange={(e) => setForm({ ...form, barcode: e.target.value })}
              className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <input placeholder="Product Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Bin Code (BIN-001) *" value={form.binCode} onChange={(e) => setForm({ ...form, binCode: e.target.value })}
              className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            <input type="number" placeholder="Quantity *" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2">
              {loading ? <FiLoader className="animate-spin" /> : null} Receive Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ReceivingPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/inventory');
      setProducts(res.data);
    } catch (err) {
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = filterStatus === 'ALL' ? products :
    filterStatus === 'LOW' ? products.filter(p => p.quantity < 10 && p.quantity > 0) :
    filterStatus === 'OUT' ? products.filter(p => p.quantity === 0) :
    products.filter(p => p.quantity >= 10);

  const counts = {
    ALL: products.length,
    LOW: products.filter(p => p.quantity < 10 && p.quantity > 0).length,
    OUT: products.filter(p => p.quantity === 0).length,
    OK: products.filter(p => p.quantity >= 10).length,
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
          <h1 className="text-2xl font-bold text-gray-800">Receiving & Inventory</h1>
          <p className="text-gray-500 text-sm mt-1">Manage incoming products and stock levels</p>
        </div>
        <button onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl">
          <FiPlus size={18} /> Receive Product
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-gray-500 text-sm">Total Products</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{counts.ALL}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-green-100 shadow-sm">
          <p className="text-green-600 text-sm">In Stock</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{counts.OK}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-amber-100 shadow-sm">
          <p className="text-amber-600 text-sm">Low Stock</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{counts.LOW}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-red-100 shadow-sm">
          <p className="text-red-600 text-sm">Out of Stock</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{counts.OUT}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {['ALL', 'OK', 'LOW', 'OUT'].map((status) => (
          <button key={status} onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors
              ${filterStatus === status ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}>
            {status === 'ALL' ? 'All' : status === 'OK' ? 'In Stock' : status === 'LOW' ? 'Low Stock' : 'Out of Stock'} ({counts[status]})
          </button>
        ))}
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">SKU</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Product</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Barcode</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Bin</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Quantity</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(p => (
              <tr key={p.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4 font-bold text-sm">{p.sku}</td>
                <td className="px-6 py-4 text-sm">{p.name}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{p.barcode || 'N/A'}</td>
                <td className="px-6 py-4 text-sm">{p.bin?.binCode || 'N/A'}</td>
                <td className={`px-6 py-4 font-bold ${p.quantity === 0 ? 'text-red-500' : p.quantity < 10 ? 'text-amber-500' : 'text-green-500'}`}>
                  {p.quantity}
                </td>
                <td className="px-6 py-4">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    p.quantity === 0 ? 'bg-red-100 text-red-700' : p.quantity < 10 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {p.quantity === 0 ? 'Out' : p.quantity < 10 ? 'Low' : 'OK'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredProducts.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <FiPackage size={40} className="mx-auto mb-3" />
            <p>No products found</p>
          </div>
        )}
      </div>

      {showNewModal && (
        <NewShipmentModal onClose={() => setShowNewModal(false)} onAdd={fetchProducts} />
      )}
    </div>
  );
};

export default ReceivingPage;