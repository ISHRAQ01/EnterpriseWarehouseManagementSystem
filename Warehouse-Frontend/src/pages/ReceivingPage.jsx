import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import toast from 'react-hot-toast';
import {
  FiShoppingCart, FiPlus, FiX, FiPackage,
  FiTruck, FiCheck, FiClock, FiEye, FiLoader, FiMapPin
} from 'react-icons/fi';

const statusConfig = {
  PENDING: { label: 'Pending', color: 'bg-gray-100 text-gray-700', icon: <FiClock size={14} />,
    next: 'PROCESSING', nextLabel: 'Start Processing', nextColor: 'bg-blue-600 hover:bg-blue-700' },
  PROCESSING: { label: 'Processing', color: 'bg-blue-100 text-blue-700', icon: <FiPackage size={14} />,
    next: 'RECEIVED', nextLabel: 'Mark as Received', nextColor: 'bg-green-600 hover:bg-green-700' },
  RECEIVED: { label: 'Received', color: 'bg-green-100 text-green-700', icon: <FiCheck size={14} />,
    next: null, nextLabel: null, nextColor: null },
};

const ShipmentDetailModal = ({ shipment, onClose }) => {
  const [product, setProduct] = useState(null);
  
  useEffect(() => {
    const parts = shipment.orderNumber.split('|');
    const sku = parts[1]?.replace('SKU:', '');
    if (sku) {
      api.get(`/inventory/${sku}`)
        .then(res => setProduct(res.data))
        .catch(() => setProduct(null));
    }
  }, [shipment]);

  const parts = shipment.orderNumber.split('|');
  const sku = parts[1]?.replace('SKU:', '') || 'N/A';
  const qty = parts[2]?.replace('QTY:', '') || '0';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">{shipment.orderNumber.split('|')[0]}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><FiX size={20} /></button>
        </div>
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Date</span>
            <span className="font-medium">{shipment.orderDate || 'N/A'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Status</span>
            <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusConfig[shipment.status]?.color}`}>
              {statusConfig[shipment.status]?.label}
            </span>
          </div>

          {/* Items & Bin Locations */}
          <div className="border-t pt-4">
            <p className="text-sm font-semibold text-gray-700 mb-3">Items & Bin Locations:</p>
            <div className="p-4 bg-gray-50 rounded-xl space-y-3">
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  {product ? product.name : 'Product'}
                </p>
                <p className="text-xs text-gray-500">SKU: {sku}</p>
                <p className="text-xs text-gray-500">Quantity: {qty} units</p>
                <p className="text-xs text-purple-600 mt-1">
                  <FiMapPin className="inline" size={12} /> Location: {product?.binCode || 'Not assigned'}
                </p>
              </div>
            </div>
            <div className="border-t pt-4 flex justify-between mt-3">
              <span className="font-bold text-gray-800">Total Items</span>
              <span className="font-bold text-blue-600">{qty}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const NewShipmentModal = ({ onClose, onAdd, lowStockProducts }) => {
  const [form, setForm] = useState({ sku: '', quantity: '', supplier: '', customSupplier: '' });
  const [loading, setLoading] = useState(false);
  const [useCustom, setUseCustom] = useState(false);

  const defaultSuppliers = [
    'Logitech',
    'Dell Technologies',
    'Sony Corporation',
    'Samsung Electronics',
    'HP Inc.',
    'Lenovo',
    'Apple Inc.',
    'Microsoft',
    'Intel Corporation',
    'Cisco Systems',
    'Other (Type below)'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalSupplier = useCustom ? form.customSupplier : form.supplier;
    if (!form.sku || !form.quantity || !finalSupplier) {
      toast.error('Please fill all fields');
      return;
    }
    setLoading(true);
    try {
      const orderNumber = `SHP-${Date.now().toString().slice(-6)}|SKU:${form.sku}|QTY:${form.quantity}|SUP:${finalSupplier}`;
      await api.get('/orders/create', { params: { orderNumber } });
      toast.success('Shipment created!');
      onAdd();
      onClose();
    } catch (err) {
      toast.error('Failed to create shipment');
    } finally {
      setLoading(false);
    }
  };

  const handleSupplierChange = (value) => {
    if (value === 'Other (Type below)') {
      setUseCustom(true);
      setForm({ ...form, supplier: value });
    } else {
      setUseCustom(false);
      setForm({ ...form, supplier: value });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">New Shipment</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><FiX size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Supplier *</label>
            <select value={form.supplier}
              onChange={(e) => handleSupplierChange(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" required>
              <option value="">-- Select Supplier --</option>
              {defaultSuppliers.map(sup => (
                <option key={sup} value={sup}>{sup}</option>
              ))}
            </select>
          </div>

          {/* Custom Supplier Input */}
          {useCustom && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Enter Supplier Name *</label>
              <input placeholder="Type supplier name..." value={form.customSupplier}
                onChange={(e) => setForm({ ...form, customSupplier: e.target.value })}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product SKU *</label>
            <input placeholder="e.g. M1" value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
            <input type="number" placeholder="e.g. 50" value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2">
              {loading ? <FiLoader className="animate-spin" /> : null} Create Shipment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ReceivingPage = () => {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL');

  const fetchShipments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/orders');
      // Filter only shipment orders (SHP-)
      const shipmentOrders = res.data.filter(o => o.orderNumber.startsWith('SHP-'));
      setShipments(shipmentOrders);
    } catch (err) {
      toast.error('Failed to load shipments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchShipments(); }, []);
    const parseShipmentInfo = (orderNumber) => {
    const parts = orderNumber.split('|');
    return {
      sku: parts[1]?.replace('SKU:', '') || 'N/A',
      qty: parts[2]?.replace('QTY:', '') || '0',
      supplier: parts[3]?.replace('SUP:', '') || 'Unknown Supplier'
    };
  };

  const updateStatus = async (orderNumber, newStatus) => {
    try {
      await api.get(`/orders/${orderNumber}/status`, { params: { newStatus } });
      toast.success(`Shipment ${newStatus}`);
      fetchShipments();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const filteredShipments = filterStatus === 'ALL' ? shipments : shipments.filter(s => s.status === filterStatus);

  const counts = {
    ALL: shipments.length,
    PENDING: shipments.filter(s => s.status === 'PENDING').length,
    PROCESSING: shipments.filter(s => s.status === 'PROCESSING').length,
    RECEIVED: shipments.filter(s => s.status === 'RECEIVED').length,
  };

  // Parse order number to get SKU and QTY
  const parseOrderInfo = (orderNumber) => {
    const parts = orderNumber.split('|');
    return {
      sku: parts[1]?.replace('SKU:', '') || 'N/A',
      qty: parts[2]?.replace('QTY:', '') || '0'
    };
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
          <h1 className="text-2xl font-bold text-gray-800">Receiving</h1>
          <p className="text-gray-500 text-sm mt-1">Manage incoming shipments and putaway</p>
        </div>
        <button onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl">
          <FiPlus size={18} /> New Shipment
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border"><p className="text-gray-500 text-sm">Total Shipments</p><p className="text-2xl font-bold">{counts.ALL}</p></div>
        <div className="bg-white rounded-xl p-4 border border-blue-100"><p className="text-blue-600 text-sm">Processing</p><p className="text-2xl font-bold">{counts.PROCESSING}</p></div>
        <div className="bg-white rounded-xl p-4 border border-green-100"><p className="text-green-600 text-sm">Received</p><p className="text-2xl font-bold">{counts.RECEIVED}</p></div>
      </div>

      <div className="flex gap-2">
        {['ALL', 'PENDING', 'PROCESSING', 'RECEIVED'].map((status) => (
          <button key={status} onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors
              ${filterStatus === status ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}>
            {status} ({counts[status]})
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredShipments.map((shipment) => {
          const config = statusConfig[shipment.status] || statusConfig['PENDING'];
          const info = parseShipmentInfo(shipment.orderNumber);
          return (
            <div key={shipment.id} className="bg-white rounded-2xl p-5 shadow-sm border hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                    <FiTruck className="text-blue-500" size={22} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <p className="font-bold text-gray-800">{shipment.orderNumber.split('|')[0]}</p>
                      <span className={`flex items-center gap-1 text-xs px-3 py-1 rounded-full font-medium ${config.color}`}>
                        {config.icon}{config.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">
  {info.supplier} • {info.qty} items • {shipment.orderDate}
</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button onClick={() => setSelectedShipment(shipment)}
                    className="text-sm border border-gray-300 text-gray-600 px-4 py-2 rounded-xl hover:bg-gray-50">
                    View Details
                  </button>
                  {config.next && (
                    <button onClick={() => updateStatus(shipment.orderNumber, config.next)}
                      className={`text-sm text-white px-4 py-2 rounded-xl transition-colors ${config.nextColor}`}>
                      {config.nextLabel}
                    </button>
                  )}
                  {!config.next && (
                    <div className="flex items-center gap-1 text-green-600 bg-green-50 px-3 py-2 rounded-xl text-sm">
                      <FiCheck size={16} /> Completed
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {filteredShipments.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <FiTruck size={40} className="mx-auto mb-3" /><p>No shipments found</p>
          </div>
        )}
      </div>

      {showNewModal && <NewShipmentModal onClose={() => setShowNewModal(false)} onAdd={fetchShipments} />}
      {selectedShipment && <ShipmentDetailModal shipment={selectedShipment} onClose={() => setSelectedShipment(null)} />}
    </div>
  );
};

export default ReceivingPage;