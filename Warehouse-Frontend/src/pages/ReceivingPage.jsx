import React, { useState } from 'react';
import {
  FiTruck, FiPlus, FiX, FiPackage,
  FiCheck, FiClock, FiAlertCircle
} from 'react-icons/fi';

// Dummy Shipments Data
const initialShipments = [
  {
    id: 1,
    shipmentNo: 'SHP-001',
    supplier: 'Dell Technologies',
    items: [
      { name: 'Laptop Dell XPS', sku: 'SKU-001', quantity: 50, binCode: 'A-01-01' },
      { name: 'Monitor 27 inch', sku: 'SKU-004', quantity: 20, binCode: 'A-03-02' },
    ],
    status: 'RECEIVED',
    date: '2026-04-27',
    totalItems: 70,
  },
  {
    id: 2,
    shipmentNo: 'SHP-002',
    supplier: 'Logitech',
    items: [
      { name: 'Wireless Mouse', sku: 'SKU-002', quantity: 100, binCode: 'B-02-03' },
      { name: 'Keyboard Mechanical', sku: 'SKU-005', quantity: 50, binCode: 'B-01-01' },
    ],
    status: 'PENDING',
    date: '2026-04-27',
    totalItems: 150,
  },
  {
    id: 3,
    shipmentNo: 'SHP-003',
    supplier: 'Sony Corporation',
    items: [
      { name: 'Headphones Sony', sku: 'SKU-007', quantity: 30, binCode: 'C-01-02' },
    ],
    status: 'PROCESSING',
    date: '2026-04-26',
    totalItems: 30,
  },
];

// Status Config
const statusConfig = {
  PENDING: {
    label: 'Pending',
    color: 'bg-gray-100 text-gray-700',
    icon: <FiClock size={14} />,
  },
  PROCESSING: {
    label: 'Processing',
    color: 'bg-blue-100 text-blue-700',
    icon: <FiPackage size={14} />,
  },
  RECEIVED: {
    label: 'Received',
    color: 'bg-green-100 text-green-700',
    icon: <FiCheck size={14} />,
  },
};

