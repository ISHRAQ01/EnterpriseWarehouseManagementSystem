import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import {
  FiSearch, FiPlus, FiEdit2, FiTrash2,
  FiPackage, FiAlertTriangle, FiX, FiEye, FiLoader, FiDownload, FiMapPin
} from 'react-icons/fi';


const getStockStatus = (quantity) => {
  if (quantity === 0) return { label: 'Out of Stock', color: 'bg-red-100 text-red-700 border border-red-200', dot: 'bg-red-500' };
  if (quantity < 30) return { label: 'Low Stock', color: 'bg-amber-100 text-amber-700 border border-amber-200', dot: 'bg-amber-500' };
  return { label: 'In Stock', color: 'bg-green-100 text-green-700 border border-green-200', dot: 'bg-green-500' };
};

// ===================== Add Product Modal =====================
const AddProductModal = ({ onClose, onAdd }) => {
  const [aisles, setAisles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([
    { name: '', sku: '', quantity: '', aisleId: '', binCode: '', binId: '' }
  ]);

  useEffect(() => {
    api.get('/warehouse/aisles-with-bins')
      .then(res => setAisles(res.data))
      .catch(() => toast.error('Failed to load aisles'));
  }, []);

  const addRow = () => {
    setProducts([...products, { name: '', sku: '', quantity: '', aisleId: '', binCode: '', binId: '' }]);
  };

  const removeRow = (index) => {
    if (products.length === 1) return;
    setProducts(products.filter((_, i) => i !== index));
  };

  const updateRow = (index, field, value) => {
    const updated = [...products];
    updated[index][field] = value;
    if (field === 'aisleId') {
      updated[index].binCode = '';
      updated[index].binId = '';
    }
    setProducts(updated);
  };

  const getBinsForRow = (index) => {
    const aisleId = products[index].aisleId;
    if (!aisleId) return [];
    const aisle = aisles.find(a => a.id === parseInt(aisleId));
    return aisle?.bins || [];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    for (let i = 0; i < products.length; i++) {
      const p = products[i];
      if (!p.name || !p.sku || !p.quantity || !p.binCode) {
        toast.error(`Row ${i + 1}: Please fill all fields`);
        return;
      }
    }
    setLoading(true);
    let successCount = 0, failCount = 0;
    for (let i = 0; i < products.length; i++) {
      const p = products[i];
      try {
        const barcode = `BAR-${p.sku}-${Date.now().toString().slice(-6)}-${i}`;
        await api.get('/inventory/receive', {
          params: { sku: p.sku, name: p.name, barcode, binCode: p.binCode, aisleId: p.aisleId, quantity: parseInt(p.quantity) }
        });
        successCount++;
      } catch { failCount++; }
    }
    toast.success(failCount === 0 ? `${successCount} product(s) added!` : `${successCount} added, ${failCount} failed`);
    onAdd(); onClose();
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-3xl shadow-2xl max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Add Products</h2>
            <p className="text-sm text-gray-500">{products.length} product{products.length > 1 ? 's' : ''} in batch</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <FiX size={20} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Table */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-[1fr,100px,70px,1fr,1fr,36px] gap-2 px-4 py-2.5 bg-gray-100">
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Product Name *</span>
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">SKU *</span>
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Qty *</span>
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Warehouse → Aisle</span>
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Bin *</span>
              <span></span>
            </div>

            {/* Rows */}
            <div className="divide-y divide-gray-100">
              {products.map((product, index) => {
                const bins = getBinsForRow(index);
                return (
                  <div key={index} className="grid grid-cols-[1fr,100px,70px,1fr,1fr,36px] gap-2 px-4 py-2.5 items-center bg-white hover:bg-gray-50/50 transition-colors">
                    {/* Product Name */}
                    <input
                      placeholder="Product name"
                      value={product.name}
                      onChange={(e) => updateRow(index, 'name', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    
                    {/* SKU */}
                    <input
                      placeholder="SKU"
                      value={product.sku}
                      onChange={(e) => updateRow(index, 'sku', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                      required
                    />
                    
                    {/* Quantity */}
                    <input
                      type="number"
                      placeholder="0"
                      value={product.quantity}
                      onChange={(e) => updateRow(index, 'quantity', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
                      min="1"
                      required
                    />
                    
                    {/* Aisle Select */}
                    <select
                      value={product.aisleId}
                      onChange={(e) => updateRow(index, 'aisleId', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 truncate"
                    >
                      <option value="">Select Aisle...</option>
                      {aisles.map(aisle => (
                        <option key={aisle.id} value={aisle.id}>
                          {aisle.warehouseName || 'WH'} → {aisle.code}
                        </option>
                      ))}
                    </select>
                    
                    {/* Bin Select */}
                    <select
                      value={product.binCode}
                      onChange={(e) => updateRow(index, 'binCode', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 truncate"
                      required
                      disabled={!product.aisleId}
                    >
                      <option value="">{product.aisleId ? 'Select Bin...' : 'Select aisle first'}</option>
                      {bins.map(bin => {
                        const free = (bin.capacity || 100) - (bin.used || 0);
                        return (
                          <option key={bin.id} value={bin.code} disabled={free <= 0}>
                            {bin.code} ({free} free)
                          </option>
                        );
                      })}
                    </select>
                    
                    {/* Remove Button */}
                    <div className="flex justify-center">
                      {products.length > 1 && (
                        <button 
                          type="button" 
                          onClick={() => removeRow(index)} 
                          className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" 
                          title="Remove"
                        >
                          <FiX size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add Row Button */}
          <button
            type="button"
            onClick={addRow}
            className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 text-sm font-medium mt-3 px-1 transition-colors"
          >
            <FiPlus size={15} /> Add Another Product
          </button>

          {/* Footer */}
          <div className="flex gap-3 pt-4 mt-4 border-t border-gray-200">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl hover:bg-gray-50 font-medium text-sm transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading} 
              className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2 font-medium text-sm transition-colors disabled:opacity-50"
            >
              {loading ? <FiLoader className="animate-spin" size={16} /> : <FiPlus size={16} />}
              {loading ? 'Adding...' : `Add ${products.length} Product${products.length > 1 ? 's' : ''}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
// ===================== Edit Product Modal =====================
const EditProductModal = ({ product, onClose, onSave }) => {
  const [form, setForm] = useState({ 
    name: product.name || '', 
    sku: product.sku || '', 
    quantity: product.quantity || 0 
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const quantityChange = parseInt(form.quantity) - product.quantity;
      await api.get(`/inventory/${form.sku}/quantity`, { 
        params: { quantityChange, warehouseId: product.warehouseId } 
      });
      toast.success('Product updated!');
      onSave(); onClose();
    } catch (err) { 
      toast.error('Failed to update product'); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Edit Product</h2>
            <p className="text-sm text-gray-500 mt-0.5">SKU: {product.sku}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <FiX size={20} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Product Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Product Name
            </label>
            <input 
              value={form.name} 
              onChange={(e) => setForm({ ...form, name: e.target.value })} 
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
              required 
            />
          </div>

          {/* SKU (Disabled) */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              SKU
            </label>
            <div className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50">
              <code className="text-sm text-gray-500 font-mono">{form.sku}</code>
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Quantity
            </label>
            <input 
              type="number" 
              value={form.quantity} 
              onChange={(e) => setForm({ ...form, quantity: e.target.value })} 
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
              min="0"
              required 
            />
            {product.quantity !== parseInt(form.quantity) && (
              <p className={`text-xs mt-1.5 font-medium ${
                parseInt(form.quantity) > product.quantity 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }`}>
                {parseInt(form.quantity) > product.quantity 
                  ? `+${parseInt(form.quantity) - product.quantity} units added` 
                  : `${parseInt(form.quantity) - product.quantity} units removed`}
              </p>
            )}
          </div>

          {/* Warehouse Info */}
          {product.warehouseName && (
            <div className="bg-purple-50 rounded-xl p-3 flex items-center gap-2">
              <FiMapPin size={14} className="text-purple-500" />
              <span className="text-sm text-purple-700 font-medium">{product.warehouseName}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl hover:bg-gray-50 font-medium text-sm transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading} 
              className="flex-1 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2 font-medium text-sm transition-colors disabled:opacity-50"
            >
              {loading ? <FiLoader className="animate-spin" size={16} /> : <FiEdit2 size={16} />}
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ===================== View Product Modal =====================
const ViewProductModal = ({ product, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-800">{product.name}</h2>
              <p className="text-sm text-gray-500 mt-0.5">SKU: {product.sku}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <FiX size={20} className="text-gray-500" />
            </button>
          </div>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Product Info Card */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <FiPackage size={14} className="text-white" />
              </div>
              <p className="text-sm font-semibold text-blue-700">Product Info</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">Name</p>
                <p className="text-sm font-medium text-gray-800">{product.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">SKU</p>
                <code className="text-sm bg-white px-2 py-0.5 rounded text-gray-700">{product.sku}</code>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">Barcode</p>
                <p className="text-sm font-medium text-gray-800">{product.barcode || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">Quantity</p>
                <p className="text-sm font-bold text-gray-800">{product.quantity} units</p>
              </div>
            </div>
          </div>

          {/* Location Card */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 px-4 py-3 border-b border-purple-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                  <FiMapPin size={14} className="text-white" />
                </div>
                <p className="text-sm font-semibold text-purple-700">Location Details</p>
              </div>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Full Path</p>
                  <p className="text-sm font-medium text-purple-800">{product.location || 'Not assigned'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Warehouse', value: product.location?.split(' → ')[0] || 'N/A' },
                  { label: 'Zone', value: product.location?.split(' → ')[1] || 'N/A' },
                  { label: 'Aisle', value: product.location?.split(' → ')[2] || 'N/A' },
                  { label: 'Bin', value: product.binCode || 'N/A' },
                ].map(item => (
                  <div key={item.label} className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">{item.label}</p>
                    <p className="text-sm font-medium text-gray-800">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ===================== Inventory Page =====================
const InventoryPage = () => {
  const { user } = useAuth();
  const isOperator = user?.role === 'OPERATOR';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [viewProduct, setViewProduct] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    try { const res = await api.get('/inventory/with-warehouse'); setProducts(res.data); }
    catch (err) { toast.error('Failed to load inventory'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try { await api.delete(`/inventory/${id}`); toast.success('Product deleted'); fetchProducts(); }
    catch (err) { toast.error('Failed to delete product'); }
  };

  const handleDownloadQR = async (product) => {
    try {
      const res = await api.get('/barcode/product', { params: { sku: product.sku } });
      const link = document.createElement('a');
      link.href = `data:image/png;base64,${res.data}`;
      link.download = `QR-${product.sku}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`QR Code downloaded for ${product.sku}`);
    } catch (err) {
      toast.error('Failed to download QR code');
    }
  };

  const filteredProducts = products.filter(p =>
    (p.name && p.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalProducts = products.length;
  const lowStockCount = products.filter(p => p.quantity > 0 && p.quantity < 30).length;
  const outOfStockCount = products.filter(p => p.quantity === 0).length;
  const inStockCount = products.filter(p => p.quantity >= 30).length;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <FiLoader className="animate-spin text-blue-500" size={40} />
    </div>
  );

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Inventory</h1>
          <p className="text-gray-500 text-sm mt-1">Manage all products and stock levels</p>
        </div>
        {!isOperator && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl transition-colors shadow-sm"
          >
            <FiPlus size={18} /> Add Product
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Products', count: totalProducts, color: 'bg-blue-500', icon: <FiPackage size={18} /> },
          { label: 'In Stock', count: inStockCount, color: 'bg-green-500', icon: <FiPackage size={18} /> },
          { label: 'Low Stock', count: lowStockCount, color: 'bg-amber-500', icon: <FiAlertTriangle size={18} /> },
          { label: 'Out of Stock', count: outOfStockCount, color: 'bg-red-500', icon: <FiAlertTriangle size={18} /> },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{stat.label}</span>
              <div className={`w-8 h-8 ${stat.color} rounded-lg flex items-center justify-center text-white`}>
                {stat.icon}
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-800">{stat.count}</p>
          </div>
        ))}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input 
          type="text" 
          placeholder="Search by name or SKU..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm" 
        />
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">SKU</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Barcode</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Warehouse</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Quantity</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredProducts.map((product) => {
              const status = getStockStatus(product.quantity);
              return (
                <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                        <FiPackage className="text-white" size={18} />
                      </div>
                      <span className="font-medium text-gray-800">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-sm bg-gray-100 px-2.5 py-1 rounded-lg font-mono text-gray-700">{product.sku}</code>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 font-mono">{product.barcode || 'N/A'}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 text-sm bg-purple-50 text-purple-600 px-2.5 py-1 rounded-lg font-medium">
                      <FiMapPin size={12} />
                      {product.warehouseName || product.location?.split(' → ')[0] || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {product.quantity < 30 && (
                        <span className={`w-2 h-2 ${status.dot} rounded-full`}></span>
                      )}
                      <span className="font-semibold text-gray-800">{product.quantity}</span>
                      <span className="text-gray-400 text-sm">units</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${status.color}`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="px-6 py-4">
  <div className="flex items-center gap-1">
    {!isOperator && (
      <>
        <button onClick={() => setViewProduct(product)} className="p-2 text-purple-500 hover:bg-purple-50 rounded-lg transition-colors" title="View Location">
          <FiEye size={16} />
        </button>
        <button onClick={() => setEditProduct(product)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
          <FiEdit2 size={16} />
        </button>
        <button onClick={() => handleDelete(product.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
          <FiTrash2 size={16} />
        </button>
      </>
    )}
    {/* ✅ QR only for Operators */}
    {isOperator && (
      <button onClick={() => handleDownloadQR(product)} className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-colors" title="Download QR Code">
        <FiDownload size={16} />
      </button>
    )}
  </div>
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
            <p className="text-gray-400 text-sm mt-1">
              {searchTerm ? 'Try a different search term' : 'Add your first product to get started'}
            </p>
          </div>
        )}
      </div>

      {showAddModal && <AddProductModal onClose={() => setShowAddModal(false)} onAdd={fetchProducts} />}
      {editProduct && <EditProductModal product={editProduct} onClose={() => setEditProduct(null)} onSave={fetchProducts} />}
      {viewProduct && <ViewProductModal product={viewProduct} onClose={() => setViewProduct(null)} />}
    </div>
  );
};

export default InventoryPage;