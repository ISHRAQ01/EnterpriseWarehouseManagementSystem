import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import toast from 'react-hot-toast';
import {
  FiTruck, FiPlus, FiX, FiPackage, FiAlertTriangle,
  FiCheck, FiClock, FiLoader, FiMapPin, FiEye, FiDownload
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

const parseShipmentInfo = (orderNumber) => {
  const parts = orderNumber.split('|');
  const info = {
    sku: parts[1]?.replace('SKU:', '') || 'N/A',
    qty: parts[2]?.replace('QTY:', '') || '0',
    supplier: parts[3]?.replace('SUP:', '') || 'Unknown Supplier',
    warehouseId: parts[4]?.replace('WH:', '') || null,
    extraItems: []
  };

  parts.forEach(part => {
    if (part.startsWith('EXTRA:')) {
      const extraStr = part.replace('EXTRA:', '');
      const extraParts = extraStr.split(':');
      const extraItem = { sku: '', qty: '0', warehouseId: null };
      for (let i = 0; i < extraParts.length; i++) {
        if (extraParts[i] === 'SKU' && extraParts[i + 1]) extraItem.sku = extraParts[i + 1];
        if (extraParts[i] === 'QTY' && extraParts[i + 1]) extraItem.qty = extraParts[i + 1];
        if (extraParts[i] === 'WH' && extraParts[i + 1]) extraItem.warehouseId = extraParts[i + 1];
      }
      if (extraItem.sku) info.extraItems.push(extraItem);
    }
  });

  return info;
};

const ShipmentDetailModal = ({ shipment, onClose }) => {
  const [productsMap, setProductsMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const info = parseShipmentInfo(shipment.orderNumber);

    const itemsToFind = [
      { sku: info.sku, warehouseId: info.warehouseId || null, key: 'main' },
      ...info.extraItems.map((ei, i) => ({
        sku: ei.sku,
        warehouseId: ei.warehouseId || null,
        key: `extra-${i}`
      }))
    ].filter(item => item.sku);

    if (itemsToFind.length > 0) {
      api.get('/inventory/with-warehouse')
        .then(res => {
          const allProducts = res.data;
          const map = {};

          itemsToFind.forEach(item => {
            const match = allProducts.find(p =>
              p.sku === item.sku &&
              (item.warehouseId ? String(p.warehouseId) === String(item.warehouseId) : true)
            );
            map[item.key] = match || { name: item.sku, sku: item.sku, warehouseName: 'Unknown', location: 'Not assigned' };
          });

          setProductsMap(map);
        })
        .catch(() => setProductsMap({}))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [shipment]);

  const info = parseShipmentInfo(shipment.orderNumber);
  const mainQty = parseInt(info.qty) || 0;
  const extraQty = info.extraItems.reduce((sum, ei) => sum + (parseInt(ei.qty) || 0), 0);
  const totalItems = mainQty + extraQty;

  const allItems = [
    { ...info, key: 'main', product: productsMap['main'], label: 'Product 1' },
    ...info.extraItems.map((item, i) => ({
      ...item,
      key: `extra-${i}`,
      product: productsMap[`extra-${i}`],
      label: `Product ${i + 2}`
    }))
  ];

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl">
          <div className="flex justify-center py-12">
            <FiLoader className="animate-spin text-blue-500" size={32} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 rounded-t-2xl z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-800">{shipment.orderNumber.split('|')[0]}</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {new Date(shipment.orderDate).toLocaleDateString('en-US', {
                  weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
                })}
              </p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <FiX size={20} className="text-gray-500" />
            </button>
          </div>
        </div>
        <div className="px-6 py-5 space-y-5">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <FiTruck size={14} className="text-green-600" />
              </div>
              <p className="text-sm font-semibold text-gray-700">Shipment Info</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">Supplier</p>
                <p className="text-sm font-medium text-gray-800">{info.supplier}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">Status</p>
                <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${statusConfig[shipment.status]?.color}`}>
                  {statusConfig[shipment.status]?.icon}{statusConfig[shipment.status]?.label}
                </span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-3 border-b border-blue-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <FiPackage size={14} className="text-white" />
                  </div>
                  <p className="text-sm font-semibold text-blue-700">
                    {allItems.length} Product{allItems.length > 1 ? 's' : ''}
                  </p>
                </div>
                <span className="text-xs text-blue-500 font-medium">{totalItems} units total</span>
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {allItems.map((item, i) => (
                <div key={item.key} className="px-4 py-3 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                        {i + 1}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{item.product?.name || 'Product'}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">{item.sku}</code>
                          {item.product?.warehouseName && (
                            <span className="text-xs text-purple-500 flex items-center gap-1">
                              <FiMapPin size={10} /> {item.product.warehouseName}
                            </span>
                          )}
                        </div>
                        {item.product?.location && (
                          <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                            <FiMapPin size={10} /> {item.product.location}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-800">{item.qty} units</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-gray-50 border-t border-gray-200 px-4 py-3">
              <div className="flex justify-between text-base font-bold">
                <span className="text-gray-800">Total Items</span>
                <span className="text-blue-600">{totalItems} units</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const NewShipmentModal = ({ onClose, onAdd, lowStockProducts }) => {
  const [loading, setLoading] = useState(false);
  const [shipmentNo, setShipmentNo] = useState('');
  const [supplier, setSupplier] = useState('');
  const [customSupplier, setCustomSupplier] = useState('');
  const [useCustom, setUseCustom] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [items, setItems] = useState([
    { sku: '', productName: '', quantity: '', warehouseId: '' }
  ]);

  useEffect(() => {
    api.get('/inventory/with-warehouse')
      .then(res => setAllProducts(res.data))
      .catch(() => { });
  }, []);

  const defaultSuppliers = [
    'Logitech', 'Dell Technologies', 'Sony Corporation', 'Samsung Electronics',
    'HP Inc.', 'Lenovo', 'Apple Inc.', 'Microsoft', 'Intel Corporation',
    'Cisco Systems', 'Other (Type below)'
  ];

  const addRow = () => {
    setItems([...items, { sku: '', productName: '', quantity: '', warehouseId: '' }]);
  };

  const removeRow = (index) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const updateRow = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    if (field === 'sku') {
      const match = allProducts.find(p => p.sku === value);
      updated[index].productName = match?.name || '';
      updated[index].warehouseId = match?.warehouseId || '';
    }
    setItems(updated);
  };

  const handleSupplierChange = (value) => {
    if (value === 'Other (Type below)') {
      setUseCustom(true);
      setSupplier(value);
    } else {
      setUseCustom(false);
      setSupplier(value);
    }
  };

  const selectProduct = (p, index) => {
    const updated = [...items];
    updated[index].sku = p.sku;
    updated[index].productName = p.name;
    updated[index].warehouseId = p.warehouseId;
    setItems(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalSupplier = useCustom ? customSupplier : supplier;
    if (!shipmentNo || !finalSupplier) {
      toast.error('Please fill shipment number and supplier');
      return;
    }
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.sku || !item.quantity) {
        toast.error(`Item ${i + 1}: Please fill all fields`);
        return;
      }
    }
    setLoading(true);
    try {
      const firstItem = items[0];
      let orderNumber = `SHP-${shipmentNo}|SKU:${firstItem.sku}|QTY:${firstItem.quantity}|SUP:${finalSupplier}|WH:${firstItem.warehouseId}`;
      if (items.length > 1) {
        const extraItems = items.slice(1)
          .filter(i => i.sku)
          .map(i => `EXTRA:SKU:${i.sku}:QTY:${i.quantity}:WH:${i.warehouseId}`)
          .join('|');
        orderNumber += `|${extraItems}`;
      }
      await api.get('/orders/create', { params: { orderNumber } });
      toast.success('Shipment created!');
      onAdd(); onClose();
    } catch {
      toast.error('Failed to create shipment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold text-gray-800">New Shipment</h2>
            <p className="text-sm text-gray-500">{items.length} product{items.length > 1 ? 's' : ''} in shipment</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><FiX size={20} /></button>
        </div>
        {lowStockProducts && lowStockProducts.length > 0 && (
          <div className="mb-4 p-3 bg-amber-50 rounded-xl border border-amber-200">
            <p className="text-sm font-semibold text-amber-700 mb-2">⚠️ Low Stock Products (click to add):</p>
            <div className="flex gap-2 flex-wrap">
              {lowStockProducts.map(p => (
                <button key={p.displayKey}
                  onClick={() => {
                    const emptyIndex = items.findIndex(i => !i.sku);
                    if (emptyIndex >= 0) {
                      selectProduct(p, emptyIndex);
                    } else {
                      setItems([...items, { sku: p.sku, productName: p.name, quantity: '', warehouseId: p.warehouseId }]);
                    }
                  }}
                  className="text-xs px-3 py-1.5 rounded-full font-medium bg-white border border-amber-300 text-amber-700 hover:bg-amber-100 transition-colors"
                >
                  {p.name}: {p.quantity} units
                </button>
              ))}
            </div>
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <input placeholder="Shipment Number * (e.g. 001)" value={shipmentNo} onChange={(e) => setShipmentNo(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            <div>
              {!useCustom ? (
                <select value={supplier} onChange={(e) => handleSupplierChange(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                  <option value="">-- Select Supplier --</option>
                  {defaultSuppliers.map(sup => (<option key={sup} value={sup}>{sup}</option>))}
                </select>
              ) : (
                <input placeholder="Enter supplier name *" value={customSupplier} onChange={(e) => setCustomSupplier(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              )}
            </div>
          </div>
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="grid grid-cols-[1fr,100px,80px,36px] gap-2 px-4 py-2.5 bg-gray-100 text-xs font-semibold text-gray-600 uppercase tracking-wider">
              <span>Product *</span><span>Quantity *</span><span>Warehouse</span><span></span>
            </div>
            <div className="divide-y divide-gray-100">
              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-[1fr,100px,80px,36px] gap-2 px-4 py-2.5 items-center bg-white hover:bg-gray-50/50 transition-colors">
                  <select value={item.sku && item.warehouseId ? `${item.sku}__${item.warehouseId}` : ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (!value) { updateRow(index, 'sku', ''); updateRow(index, 'warehouseId', ''); updateRow(index, 'productName', ''); return; }
                      const [sku, whId] = value.split('__');
                      updateRow(index, 'sku', sku);
                      updateRow(index, 'warehouseId', whId);
                    }}
                    className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 truncate" required>
                    <option value="">-- Select Product --</option>
                    {allProducts.map(p => (
                      <option key={`${p.sku}__${p.warehouseId}`} value={`${p.sku}__${p.warehouseId}`}>{p.name} ({p.sku}) — {p.warehouseName || 'N/A'} | Stock: {p.quantity}</option>
                    ))}
                  </select>
                  <input type="number" placeholder="Qty" value={item.quantity} onChange={(e) => updateRow(index, 'quantity', e.target.value)} className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500" min="1" required />
                  <span className="text-xs text-gray-500 truncate">
                    {item.warehouseId ? (allProducts.find(p => p.sku === item.sku && String(p.warehouseId) === String(item.warehouseId))?.warehouseName || '—') : '—'}
                  </span>
                  <div className="flex justify-center">
                    {items.length > 1 && (
                      <button type="button" onClick={() => removeRow(index)} className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded" title="Remove"><FiX size={15} /></button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button type="button" onClick={addRow} className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 text-sm font-medium mt-3 px-1 transition-colors">
            <FiPlus size={15} /> Add Another Product
          </button>
          <div className="flex gap-3 pt-4 mt-4 border-t border-gray-200">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl hover:bg-gray-50 font-medium text-sm transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2 font-medium text-sm transition-colors disabled:opacity-50">
              {loading ? <FiLoader className="animate-spin" size={16} /> : <FiPlus size={16} />}
              {loading ? 'Creating...' : `Create Shipment (${items.length} product${items.length > 1 ? 's' : ''})`}
            </button>
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
        api.get('/inventory/with-warehouse')
      ]);
      setShipments(shipRes.data.filter(o => o.orderNumber.startsWith('SHP-')));
      setProducts(prodRes.data);
    } catch (err) { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const lowStockProducts = (products || []).filter(p => p.quantity < 30).map(p => ({
    ...p,
    warehouseName: p.location?.split(' → ')[0] || 'Unknown',
    warehouseId: p.warehouseId || null,
    displayKey: `${p.sku}-${p.warehouseId || 'unknown'}`
  }));

  const updateStatus = async (orderNumber, newStatus) => {
    try {
      await api.get(`/orders/${encodeURIComponent(orderNumber)}/status`, { params: { newStatus } });
      toast.success(`Shipment ${newStatus}`);
      setShipments(prev => {
        const updated = prev.find(o => o.orderNumber === orderNumber);
        const rest = prev.filter(o => o.orderNumber !== orderNumber);
        return [{ ...updated, status: newStatus }, ...rest];
      });
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const filteredShipments = filterStatus === 'ALL' ? shipments : shipments.filter(s => s.status === filterStatus);
  const counts = {
    ALL: shipments.length,
    PENDING: shipments.filter(s => s.status === 'PENDING').length,
    PROCESSING: shipments.filter(s => s.status === 'PROCESSING').length,
    RECEIVED: shipments.filter(s => s.status === 'RECEIVED').length
  };

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
          <h1 className="text-2xl font-bold text-gray-800">Shipments</h1>
          <p className="text-gray-500 text-sm mt-1">Manage incoming shipments and stock replenishment</p>
        </div>
        {!isOperator && (
          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl transition-colors shadow-sm"
          >
            <FiPlus size={18} /> New Shipment
          </button>
        )}
      </div>

      {/* Low Stock Alert */}
      {!isOperator && lowStockProducts.length > 0 && (
        <div className="bg-gradient-to-r from-red-50 to-amber-50 border border-red-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center shadow-sm">
                <FiAlertTriangle className="text-red-500" size={28} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-red-700">
                  {lowStockProducts.length} Product{lowStockProducts.length > 1 ? 's' : ''} Need Replenishment
                </h3>
                <div className="flex items-center gap-3 mt-1">
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-red-600">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    {lowStockProducts.filter(p => p.quantity === 0).length} out of stock
                  </span>
                  <span className="text-gray-300">•</span>
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-amber-600">
                    <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                    {lowStockProducts.filter(p => p.quantity > 0).length} low stock
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowNewModal(true)}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl transition-colors shadow-lg font-medium"
            >
              <FiPlus size={18} /> Create Shipment
            </button>
          </div>

          {/* Product Tags */}
          <div className="flex gap-2 flex-wrap mt-4">
            {lowStockProducts.slice(0, 6).map(p => (
              <span
                key={p.displayKey}
                className={`inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl font-medium border transition-colors ${p.quantity === 0
                  ? 'bg-red-100 text-red-700 border-red-200 hover:bg-red-200'
                  : 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200'
                  }`}
              >
                {p.quantity === 0 ? (
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                ) : (
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                )}
                <span className="font-semibold">{p.name}</span>
                <span className="opacity-75">({p.quantity})</span>
              </span>
            ))}
            {lowStockProducts.length > 6 && (
              <span className="inline-flex items-center text-xs px-3 py-2 rounded-xl font-medium bg-gray-100 text-gray-600 border border-gray-200">
                +{lowStockProducts.length - 6} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'All', count: counts.ALL, color: 'bg-gray-600', icon: <FiTruck size={18} /> },
          { label: 'Pending', count: counts.PENDING, color: 'bg-gray-400', icon: <FiClock size={18} /> },
          { label: 'Processing', count: counts.PROCESSING, color: 'bg-blue-500', icon: <FiPackage size={18} /> },
          { label: 'Received', count: counts.RECEIVED, color: 'bg-green-500', icon: <FiCheck size={18} /> },
        ].map(stat => (
          <div
            key={stat.label}
            onClick={() => setFilterStatus(stat.label === 'All' ? 'ALL' : stat.label.toUpperCase())}
            className={`bg-white rounded-xl p-4 border cursor-pointer transition-all hover:shadow-md ${filterStatus === (stat.label === 'All' ? 'ALL' : stat.label.toUpperCase())
              ? 'ring-2 ring-blue-500 border-blue-200'
              : 'border-gray-200'
              }`}
          >
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

      {/* Shipments List */}
      <div className="space-y-3">
        {filteredShipments.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border">
            <FiTruck size={48} className="mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500 font-medium">No shipments found</p>
            <p className="text-gray-400 text-sm mt-1">
              {filterStatus === 'ALL'
                ? 'Create your first shipment to get started'
                : `No shipments with status "${filterStatus}"`}
            </p>
          </div>
        ) : (
          filteredShipments.map(shipment => {
            const config = statusConfig[shipment.status] || statusConfig['PENDING'];
            const info = parseShipmentInfo(shipment.orderNumber);
            const productName = products.find(p => p.sku === info.sku)?.name || 'Product';
            const totalItems = (parseInt(info.qty) || 0) + info.extraItems.reduce((sum, ei) => sum + (parseInt(ei.qty) || 0), 0);

            return (
              <div key={shipment.id} className="bg-white rounded-2xl border border-gray-200 hover:shadow-md transition-all overflow-hidden">
                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    {/* Left: Shipment Info */}
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white shadow-sm">
                        <FiTruck size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-gray-800">{shipment.orderNumber.split('|')[0]}</p>
                          <span className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${config.color}`}>
                            {config.icon}{config.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 text-sm text-gray-500">
                          <span>{info.supplier}</span>
                          <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                          <span>{totalItems} items</span>
                          <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                          <span>{new Date(shipment.orderDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2">
                      {/* QR Download Button */}
                      <button
                        onClick={() => {
                          const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shipment.orderNumber)}`;
                          fetch(qrUrl)
                            .then(res => res.blob())
                            .then(blob => {
                              const url = window.URL.createObjectURL(blob);
                              const link = document.createElement('a');
                              link.href = url;
                              link.download = `Shipment-${shipment.orderNumber.split('|')[0]}.png`;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                              window.URL.revokeObjectURL(url);
                              toast.success('QR Code downloaded!');
                            })
                            .catch(() => toast.error('Failed to download QR'));
                        }}
                        className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        title="Download QR Code"
                      >
                        <FiDownload size={18} />
                      </button>

                      <button
                        onClick={() => setSelectedShipment(shipment)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <FiEye size={18} />
                      </button>

                      {shipment.status === 'PENDING' && user?.role === 'MANAGER' && (
                        <button
                          onClick={() => updateStatus(shipment.orderNumber, 'PROCESSING')}
                          className="text-sm text-white px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors font-medium"
                        >
                          Start Processing
                        </button>
                      )}
                      {shipment.status === 'PROCESSING' && user?.role === 'OPERATOR' && (
                        <button
                          onClick={() => updateStatus(shipment.orderNumber, 'RECEIVED')}
                          className="text-sm text-white px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 transition-colors font-medium"
                        >
                          Mark Received
                        </button>
                      )}
                      {shipment.status === 'RECEIVED' && (
                        <div className="flex items-center gap-1 text-green-600 bg-green-50 px-3 py-2 rounded-lg text-sm font-medium">
                          <FiCheck size={16} /> Received
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Products Summary */}
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                    <FiPackage size={14} className="text-gray-400" />
                    <span className="font-medium">{productName}</span>
                    <span className="text-gray-400">× {info.qty}</span>
                    {info.extraItems.length > 0 && (
                      <span className="text-blue-500 font-medium">+ {info.extraItems.length} more product{info.extraItems.length > 1 ? 's' : ''}</span>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between text-xs text-gray-400 mb-1.5 px-1">
                      <span>Pending</span>
                      <span>Processing</span>
                      <span>Received</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${shipment.status === 'PENDING' ? 'w-1/3 bg-gray-400' :
                          shipment.status === 'PROCESSING' ? 'w-2/3 bg-blue-500' :
                            'w-full bg-green-500'
                          }`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {showNewModal && (<NewShipmentModal onClose={() => setShowNewModal(false)} onAdd={fetchData} lowStockProducts={lowStockProducts} />)}
      {selectedShipment && <ShipmentDetailModal shipment={selectedShipment} onClose={() => setSelectedShipment(null)} />}
    </div>
  );
};

export default ReceivingPage;