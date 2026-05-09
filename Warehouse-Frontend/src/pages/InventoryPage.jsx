
import React, { useState } from 'react';
import {
  FiSearch, FiPlus, FiEdit2, FiTrash2,
  FiPackage, FiAlertTriangle, FiX
} from 'react-icons/fi';
// Dummy Data
const initialProducts = [
  { id: 1, name: 'Laptop Dell XPS', sku: 'SKU-001', category: 'Electronics', quantity: 45, binCode: 'A-01-01', price: 1200 },
  { id: 2, name: 'Wireless Mouse', sku: 'SKU-002', category: 'Accessories', quantity: 8, binCode: 'B-02-03', price: 25 },
  { id: 3, name: 'USB Hub 7 Port', sku: 'SKU-003', category: 'Accessories', quantity: 0, binCode: 'B-02-04', price: 35 },
  { id: 4, name: 'Monitor 27 inch', sku: 'SKU-004', category: 'Electronics', quantity: 120, binCode: 'A-03-02', price: 350 },
  { id: 5, name: 'Keyboard Mechanical', sku: 'SKU-005', category: 'Accessories', quantity: 5, binCode: 'B-01-01', price: 89 },
  { id: 6, name: 'Webcam HD 1080p', sku: 'SKU-006', category: 'Electronics', quantity: 67, binCode: 'A-02-01', price: 75 },
  { id: 7, name: 'Headphones Sony', sku: 'SKU-007', category: 'Audio', quantity: 3, binCode: 'C-01-02', price: 199 },
  { id: 8, name: 'HDMI Cable 2m', sku: 'SKU-008', category: 'Cables', quantity: 200, binCode: 'D-01-01', price: 12 },
];

// Stock Status Helper
const getStockStatus = (quantity) => {
  if (quantity === 0) return { label: 'Out of Stock', color: 'bg-red-100 text-red-700 border border-red-200' };
  if (quantity < 10) return { label: 'Low Stock', color: 'bg-amber-100 text-amber-700 border border-amber-200' };
  return { label: 'In Stock', color: 'bg-green-100 text-green-700 border border-green-200' };
};

// Add Product Modal
const AddProductModal = ({ onClose, onAdd }) => {
  const [form, setForm] = useState({
    name: '', sku: '', category: '', quantity: '', binCode: '', price: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd({ ...form, id: Date.now(), quantity: parseInt(form.quantity), price: parseFloat(form.price) });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Add New Product</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <FiX size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            placeholder="Product Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              placeholder="SKU Code"
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
              className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              placeholder="Category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              placeholder="Quantity"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="number"
              placeholder="Price $"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <input
            placeholder="Bin Code (e.g. A-01-01)"
            value={form.binCode}
            onChange={(e) => setForm({ ...form, binCode: e.target.value })}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700"
            >
              Add Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main Inventory Page
const InventoryPage = () => {
  const [products, setProducts] = useState(initialProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [showModal, setShowModal] = useState(false);

  // Get unique categories
  const categories = ['All', ...new Set(products.map(p => p.category))];

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory =
      filterCategory === 'All' || product.category === filterCategory;
    return matchSearch && matchCategory;
  });

  const handleDelete = (id) => {
    if (window.confirm('Delete this product?')) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const handleAdd = (newProduct) => {
    setProducts([...products, newProduct]);
  };

  // Summary Stats
  const totalProducts = products.length;
  const lowStockCount = products.filter(p => p.quantity > 0 && p.quantity < 10).length;
  const outOfStockCount = products.filter(p => p.quantity === 0).length;

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Inventory</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage all products and stock levels
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700
                     text-white px-5 py-2.5 rounded-xl transition-colors shadow-sm"
        >
          <FiPlus size={18} />
          Add Product
        </button>
      </div>

      {/* Summary Cards */}
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

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl
                       focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="border border-gray-300 rounded-xl px-4 py-3 bg-white
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Product</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">SKU</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Category</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Bin Location</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Quantity</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Price</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredProducts.map((product) => {
              const status = getStockStatus(product.quantity);
              return (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-xl
                                      flex items-center justify-center">
                        <FiPackage className="text-blue-500" size={18} />
                      </div>
                      <span className="font-medium text-gray-800">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded-lg text-gray-600">
                      {product.sku}
                    </code>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{product.category}</td>
                  <td className="px-6 py-4">
                    <span className="text-sm bg-purple-50 text-purple-600
                                     px-2 py-1 rounded-lg font-medium">
                      {product.binCode}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {product.quantity < 10 && (
                        <FiAlertTriangle className="text-amber-500" size={15} />
                      )}
                      <span className="font-semibold text-gray-800">{product.quantity}</span>
                      <span className="text-gray-400 text-sm">units</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-700">
                    ${product.price}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${status.color}`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <FiEdit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <FiPackage className="mx-auto text-gray-300 mb-3" size={48} />
            <p className="text-gray-500 font-medium">No products found</p>
            <p className="text-gray-400 text-sm">Try different search terms</p>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {showModal && (
        <AddProductModal
          onClose={() => setShowModal(false)}
          onAdd={handleAdd}
        />
      )}
    </div>
  );
};

export default InventoryPage;