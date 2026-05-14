import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import toast from 'react-hot-toast';
import {
  FiTruck, FiPlus, FiX, FiPackage, FiAlertTriangle,
  FiCheck, FiClock, FiLoader, FiMapPin
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';


const statusConfig = {
  PENDING: {
    label: 'Pending', color: 'bg-gray-100 text-gray-700', icon: <FiClock size={14} />,
    next: 'PROCESSING', nextLabel: 'Start Processing', nextColor: 'bg-blue-600 hover:bg-blue-700'
  },
  PROCESSING: {
    label: 'Processing', color: 'bg-blue-100 text-blue-700', icon: <FiPackage size={14} />,
    next: 'RECEIVED', nextLabel: 'Mark as Received', nextColor: 'bg-green-600 hover:bg-green-700'
  },
  RECEIVED: {
    label: 'Received', color: 'bg-green-100 text-green-700', icon: <FiCheck size={14} />,
    next: null, nextLabel: null, nextColor: null
  },
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
  const supplier = parts[3]?.replace('SUP:', '') || 'N/A';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">{shipment.orderNumber.split('|')[0]}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><FiX size={20} /></button>
        </div>
        <div className="space-y-4 text-base">
          <div className="flex justify-between text-sm"><span className="text-gray-500">Supplier</span><span className="font-medium">{supplier}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-500">Date</span><span className="font-medium">{shipment.orderDate || 'N/A'}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-500">Status</span><span className={`text-xs px-3 py-1 rounded-full font-medium ${statusConfig[shipment.status]?.color}`}>{statusConfig[shipment.status]?.label}</span></div>
          <div className="border-t pt-4"><p className="text-sm font-semibold text-gray-700 mb-3">Items & Bin Locations:</p>
            <div className="p-4 bg-gray-50 rounded-xl space-y-3">
              <div>
                <p className="text-sm font-semibold text-gray-800">{product ? product.name : 'Product'}</p>
                <p className="text-xs text-gray-500">SKU: {sku}</p>
                <p className="text-xs text-gray-500">Quantity: {qty} units</p>
                <p className="text-xs text-purple-600 mt-1"><FiMapPin className="inline" size={12} /> Location: {product?.location || 'Not assigned'}</p>              </div>
            </div>
            <div className="border-t pt-4 flex justify-between mt-3"><span className="font-bold text-gray-800">Total Items</span><span className="font-bold text-blue-600">{qty}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const NewShipmentModal = ({ onClose, onAdd, lowStockProducts }) => {
  const [form, setForm] = useState({ shipmentNo: '', sku: '', quantity: '', supplier: '', customSupplier: '' });
  const [loading, setLoading] = useState(false);
  const [useCustom, setUseCustom] = useState(false);

  const defaultSuppliers = [
    'Logitech', 'Dell Technologies', 'Sony Corporation', 'Samsung Electronics',
    'HP Inc.', 'Lenovo', 'Apple Inc.', 'Microsoft', 'Intel Corporation',
    'Cisco Systems', 'Other (Type below)'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalSupplier = useCustom ? form.customSupplier : form.supplier;
    if (!form.shipmentNo || !form.sku || !form.quantity || !finalSupplier) { toast.error('Please fill all fields'); return; }
    setLoading(true);
    try {
      const orderNumber = `${form.shipmentNo}|SKU:${form.sku}|QTY:${form.quantity}|SUP:${finalSupplier}`; await api.get('/orders/create', { params: { orderNumber } });
      toast.success('Shipment created!'); onAdd(); onClose();
    } catch { toast.error('Failed to create shipment'); }
    finally { setLoading(false); }
  };

  const handleSupplierChange = (value) => {
    if (value === 'Other (Type below)') { setUseCustom(true); setForm({ ...form, supplier: value }); }
    else { setUseCustom(false); setForm({ ...form, supplier: value }); }
  };

  const selectProduct = (sku) => { setForm({ ...form, sku: sku }); };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6"><h2 className="text-xl font-bold text-gray-800">New Shipment</h2><button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><FiX size={20} /></button></div>

        {/* Low Stock Products */}
        {lowStockProducts && lowStockProducts.length > 0 && (
          <div className="mb-4 p-3 bg-amber-50 rounded-xl border border-amber-200">
            <p className="text-sm font-semibold text-amber-700 mb-2">⚠️ Low Stock Products:</p>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {lowStockProducts.map(p => (
                <div key={p.sku} onClick={() => selectProduct(p.sku)}
                  className={`p-2 rounded-lg cursor-pointer flex justify-between text-sm hover:bg-amber-100 transition-colors ${form.sku === p.sku ? 'bg-amber-100 border border-amber-300' : 'bg-white'}`}>
                  <span className="font-medium text-gray-700">{p.name}</span>
                  <span className={`font-bold ${p.quantity === 0 ? 'text-red-500' : 'text-amber-600'}`}>{p.quantity} units</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Shipment Number *</label>
            <input placeholder="e.g. SHP-001" value={form.shipmentNo}
              onChange={(e) => setForm({ ...form, shipmentNo: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Supplier *</label>
            <select value={form.supplier} onChange={(e) => handleSupplierChange(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" required>
              <option value="">-- Select Supplier --</option>
              {defaultSuppliers.map(sup => (<option key={sup} value={sup}>{sup}</option>))}
            </select>
          </div>
          {useCustom && (
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Enter Supplier Name *</label>
              <input placeholder="Type supplier name..." value={form.customSupplier} onChange={(e) => setForm({ ...form, customSupplier: e.target.value })}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
          )}
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Product SKU *</label>
            <input placeholder="e.g. M1" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
            <input type="number" placeholder="e.g. 50" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>
          <div className="flex gap-3 pt-2"><button type="button" onClick={onClose} className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2">{loading ? <FiLoader className="animate-spin" /> : null} Create Shipment</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ReceivingPage = () => {
  const { user } = useAuth();
  const isOperator = user?.role === 'OPERATOR';
  const [shipments, setShipments] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [shipRes, prodRes] = await Promise.all([
        api.get('/orders'),
        api.get('/inventory')
      ]);
      setShipments(shipRes.data.filter(o => o.orderNumber.startsWith('SHP-')));
      setProducts(prodRes.data);
    } catch (err) { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const lowStockProducts = products.filter(p => p.quantity < 30);

  const parseShipmentInfo = (orderNumber) => {
    const parts = orderNumber.split('|');
    return { sku: parts[1]?.replace('SKU:', '') || 'N/A', qty: parts[2]?.replace('QTY:', '') || '0', supplier: parts[3]?.replace('SUP:', '') || 'Unknown Supplier' };
  };

  const updateStatus = async (orderNumber, newStatus) => {
    try {
      await api.get(`/orders/${orderNumber}/status`, { params: { newStatus } });
      toast.success(`Shipment ${newStatus}`);
      fetchData();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };
  const filteredShipments = filterStatus === 'ALL' ? shipments : shipments.filter(s => s.status === filterStatus);
  const counts = { ALL: shipments.length, PENDING: shipments.filter(s => s.status === 'PENDING').length, PROCESSING: shipments.filter(s => s.status === 'PROCESSING').length, RECEIVED: shipments.filter(s => s.status === 'RECEIVED').length };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><FiLoader className="animate-spin text-blue-500" size={40} /></div>;

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Shipment</h1>
          <p className="text-gray-500 text-sm mt-1">Manage incoming shipments and stock replenishment</p>
        </div>
        {!isOperator && (
          <button onClick={() => setShowNewModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl">
            <FiPlus size={18} /> New Shipment
          </button>
        )}
      </div>

      {/* Low Stock Alert Banner - Only for Manager */}
      {!isOperator && lowStockProducts.length > 0 && (
        <div className="bg-gradient-to-r from-red-50 to-amber-50 border border-red-200 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <FiAlertTriangle className="text-red-500" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-red-700">
                  {lowStockProducts.length} Product{lowStockProducts.length > 1 ? 's' : ''} Need{lowStockProducts.length === 1 ? 's' : ''} Replenishment
                </h3>
                <p className="text-sm text-red-600">
                  {lowStockProducts.filter(p => p.quantity === 0).length} out of stock • {lowStockProducts.filter(p => p.quantity > 0).length} low stock
                </p>
              </div>
            </div>
            <button onClick={() => setShowNewModal(true)}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl transition-colors shadow-lg">
              <FiPlus size={18} /> Create Shipment
            </button>
          </div>

          <div className="flex gap-2 flex-wrap mt-4">
            {lowStockProducts.slice(0, 5).map(p => (
              <span key={p.sku} className={`text-xs px-3 py-1.5 rounded-full font-medium ${p.quantity === 0 ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-amber-100 text-amber-700 border border-amber-200'}`}>
                {p.name}: {p.quantity} units
              </span>
            ))}
            {lowStockProducts.length > 5 && (
              <span className="text-xs px-3 py-1.5 rounded-full font-medium bg-gray-100 text-gray-600">
                +{lowStockProducts.length - 5} more
              </span>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border"><p className="text-gray-500 text-sm">Total Shipments</p><p className="text-2xl font-bold">{counts.ALL}</p></div>
        <div className="bg-white rounded-xl p-4 border border-blue-100"><p className="text-blue-600 text-sm">Processing</p><p className="text-2xl font-bold">{counts.PROCESSING}</p></div>
        <div className="bg-white rounded-xl p-4 border border-green-100"><p className="text-green-600 text-sm">Received</p><p className="text-2xl font-bold">{counts.RECEIVED}</p></div>
      </div>

      <div className="flex gap-2">
        {['ALL', 'PENDING', 'PROCESSING', 'RECEIVED'].map(status => (
          <button key={status} onClick={() => setFilterStatus(status)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filterStatus === status ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}>
            {status} ({counts[status]})
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredShipments.map(shipment => {
          const config = statusConfig[shipment.status] || statusConfig['PENDING'];
          const info = parseShipmentInfo(shipment.orderNumber);
          const productName = products.find(p => p.sku === info.sku)?.name || 'Product';

          return (
            <div key={shipment.id} className="bg-white rounded-2xl p-5 shadow-sm border hover:shadow-md transition-shadow">
              {/* Row 1: Shipment Number + Status Badge */}
              <div className="flex items-center justify-between mb-2">
                <p className="font-bold text-gray-800 text-lg">{shipment.orderNumber.split('|')[0]}</p>
                <span className={`flex items-center gap-1 text-xs px-3 py-1 rounded-full font-medium ${config.color}`}>
                  {config.icon}{config.label}
                </span>
              </div>

              {/* Row 2: Supplier + Date */}
              <p className="text-sm text-gray-500 mb-3">
                {info.supplier} • {info.qty} items • {new Date(shipment.orderDate).toLocaleDateString()}
              </p>

              {/* Row 3: Product Name + Quantity */}
              <p className="text-sm text-gray-700 mb-4">
                {productName} ({info.qty})
              </p>

              {/* Row 4: Buttons */}
              <div className="flex items-center justify-between">
                <div>
                  {shipment.status === 'PENDING' && user?.role === 'MANAGER' && (
                    <button onClick={() => updateStatus(shipment.orderNumber, 'PROCESSING')} className="text-sm text-white px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700">
                      Start Processing
                    </button>
                  )}
                  {shipment.status === 'PROCESSING' && user?.role === 'OPERATOR' && (
                    <button onClick={() => updateStatus(shipment.orderNumber, 'RECEIVED')} className="text-sm text-white px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700">
                      Mark as Received
                    </button>
                  )}
                </div>
                <button onClick={() => setSelectedShipment(shipment)} className="text-sm text-white px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700">
                  View Details
                </button>
              </div>
            </div>
          );
        })}
        {filteredShipments.length === 0 && (
          <div className="text-center py-12 text-gray-400"><FiTruck size={40} className="mx-auto mb-3" /><p>No shipments found</p></div>
        )}
      </div>

      {showNewModal && (<NewShipmentModal onClose={() => setShowNewModal(false)} onAdd={fetchData} lowStockProducts={lowStockProducts} />)}
      {selectedShipment && <ShipmentDetailModal shipment={selectedShipment} onClose={() => setSelectedShipment(null)} />}
    </div>
  );
};

export default ReceivingPage;