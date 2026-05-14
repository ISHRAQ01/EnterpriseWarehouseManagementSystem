import {
  FiSearch, FiPlus, FiEdit2, FiTrash2,
  FiPackage, FiAlertTriangle, FiX, FiLoader, FiDownload
} from 'react-icons/fi';
import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';


const getStockStatus = (quantity) => {
  if (quantity === 0) return { label: 'Out of Stock', color: 'bg-red-100 text-red-700 border border-red-200' };
  if (quantity < 30) return { label: 'Low Stock', color: 'bg-amber-100 text-amber-700 border border-amber-200' };
  return { label: 'In Stock', color: 'bg-green-100 text-green-700 border border-green-200' };
};

// ===================== Add Product Modal =====================
const AddProductModal = ({ onClose, onAdd }) => {
  const [form, setForm] = useState({ name: '', sku: '', quantity: '' });
  const [aisles, setAisles] = useState([]);
  const [selectedAisle, setSelectedAisle] = useState(null);
  const [selectedBins, setSelectedBins] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/warehouse/aisles-with-bins')
      .then(res => setAisles(res.data))
      .catch(() => toast.error('Failed to load aisles'));
  }, []);

  const handleAisleSelect = (aisleId) => {
    const aisle = aisles.find(a => a.id === parseInt(aisleId));
    setSelectedAisle(aisle);
    setSelectedBins([]);
  };

  const handleBinToggle = (binCode) => {
    setSelectedBins(prev =>
      prev.includes(binCode) ? prev.filter(b => b !== binCode) : [...prev, binCode]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.sku || !form.quantity || selectedBins.length === 0) {
      toast.error('Please fill all fields and select at least one bin');
      return;
    }

    setLoading(true);
    const totalQty = parseInt(form.quantity) || 0;
    const maxPerBin = 100; // Maximum capacity per bin
    const binsNeeded = Math.ceil(totalQty / maxPerBin);

    // Check if enough bins selected
    if (selectedBins.length < binsNeeded) {
      toast.error(`You need at least ${binsNeeded} bins for ${totalQty} items (max ${maxPerBin}/bin)`);
      setLoading(false);
      return;
    }

    try {
      let remaining = totalQty;
      const binsToUse = selectedBins.slice(0, binsNeeded); // Use only needed bins

      for (let i = 0; i < binsToUse.length; i++) {
        const binQty = Math.min(remaining, maxPerBin); // Put max 100 or remaining
        remaining -= binQty;

        const barcode = `BAR-${form.sku}-${Date.now().toString().slice(-6)}-${i}`;

        await api.get('/inventory/receive', {
          params: {
            sku: form.sku,
            name: form.name,
            barcode: barcode,
            binCode: binsToUse[i],
            quantity: binQty
          }
        });
      }

      toast.success(`Product added across ${binsToUse.length} bin(s)!`);
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
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Add New Product</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><FiX size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label><input placeholder="e.g. Wireless Mouse" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" required /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">SKU ID *</label><input placeholder="e.g. SKU-001" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" required /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Total Quantity *</label><input type="number" placeholder="e.g. 150" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" required /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Select Aisle *</label><select onChange={(e) => handleAisleSelect(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"><option value="">-- Select Aisle --</option>{aisles.map(aisle => (<option key={aisle.id} value={aisle.id}>{aisle.code} ({aisle.zoneName} - {aisle.warehouseName})</option>))}</select></div>
          {selectedAisle && (<div><label className="block text-sm font-medium text-gray-700 mb-1">Select Bins * ({selectedBins.length} selected)</label><div className="space-y-2 max-h-40 overflow-y-auto">{selectedAisle.bins.map(bin => { const free = (bin.capacity || 100) - (bin.used || 0); const isFull = free <= 0; const percentUsed = bin.capacity > 0 ? Math.round(((bin.used || 0) / bin.capacity) * 100) : 0; const barColor = percentUsed >= 90 ? 'bg-red-500' : percentUsed >= 70 ? 'bg-amber-500' : 'bg-green-500'; return (<label key={bin.id} className={`flex items-center justify-between p-3 rounded-xl cursor-pointer border ${isFull ? 'border-red-200 bg-red-50 opacity-60' : selectedBins.includes(bin.code) ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}><div className="flex items-center gap-3"><input type="checkbox" checked={selectedBins.includes(bin.code)} disabled={isFull} onChange={() => handleBinToggle(bin.code)} className="w-4 h-4" /><div><p className="font-medium text-sm">{bin.code} {isFull && <span className="text-red-500 text-xs ml-1">(FULL)</span>}</p><div className="w-24 bg-gray-200 rounded-full h-1.5 mt-1"><div className={`h-1.5 rounded-full ${barColor}`} style={{ width: `${percentUsed}%` }} /></div><p className="text-xs text-gray-500 mt-0.5">{bin.used || 0} used / {bin.capacity || 100} total</p></div></div><span className={`text-xs px-2 py-1 rounded-full ${isFull ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>{free} free</span></label>); })}</div></div>)}
          <div className="flex gap-3 pt-2"><button type="button" onClick={onClose} className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl hover:bg-gray-50">Cancel</button><button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2">{loading ? <FiLoader className="animate-spin" /> : null} Add Product</button></div>
        </form>
      </div>
    </div>
  );
};

// ===================== Edit Product Modal =====================
const EditProductModal = ({ product, onClose, onSave }) => {
  const [form, setForm] = useState({ name: product.name || '', sku: product.sku || '', quantity: product.quantity || 0 });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const quantityChange = parseInt(form.quantity) - product.quantity;
      await api.get(`/inventory/${form.sku}/quantity`, { params: { quantityChange } });
      toast.success('Product updated!');
      onSave(); onClose();
    } catch (err) { toast.error('Failed to update product'); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-6"><h2 className="text-xl font-bold text-gray-800">Edit Product</h2><button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><FiX size={20} /></button></div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" required /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">SKU</label><input value={form.sku} disabled className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-gray-500" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label><input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" required /></div>
          <div className="flex gap-3 pt-2"><button type="button" onClick={onClose} className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl hover:bg-gray-50">Cancel</button><button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2">{loading ? <FiLoader className="animate-spin" /> : null} Save Changes</button></div>
        </form>
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

  const fetchProducts = async () => {
    setLoading(true);
    try { const res = await api.get('/inventory'); setProducts(res.data); }
    catch (err) { toast.error('Failed to load inventory'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try { await api.delete(`/inventory/${id}`); toast.success('Product deleted'); fetchProducts(); }
    catch (err) { toast.error('Failed to delete product'); }
  };

  const filteredProducts = products.filter(p =>
    (p.name && p.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalProducts = products.length;
  const lowStockCount = products.filter(p => p.quantity > 0 && p.quantity < 30).length;
  const outOfStockCount = products.filter(p => p.quantity === 0).length;

  if (loading) return <div className="min-h-screen flex items-center justify-center"><FiLoader className="animate-spin text-blue-500" size={40} /></div>;
  const handleDownloadQR = async (product) => {
    const qrData = JSON.stringify({
      sku: product.sku,
      name: product.name,
      barcode: product.barcode,
      binCode: product.binCode || 'N/A',
      quantity: product.quantity
    });
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;

    try {
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `QR-${product.sku}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success(`QR Code downloaded for ${product.sku}`);
    } catch (err) {
      toast.error('Failed to download QR code');
    }
  };
  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold text-gray-800">Inventory</h1><p className="text-gray-500 text-sm mt-1">Manage all products and stock levels</p>
      </div>{!isOperator && (
        <button onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl transition-colors shadow-sm">
          <FiPlus size={18} /> Add Product
        </button>
      )}</div>
      <div className="grid grid-cols-3 gap-4"><div className="bg-white rounded-xl p-4 border"><p className="text-gray-500 text-sm">Total Products</p><p className="text-2xl font-bold">{totalProducts}</p></div><div className="bg-white rounded-xl p-4 border"><p className="text-amber-600 text-sm">Low Stock</p><p className="text-2xl font-bold">{lowStockCount}</p></div><div className="bg-white rounded-xl p-4 border"><p className="text-red-600 text-sm">Out of Stock</p><p className="text-2xl font-bold">{outOfStockCount}</p></div></div>
      <div className="relative"><FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} /><input type="text" placeholder="Search by name or SKU..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" /></div>
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <table className="w-full"><thead className="bg-gray-50 border-b"><tr><th className="text-left px-6 py-4 text-sm font-semibold">Product</th><th className="text-left px-6 py-4 text-sm font-semibold">SKU</th><th className="text-left px-6 py-4 text-sm font-semibold">Barcode</th><th className="text-left px-6 py-4 text-sm font-semibold">Bin Location</th><th className="text-left px-6 py-4 text-sm font-semibold">Quantity</th><th className="text-left px-6 py-4 text-sm font-semibold">Status</th><th className="text-left px-6 py-4 text-sm font-semibold">Actions</th></tr></thead>
          <tbody className="divide-y">{filteredProducts.map((product) => {
            const status = getStockStatus(product.quantity); return (<tr key={product.id} className="hover:bg-gray-50"><td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center"><FiPackage className="text-blue-500" size={18} /></div><span className="font-medium">{product.name}</span></div></td><td className="px-6 py-4"><code className="text-sm bg-gray-100 px-2 py-1 rounded-lg">{product.sku}</code></td><td className="px-6 py-4 text-sm text-gray-500">{product.barcode || 'N/A'}</td><td className="px-6 py-4"><span className="text-sm bg-purple-50 text-purple-600 px-2 py-1 rounded-lg font-medium">{product.binCode || 'N/A'}</span></td><td className="px-6 py-4"><div className="flex items-center gap-2">{product.quantity < 30 && <FiAlertTriangle className="text-amber-500" size={15} />}<span className="font-semibold">{product.quantity}</span><span className="text-gray-400 text-sm">units</span></div></td><td className="px-6 py-4"><span className={`text-xs px-3 py-1 rounded-full font-medium ${status.color}`}>{status.label}</span></td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  {!isOperator && (
                    <>
                      <button onClick={() => setEditProduct(product)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                        <FiEdit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(product.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                        <FiTrash2 size={16} />
                      </button>
                    </>
                  )}
                  {isOperator && (
                    <button onClick={() => handleDownloadQR(product)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg" title="Download QR Code">
                      <FiDownload size={16} />
                    </button>
                  )}
                </div>
              </td></tr>);
          })}</tbody></table>
        {filteredProducts.length === 0 && (<div className="text-center py-16"><FiPackage className="mx-auto text-gray-300 mb-3" size={48} /><p className="text-gray-500 font-medium">No products found</p></div>)}
      </div>
      {showAddModal && <AddProductModal onClose={() => setShowAddModal(false)} onAdd={fetchProducts} />}
      {editProduct && <EditProductModal product={editProduct} onClose={() => setEditProduct(null)} onSave={fetchProducts} />}
    </div>
  );
};

export default InventoryPage;