import React, { useState } from 'react';
import {
  FiDatabase, FiPlus, FiX, FiMapPin,
  FiPackage, FiGrid, FiEdit2
} from 'react-icons/fi';

const initialWarehouses = [
  {
    id: 1,
    name: 'Main Warehouse',
    location: 'Chennai, Tamil Nadu',
    totalBins: 200,
    usedBins: 145,
    zones: [
      { name: 'Zone A', aisles: 4, bins: 80, usedBins: 65, type: 'Electronics' },
      { name: 'Zone B', aisles: 3, bins: 60, usedBins: 45, type: 'Accessories' },
      { name: 'Zone C', aisles: 2, bins: 40, usedBins: 25, type: 'Audio' },
      { name: 'Zone D', aisles: 1, bins: 20, usedBins: 10, type: 'Cables' },
    ],
  },
  {
    id: 2,
    name: 'Secondary Warehouse',
    location: 'Bangalore, Karnataka',
    totalBins: 150,
    usedBins: 89,
    zones: [
      { name: 'Zone A', aisles: 3, bins: 90, usedBins: 60, type: 'Electronics' },
      { name: 'Zone B', aisles: 2, bins: 60, usedBins: 29, type: 'General' },
    ],
  },
];

// Capacity Bar
const CapacityBar = ({ used, total }) => {
  const percent = Math.round((used / total) * 100);
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
        <div
          className={`h-2 rounded-full transition-all ${color}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};

// New Warehouse Modal
const NewWarehouseModal = ({ onClose, onAdd }) => {
  const [form, setForm] = useState({
    name: '', location: '', totalBins: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd({
      ...form,
      id: Date.now(),
      totalBins: parseInt(form.totalBins),
      usedBins: 0,
      zones: [],
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Add New Warehouse</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <FiX size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            placeholder="Warehouse Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border border-gray-300 rounded-xl px-4 py-3
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            placeholder="Location (City, State)"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="w-full border border-gray-300 rounded-xl px-4 py-3
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="number"
            placeholder="Total Bins"
            value={form.totalBins}
            onChange={(e) => setForm({ ...form, totalBins: e.target.value })}
            className="w-full border border-gray-300 rounded-xl px-4 py-3
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700
                         py-3 rounded-xl hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-3
                         rounded-xl hover:bg-blue-700"
            >
              Add Warehouse
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Zone Detail Modal
const ZoneDetailModal = ({ warehouse, onClose }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">
          {warehouse.name} - Zones
        </h2>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
          <FiX size={20} />
        </button>
      </div>
      <div className="space-y-3">
        {warehouse.zones.map((zone, index) => (
          <div key={index} className="p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-semibold text-gray-800">{zone.name}</p>
                <p className="text-xs text-gray-500">
                  {zone.aisles} Aisles • {zone.type}
                </p>
              </div>
              <span className="text-xs bg-blue-50 text-blue-600
                               px-3 py-1 rounded-full font-medium">
                {zone.bins} Bins
              </span>
            </div>
            <CapacityBar used={zone.usedBins} total={zone.bins} />
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Main Warehouse Page
const WarehousePage = () => {
  const [warehouses, setWarehouses] = useState(initialWarehouses);
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);

  const totalBins = warehouses.reduce((sum, w) => sum + w.totalBins, 0);
  const totalUsed = warehouses.reduce((sum, w) => sum + w.usedBins, 0);

  const handleAdd = (newWarehouse) => {
    setWarehouses([...warehouses, newWarehouse]);
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Warehouses</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage warehouse zones and bin locations
          </p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700
                     text-white px-5 py-2.5 rounded-xl transition-colors"
        >
          <FiPlus size={18} />
          Add Warehouse
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-gray-500 text-sm">Total Warehouses</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">
            {warehouses.length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-blue-100 shadow-sm">
          <p className="text-blue-600 text-sm">Total Bins</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{totalBins}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-green-100 shadow-sm">
          <p className="text-green-600 text-sm">Overall Capacity Used</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {Math.round((totalUsed / totalBins) * 100)}%
          </p>
        </div>
      </div>

      {/* Warehouse Cards */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {warehouses.map((warehouse) => (
          <div key={warehouse.id}
            className="bg-white rounded-2xl p-6 shadow-sm
                       border border-gray-100 hover:shadow-md transition-shadow">

            {/* Warehouse Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-50 rounded-xl
                                flex items-center justify-center">
                  <FiDatabase className="text-blue-500" size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">{warehouse.name}</h3>
                  <div className="flex items-center gap-1 text-gray-500 text-sm">
                    <FiMapPin size={12} />
                    {warehouse.location}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedWarehouse(warehouse)}
                className="text-sm text-blue-600 hover:bg-blue-50
                           px-3 py-1.5 rounded-lg transition-colors
                           flex items-center gap-1"
              >
                <FiGrid size={14} />
                View Zones
              </button>
            </div>

            {/* Capacity */}
            <div className="mb-4">
              <CapacityBar
                used={warehouse.usedBins}
                total={warehouse.totalBins}
              />
            </div>

            {/* Zone Pills */}
            <div className="flex gap-2 flex-wrap">
              {warehouse.zones.map((zone, index) => (
                <div key={index}
                  className="flex items-center gap-1.5 bg-gray-50
                             border border-gray-200 px-3 py-1.5 rounded-lg">
                  <FiPackage size={12} className="text-gray-400" />
                  <span className="text-xs font-medium text-gray-600">
                    {zone.name}
                  </span>
                  <span className="text-xs text-gray-400">
                    ({zone.bins} bins)
                  </span>
                </div>
              ))}
              {warehouse.zones.length === 0 && (
                <p className="text-sm text-gray-400">No zones added yet</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modals */}
      {showNewModal && (
        <NewWarehouseModal
          onClose={() => setShowNewModal(false)}
          onAdd={handleAdd}
        />
      )}
      {selectedWarehouse && (
        <ZoneDetailModal
          warehouse={selectedWarehouse}
          onClose={() => setSelectedWarehouse(null)}
        />
      )}
    </div>
  );
};

export default WarehousePage;