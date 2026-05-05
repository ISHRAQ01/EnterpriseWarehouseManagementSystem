import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import toast from 'react-hot-toast';
import {
  FiDatabase, FiPlus, FiX, FiMapPin,
  FiPackage, FiGrid, FiLoader
} from 'react-icons/fi';

const CapacityBar = ({ used, total }) => {
  const percent = total > 0 ? Math.round((used / total) * 100) : 0;
  const color =
    percent >= 90 ? 'bg-red-500' :
    percent >= 70 ? 'bg-amber-500' :
    'bg-green-500';
  return (
    <div>
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>{used} / {total} bins used</span>
        <span>{percent}%</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div className={`h-2 rounded-full transition-all ${color}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
};

const NewWarehouseModal = ({ onClose, onAdd }) => {
  const [form, setForm] = useState({ code: '', name: '', address: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.get('/warehouse/create', {
        params: { code: form.code, name: form.name, address: form.address }
      });
      toast.success('Warehouse created!');
      onAdd();
      onClose();
    } catch (err) {
      toast.error('Failed to create warehouse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Add New Warehouse</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><FiX size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input placeholder="Warehouse Code (WH-001)" value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          <input placeholder="Warehouse Name" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          <input placeholder="Address" value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2">
              {loading ? <FiLoader className="animate-spin" /> : null} Add Warehouse
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const WarehousePage = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);

  const fetchWarehouses = async () => {
    setLoading(true);
    try {
      const res = await api.get('/warehouse');
      setWarehouses(res.data);
    } catch (err) {
      toast.error('Failed to load warehouses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const totalBins = warehouses.reduce((sum, w) => sum + (w.totalBins || 100), 0);
  const totalUsed = warehouses.reduce((sum, w) => sum + (w.usedBins || 50), 0);

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
          <h1 className="text-2xl font-bold text-gray-800">Warehouses</h1>
          <p className="text-gray-500 text-sm mt-1">Manage warehouse zones and bin locations</p>
        </div>
        <button onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl">
          <FiPlus size={18} /> Add Warehouse
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-gray-500 text-sm">Total Warehouses</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{warehouses.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-blue-100 shadow-sm">
          <p className="text-blue-600 text-sm">Total Bins</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{totalBins}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-green-100 shadow-sm">
          <p className="text-green-600 text-sm">Overall Capacity</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {totalBins > 0 ? Math.round((totalUsed / totalBins) * 100) : 0}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {warehouses.map((warehouse) => (
          <div key={warehouse.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                  <FiDatabase className="text-blue-500" size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">{warehouse.name}</h3>
                  <div className="flex items-center gap-1 text-gray-500 text-sm">
                    <FiMapPin size={12} /> {warehouse.address || 'No address'}
                  </div>
                </div>
              </div>
              <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                {warehouse.warehouseCode}
              </span>
            </div>
          </div>
        ))}
        {warehouses.length === 0 && (
          <div className="col-span-2 text-center py-12 text-gray-400">
            <FiDatabase size={40} className="mx-auto mb-3" />
            <p>No warehouses found. Add your first warehouse!</p>
          </div>
        )}
      </div>

      {showNewModal && (
        <NewWarehouseModal
          onClose={() => setShowNewModal(false)}
          onAdd={fetchWarehouses}
        />
      )}
    </div>
  );
};

export default WarehousePage;