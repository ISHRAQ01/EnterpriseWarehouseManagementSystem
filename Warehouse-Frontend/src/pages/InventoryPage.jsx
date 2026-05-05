import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import toast from 'react-hot-toast';
import {
  FiSearch, FiPlus, FiEdit2, FiTrash2,
  FiPackage, FiAlertTriangle, FiX, FiLoader
} from 'react-icons/fi';

const getStockStatus = (quantity) => {
  if (quantity === 0) return { label: 'Out of Stock', color: 'bg-red-100 text-red-700 border border-red-200' };
  if (quantity < 10) return { label: 'Low Stock', color: 'bg-amber-100 text-amber-700 border border-amber-200' };
  return { label: 'In Stock', color: 'bg-green-100 text-green-700 border border-green-200' };
};

const AddProductModal = ({ onClose, onAdd }) => {
  const [form, setForm] = useState({ name: '', sku: '', barcode: '', binCode: '', quantity: '' });
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
      toast.success('Product added!');
      onAdd();
      onClose();
    } catch (err) {
      toast.error('Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Add New Product</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><FiX size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input placeholder="Product Name *" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="SKU Code *" value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
              className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            <input placeholder="Barcode" value={form.barcode}
              onChange={(e) => setForm({ ...form, barcode: e.target.value })}
              className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input type="number" placeholder="Quantity *" value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            <input placeholder="Bin Code (BIN-001) *" value={form.binCode}
              onChange={(e) => setForm({ ...form, binCode: e.target.value })}
              className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2">
              {loading ? <FiLoader className="animate-spin" /> : null} Add Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const InventoryPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);

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

  const filteredProducts = products.filter(p =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalProducts = products.length;
  const lowStockCount = products.filter(p => p.quantity > 0 && p.quantity < 10).length;
  const outOfStockCount = products.filter(p => p.quantity === 0).length;

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
          <h1 className="text-2xl font-bold text-gray-800">Inventory</h1>
          <p className="text-gray-500 text-sm mt-1">Manage all products and stock levels</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl">
          <FiPlus size={18} /> Add Product
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-gray-500 text-sm">Total Products</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{totalProducts}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-amber-100 shadow-sm">
          <p className="text-amber-600 text-sm">Low Stock</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{lowStockCount}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-red-100 shadow-sm">
          <p className="text-red-600 text-sm">Out of Stock</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{outOfStockCount}</p>
        </div>
      </div>

      <div className="relative">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input type="text" placeholder="Search by name or SKU..." value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Product</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">SKU</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Barcode</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Bin</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Quantity</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredProducts.map((product) => {
              const status = getStockStatus(product.quantity);
              return (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                        <FiPackage className="text-blue-500" size={18} />
                      </div>
                      <span className="font-medium text-gray-800">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded-lg text-gray-600">{product.sku}</code>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{product.barcode || 'N/A'}</td>
                  <td className="px-6 py-4">
                    <span className="text-sm bg-purple-50 text-purple-600 px-2 py-1 rounded-lg font-medium">
                      {product.bin?.binCode || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {product.quantity < 10 && <FiAlertTriangle className="text-amber-500" size={15} />}
                      <span className="font-semibold text-gray-800">{product.quantity}</span>
                      <span className="text-gray-400 text-sm">units</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${status.color}`}>{status.label}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <FiPackage className="mx-auto text-gray-300 mb-3" size={48} />
            <p className="text-gray-500 font-medium">No products found</p>
          </div>
        )}
      </div>

      {showModal && <AddProductModal onClose={() => setShowModal(false)} onAdd={fetchProducts} />}
    </div>
  );
};

export default InventoryPage;