// New Shipment Modal
const NewShipmentModal = ({ onClose, onAdd }) => {
  const [form, setForm] = useState({
    supplier: '',
    shipmentNo: '',
    date: new Date().toISOString().split('T')[0],
    items: [{ name: '', sku: '', quantity: '', binCode: '' }],
  });

  const addItem = () => {
    setForm({
      ...form,
      items: [...form.items, { name: '', sku: '', quantity: '', binCode: '' }],
    });
  };

  const removeItem = (index) => {
    setForm({
      ...form,
      items: form.items.filter((_, i) => i !== index),
    });
  };

  const updateItem = (index, field, value) => {
    const newItems = [...form.items];
    newItems[index][field] = value;
    setForm({ ...form, items: newItems });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const totalItems = form.items.reduce(
      (sum, item) => sum + parseInt(item.quantity || 0), 0
    );
    onAdd({
      ...form,
      id: Date.now(),
      status: 'PENDING',
      totalItems,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center
                    justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl my-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">New Shipment</h2>
          <button onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg">
            <FiX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Supplier & Shipment No */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Supplier Name
              </label>
              <input
                placeholder="Supplier name"
                value={form.supplier}
                onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                className="w-full border border-gray-300 rounded-xl px-4 py-3
                           focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Shipment No
              </label>
              <input
                placeholder="SHP-XXX"
                value={form.shipmentNo}
                onChange={(e) => setForm({ ...form, shipmentNo: e.target.value })}
                className="w-full border border-gray-300 rounded-xl px-4 py-3
                           focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Date
            </label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-4 py-3
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Items</label>
              <button
                type="button"
                onClick={addItem}
                className="text-blue-600 text-sm hover:underline flex items-center gap-1"
              >
                <FiPlus size={14} /> Add Item
              </button>
            </div>

            <div className="space-y-3">
              {form.items.map((item, index) => (
                <div key={index}
                  className="p-3 bg-gray-50 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-gray-600">
                      Item {index + 1}
                    </p>
                    {form.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FiX size={14} />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      placeholder="Product Name"
                      value={item.name}
                      onChange={(e) => updateItem(index, 'name', e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2
                                 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <input
                      placeholder="SKU"
                      value={item.sku}
                      onChange={(e) => updateItem(index, 'sku', e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2
                                 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <input
                      type="number"
                      placeholder="Quantity"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2
                                 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <input
                      placeholder="Bin Code"
                      value={item.binCode}
                      onChange={(e) => updateItem(index, 'binCode', e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2
                                 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Buttons */}
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
              Create Shipment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Shipment Detail Modal
const ShipmentDetailModal = ({ shipment, onClose }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center
                  justify-center z-50 p-4">
    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">
          {shipment.shipmentNo}
        </h2>
        <button onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg">
          <FiX size={20} />
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Supplier</span>
          <span className="font-medium">{shipment.supplier}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Date</span>
          <span className="font-medium">{shipment.date}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Status</span>
          <span className={`text-xs px-3 py-1 rounded-full font-medium
                           ${statusConfig[shipment.status].color}`}>
            {statusConfig[shipment.status].label}
          </span>
        </div>

        <div className="border-t pt-4">
          <p className="text-sm font-semibold text-gray-700 mb-3">
            Items & Bin Locations:
          </p>
          <div className="space-y-2">
            {shipment.items.map((item, index) => (
              <div key={index}
                className="flex justify-between items-center
                           p-3 bg-gray-50 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {item.name}
                  </p>
                  <p className="text-xs text-gray-500">{item.sku}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-800">
                    {item.quantity} units
                  </p>
                  <span className="text-xs bg-purple-50 text-purple-600
                                   px-2 py-0.5 rounded-lg">
                    {item.binCode}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t pt-4 flex justify-between">
          <span className="font-bold text-gray-800">Total Items</span>
          <span className="font-bold text-blue-600">{shipment.totalItems}</span>
        </div>
      </div>
    </div>
  </div>
);

// Main Receiving Page
const ReceivingPage = () => {
  const [shipments, setShipments] = useState(initialShipments);
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL');

  const filteredShipments = shipments.filter(s =>
    filterStatus === 'ALL' || s.status === filterStatus
  );

  const updateStatus = (id, newStatus) => {
    setShipments(shipments.map(s =>
      s.id === id ? { ...s, status: newStatus } : s
    ));
  };

  const handleAdd = (newShipment) => {
    setShipments([...shipments, newShipment]);
  };

  const counts = {
    ALL: shipments.length,
    PENDING: shipments.filter(s => s.status === 'PENDING').length,
    PROCESSING: shipments.filter(s => s.status === 'PROCESSING').length,
    RECEIVED: shipments.filter(s => s.status === 'RECEIVED').length,
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Receiving</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage incoming shipments and putaway
          </p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700
                     text-white px-5 py-2.5 rounded-xl transition-colors"
        >
          <FiPlus size={18} />
          New Shipment
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-gray-500 text-sm">Total Shipments</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">
            {shipments.length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-blue-100 shadow-sm">
          <p className="text-blue-600 text-sm">Processing</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {counts.PROCESSING}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-green-100 shadow-sm">
          <p className="text-green-600 text-sm">Received</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {counts.RECEIVED}
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {['ALL', 'PENDING', 'PROCESSING', 'RECEIVED'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors
                        ${filterStatus === status
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                        }`}
          >
            {status} ({counts[status] || shipments.length})
          </button>
        ))}
      </div>

      {/* Shipments List */}
      <div className="space-y-3">
        {filteredShipments.map((shipment) => {
          const config = statusConfig[shipment.status];
          return (
            <div key={shipment.id}
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100
                         hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">

                {/* Left Info */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl
                                  flex items-center justify-center">
                    <FiTruck className="text-blue-500" size={22} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <p className="font-bold text-gray-800">
                        {shipment.shipmentNo}
                      </p>
                      <span className={`flex items-center gap-1 text-xs px-3 py-1
                                       rounded-full font-medium ${config.color}`}>
                        {config.icon}
                        {config.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {shipment.supplier} •{' '}
                      {shipment.totalItems} items •{' '}
                      {shipment.date}
                    </p>
                  </div>
                </div>

                {/* Right Buttons */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedShipment(shipment)}
                    className="text-sm border border-gray-300 text-gray-600
                               px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    View Details
                  </button>

                  {shipment.status === 'PENDING' && (
                    <button
                      onClick={() => updateStatus(shipment.id, 'PROCESSING')}
                      className="text-sm bg-blue-600 text-white px-4 py-2
                                 rounded-xl hover:bg-blue-700 transition-colors"
                    >
                      Start Processing
                    </button>
                  )}
                  {shipment.status === 'PROCESSING' && (
                    <button
                      onClick={() => updateStatus(shipment.id, 'RECEIVED')}
                      className="text-sm bg-green-600 text-white px-4 py-2
                                 rounded-xl hover:bg-green-700 transition-colors"
                    >
                      Mark as Received
                    </button>
                  )}
                  {shipment.status === 'RECEIVED' && (
                    <div className="flex items-center gap-1 text-green-600
                                    bg-green-50 px-3 py-2 rounded-xl text-sm">
                      <FiCheck size={16} />
                      Completed
                    </div>
                  )}
                </div>
              </div>

              {/* Items Preview */}
              <div className="mt-4 flex gap-2 flex-wrap">
                {shipment.items.map((item, index) => (
                  <span key={index}
                    className="text-xs bg-gray-100 text-gray-600
                               px-3 py-1 rounded-full">
                    {item.name} ({item.quantity})
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modals */}
      {showNewModal && (
        <NewShipmentModal
          onClose={() => setShowNewModal(false)}
          onAdd={handleAdd}
        />
      )}
      {selectedShipment && (
        <ShipmentDetailModal
          shipment={selectedShipment}
          onClose={() => setSelectedShipment(null)}
        />
      )}
    </div>
  );
};

export default ReceivingPage;