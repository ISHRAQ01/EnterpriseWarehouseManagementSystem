import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import {
  FiShoppingCart, FiPlus, FiX, FiPackage,
  FiTruck, FiCheck, FiClock, FiEye, FiLoader, FiMapPin, FiDownload
} from 'react-icons/fi';

const statusConfig = {
  PENDING: {
    label: 'Pending', color: 'bg-gray-100 text-gray-700', icon: <FiClock size={14} />,
    next: 'PICKING', nextLabel: 'Start Picking', nextColor: 'bg-blue-600 hover:bg-blue-700'
  },
  PICKING: {
    label: 'Picking', color: 'bg-blue-100 text-blue-700', icon: <FiPackage size={14} />,
    next: 'PACKED', nextLabel: 'Mark as Packed', nextColor: 'bg-amber-500 hover:bg-amber-600'
  },
  PACKED: {
    label: 'Packed', color: 'bg-amber-100 text-amber-700', icon: <FiPackage size={14} />,
    next: 'SHIPPED', nextLabel: 'Mark as Shipped', nextColor: 'bg-green-600 hover:bg-green-700'
  },
  SHIPPED: {
    label: 'Shipped', color: 'bg-green-100 text-green-700', icon: <FiTruck size={14} />,
    next: null, nextLabel: null, nextColor: null
  },
};

const NewOrderModal = ({ onClose, onAdd }) => {
  const [loading, setLoading] = useState(false);
  const [inventoryProducts, setInventoryProducts] = useState([]);
  const [customer, setCustomer] = useState({ name: '', phone: '', address: '' });
  const [orderNo, setOrderNo] = useState('');
  const [items, setItems] = useState([
    { sku: '', productName: '', quantity: '', price: '', warehouseId: '' }
  ]);

  useEffect(() => {
    api.get('/inventory/with-warehouse')
      .then(res => setInventoryProducts(res.data))
      .catch(() => toast.error('Failed to load products'));
  }, []);

  const addRow = () => {
    setItems([...items, { sku: '', productName: '', quantity: '', price: '', warehouseId: '' }]);
  };

  const removeRow = (index) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const updateRow = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;

    if (field === 'sku') {
      const match = inventoryProducts.find(p => p.sku === value && p.quantity > 0)
        || inventoryProducts.find(p => p.sku === value);
      updated[index].productName = match?.name || '';
      updated[index].warehouseId = match?.warehouseId || '';
    }

    setItems(updated);
  };

  const getAvailableStock = (sku, warehouseId) => {
    if (!sku || !warehouseId) {
      const product = inventoryProducts.find(p => p.sku === sku);
      return product?.quantity || 0;
    }
    const product = inventoryProducts.find(p =>
      p.sku === sku && String(p.warehouseId) === String(warehouseId)
    );
    return product?.quantity || 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!customer.name || !customer.phone || !customer.address) {
      toast.error('Please fill customer details');
      return;
    }

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.sku || !item.quantity || !item.price) {
        toast.error(`Item ${i + 1}: Please fill all fields`);
        return;
      }
      const stock = getAvailableStock(item.sku, item.warehouseId);
      if (parseInt(item.quantity) > stock) {
        toast.error(`Item ${i + 1}: Insufficient stock! Available: ${stock}`);
        return;
      }
    }

    setLoading(true);

    try {
      const firstItem = items[0];
      let orderNumber = `ORD-${orderNo || Date.now()}|SKU:${firstItem.sku}|QTY:${firstItem.quantity}|CUST:${customer.name}|PHONE:${customer.phone}|ADDR:${customer.address}|PRICE:${firstItem.price}|WH:${firstItem.warehouseId}`;
      if (items.length > 1) {
        const extraItems = items.slice(1)
          .filter(i => i.sku)
          .map(i => `EXTRA:SKU:${i.sku}:QTY:${i.quantity}:PRICE:${i.price}:WH:${i.warehouseId}`)
          .join('|');
        orderNumber += `|${extraItems}`;
      }

      await api.get('/orders/create', { params: { orderNumber } });

      toast.success('Order created successfully!');
      onAdd(); onClose();
    } catch (err) {
      toast.error('Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold text-gray-800">New Order</h2>
            <p className="text-sm text-gray-500">{items.length} item{items.length > 1 ? 's' : ''} in order</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><FiX size={20} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Customer Details */}
          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <p className="text-sm font-semibold text-gray-700 mb-3">Customer Details</p>
            <div className="grid grid-cols-3 gap-3">
              <input
                placeholder="Customer Name *"
                value={customer.name}
                onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="tel"
                placeholder="Phone *"
                value={customer.phone}
                onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                placeholder="Address *"
                value={customer.address}
                onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Order No */}
          <div className="mb-4">
            <input
              placeholder="Order Number (optional, auto-generated if empty)"
              value={orderNo}
              onChange={(e) => setOrderNo(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Items Table */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-[1fr,80px,80px,100px,36px] gap-2 px-4 py-2.5 bg-gray-100 text-xs font-semibold text-gray-600 uppercase tracking-wider">
              <span>Product *</span>
              <span>Qty *</span>
              <span>Price ($) *</span>
              <span>Warehouse</span>
              <span></span>
            </div>

            {/* Rows */}
            <div className="divide-y divide-gray-100">
              {items.map((item, index) => {
                const selectedProduct = inventoryProducts.find(p => p.sku === item.sku);
                const stock = selectedProduct ? selectedProduct.quantity : 0;
                const isOverStock = item.quantity && parseInt(item.quantity) > stock;

                return (
                  <div key={index} className="grid grid-cols-[1fr,80px,80px,100px,36px] gap-2 px-4 py-2.5 items-center bg-white hover:bg-gray-50/50 transition-colors">
                    <select
                      value={item.sku && item.warehouseId ? `${item.sku}__${item.warehouseId}` : ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (!value) {
                          updateRow(index, 'sku', '');
                          updateRow(index, 'warehouseId', '');
                          updateRow(index, 'productName', '');
                          return;
                        }
                        const [sku, whId] = value.split('__');
                        const selected = inventoryProducts.find(
                          p => p.sku === sku && String(p.warehouseId) === whId
                        );
                        updateRow(index, 'sku', sku);
                        updateRow(index, 'warehouseId', whId);
                        updateRow(index, 'productName', selected?.name || '');
                      }}
                      className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 truncate"
                      required
                    >
                      <option value="">-- Select Product --</option>
                      {inventoryProducts.map(p => {
                        const uniqueKey = `${p.sku}__${p.warehouseId || 'unknown'}`;
                        return (
                          <option key={uniqueKey} value={uniqueKey} disabled={p.quantity === 0}>
                            {p.name} ({p.sku}) — {p.warehouseName || 'N/A'} | Stock: {p.quantity}
                          </option>
                        );
                      })}
                    </select>
                    <input
                      type="number"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => updateRow(index, 'quantity', e.target.value)}
                      className={`w-full border rounded-lg px-2 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500 ${isOverStock ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                      min="1"
                      required
                    />
                    <input
                      type="number"
                      placeholder="0.00"
                      value={item.price}
                      onChange={(e) => updateRow(index, 'price', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                      step="0.01"
                      required
                    />
                    <span className="text-xs text-gray-500 px-1 truncate">
                      {item.warehouseId
                        ? (inventoryProducts.find(p => p.sku === item.sku && String(p.warehouseId) === String(item.warehouseId))?.warehouseName || item.warehouseId)
                        : '—'}
                    </span>
                    <div className="flex justify-center">
                      {items.length > 1 && (
                        <button type="button" onClick={() => removeRow(index)} className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded" title="Remove">
                          <FiX size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add Item Button */}
          <button
            type="button"
            onClick={addRow}
            className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 text-sm font-medium mt-3 px-1 transition-colors"
          >
            <FiPlus size={15} /> Add Another Item
          </button>

          {/* Order Summary */}
          {items.some(i => i.sku && i.quantity && i.price) && (
            <div className="bg-blue-50 rounded-xl p-4 mt-4">
              <p className="text-sm font-semibold text-blue-700 mb-2">Order Summary</p>
              <div className="space-y-1 text-sm">
                {items.filter(i => i.sku).map((item, i) => {
                  const product = inventoryProducts.find(p =>
                    p.sku === item.sku && String(p.warehouseId) === String(item.warehouseId)
                  ) || inventoryProducts.find(p => p.sku === item.sku);
                  const total = (parseFloat(item.price) || 0) * (parseInt(item.quantity) || 0);
                  return (
                    <div key={i} className="flex justify-between text-blue-800">
                      <span>{product?.name || item.sku} x {item.quantity || 0}</span>
                      <span className="font-medium">${total.toFixed(2)}</span>
                    </div>
                  );
                })}
                <div className="border-t border-blue-200 pt-2 mt-2 flex justify-between font-bold text-blue-800">
                  <span>Total</span>
                  <span>${items.reduce((sum, i) => sum + (parseFloat(i.price) || 0) * (parseInt(i.quantity) || 0), 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex gap-3 pt-4 mt-4 border-t border-gray-200">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl hover:bg-gray-50 font-medium text-sm transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2 font-medium text-sm transition-colors disabled:opacity-50">
              {loading ? <FiLoader className="animate-spin" size={16} /> : <FiPlus size={16} />}
              {loading ? 'Creating...' : `Create Order (${items.length} item${items.length > 1 ? 's' : ''})`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const OrderDetailModal = ({ order, onClose }) => {
  const [productsMap, setProductsMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const info = parseOrderInfo(order.orderNumber);

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
            map[item.key] = match || { name: item.sku, sku: item.sku, warehouseName: 'Unknown' };
          });

          setProductsMap(map);
        })
        .catch(() => setProductsMap({}))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [order]);

  const info = parseOrderInfo(order.orderNumber);

  const mainTotal = (parseFloat(info.qty) || 0) * (parseFloat(info.price) || 0);
  const extraTotal = info.extraItems.reduce((sum, ei) => {
    const qty = parseFloat(ei.qty) || 0;
    const price = parseFloat(ei.price) || 0;
    return sum + (qty * price);
  }, 0);
  const grandTotal = mainTotal + extraTotal;
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
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 rounded-t-2xl z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-800">{order.orderNumber.split('|')[0]}</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {new Date(order.orderDate).toLocaleDateString('en-US', {
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
          {/* Customer Card */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <FiShoppingCart size={14} className="text-blue-600" />
              </div>
              <p className="text-sm font-semibold text-gray-700">Customer Details</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">Name</p>
                <p className="text-sm font-medium text-gray-800">{info.customer}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">Phone</p>
                <p className="text-sm font-medium text-gray-800">{info.phone}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">Address</p>
                <p className="text-sm font-medium text-gray-800">{info.address}</p>
              </div>
            </div>
          </div>

          {/* Products Card */}
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
              {allItems.map((item, i) => {
                const itemTotal = (parseFloat(item.qty) || 0) * (parseFloat(item.price) || 0);
                return (
                  <div key={item.key} className="px-4 py-3 hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                          }`}>
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
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-800">${itemTotal.toFixed(2)}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {item.qty} × ${parseFloat(item.price).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Totals Footer */}
            <div className="bg-gray-50 border-t border-gray-200 px-4 py-3 space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal ({totalItems} items)</span>
                <span className="text-gray-700 font-medium">${grandTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Shipping</span>
                <span className="text-green-600 font-medium">Free</span>
              </div>
              <div className="flex justify-between text-base font-bold pt-1.5 border-t border-gray-200">
                <span className="text-gray-800">Total</span>
                <span className="text-blue-600">${grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* QR Code */}
          {order.barcodeImage && (
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
              <div className="flex flex-col items-center">
                <img
                  src={`data:image/png;base64,${order.barcodeImage}`}
                  alt="QR Code"
                  className="rounded-lg shadow-sm bg-white p-2"
                  style={{
                    width: '200px',
                    height: '200px',
                    imageRendering: 'pixelated',
                    objectFit: 'contain'
                  }}
                />
                <button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = `data:image/png;base64,${order.barcodeImage}`;
                    link.download = `Order-${order.orderNumber.split('|')[0]}.png`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    toast.success('QR downloaded!');
                  }}
                  className="mt-3 text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors font-medium"
                >
                  <FiDownload size={14} /> Download QR Code
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const parseOrderInfo = (orderNumber) => {
  const parts = orderNumber.split('|');
  const info = {
    orderNo: parts[0] || 'N/A',
    sku: 'N/A',
    qty: '0',
    price: '0',
    warehouseId: null,
    customer: 'Unknown',
    phone: 'N/A',
    address: 'N/A',
    extraItems: []
  };

  parts.forEach(part => {
    if (part.startsWith('SKU:')) info.sku = part.replace('SKU:', '');
    if (part.startsWith('QTY:')) info.qty = part.replace('QTY:', '');
    if (part.startsWith('PRICE:')) info.price = part.replace('PRICE:', '');
    if (part.startsWith('WH:')) info.warehouseId = part.replace('WH:', '');
    if (part.startsWith('CUST:')) info.customer = part.replace('CUST:', '');
    if (part.startsWith('PHONE:')) info.phone = part.replace('PHONE:', '');
    if (part.startsWith('ADDR:')) info.address = part.replace('ADDR:', '');
    if (part.startsWith('EXTRA:')) {
      // Format: EXTRA:SKU:M1:QTY:32:PRICE:2:WH:2
      const extraStr = part.replace('EXTRA:', '');
      const extraParts = extraStr.split(':');
      const extraItem = { sku: '', qty: '0', price: '0', warehouseId: null };

      for (let i = 0; i < extraParts.length; i++) {
        if (extraParts[i] === 'SKU' && extraParts[i + 1]) extraItem.sku = extraParts[i + 1];
        if (extraParts[i] === 'QTY' && extraParts[i + 1]) extraItem.qty = extraParts[i + 1];
        if (extraParts[i] === 'PRICE' && extraParts[i + 1]) extraItem.price = extraParts[i + 1];
        if (extraParts[i] === 'WH' && extraParts[i + 1]) extraItem.warehouseId = extraParts[i + 1];
      }

      if (extraItem.sku) info.extraItems.push(extraItem);
    }
  });

  return info;
};

const OrdersPage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/orders');
      setOrders(res.data.filter(o => o.orderNumber.startsWith('ORD-')));
    }
    catch { toast.error('Failed to load orders'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (orderNumber, newStatus) => {
    if (user?.role === 'MANAGER') {
      const confirm = window.confirm(`Are you sure you want to ${newStatus.toLowerCase()} this order?`);
      if (!confirm) return;
    }
    try {
      await api.get(`/orders/${orderNumber}/status`, { params: { newStatus } });
      toast.success(`Order ${newStatus}`);
      setOrders(prev => {
        const updated = prev.find(o => o.orderNumber === orderNumber);
        const rest = prev.filter(o => o.orderNumber !== orderNumber);
        return [{ ...updated, status: newStatus }, ...rest];
      });
    } catch (err) {
      toast.error('Failed to update order');
    }
  };

  const filteredOrders = filterStatus === 'ALL'
    ? orders
    : orders.filter(o => o.status === filterStatus);

  const counts = {
    ALL: orders.length,
    PENDING: orders.filter(o => o.status === 'PENDING').length,
    PICKING: orders.filter(o => o.status === 'PICKING').length,
    PACKED: orders.filter(o => o.status === 'PACKED').length,
    SHIPPED: orders.filter(o => o.status === 'SHIPPED').length
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
          <h1 className="text-2xl font-bold text-gray-800">Orders</h1>
          <p className="text-gray-500 text-sm mt-1">Manage and track all customer orders</p>
        </div>
        {user?.role !== 'OPERATOR' && (
          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl transition-colors shadow-sm"
          >
            <FiPlus size={18} /> New Order
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'All Orders', count: counts.ALL, color: 'bg-gray-600', icon: <FiShoppingCart size={18} /> },
          { label: 'Pending', count: counts.PENDING, color: 'bg-gray-400', icon: <FiClock size={18} /> },
          { label: 'Picking', count: counts.PICKING, color: 'bg-blue-500', icon: <FiPackage size={18} /> },
          { label: 'Packed', count: counts.PACKED, color: 'bg-amber-500', icon: <FiPackage size={18} /> },
          { label: 'Shipped', count: counts.SHIPPED, color: 'bg-green-500', icon: <FiTruck size={18} /> },
        ].map(stat => (
          <div
            key={stat.label}
            onClick={() => setFilterStatus(stat.label === 'All Orders' ? 'ALL' : stat.label.toUpperCase())}
            className={`bg-white rounded-xl p-4 border cursor-pointer transition-all hover:shadow-md ${filterStatus === (stat.label === 'All Orders' ? 'ALL' : stat.label.toUpperCase())
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

      {/* Orders List */}
      <div className="space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border">
            <FiShoppingCart size={48} className="mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500 font-medium">No orders found</p>
            <p className="text-gray-400 text-sm mt-1">
              {filterStatus === 'ALL'
                ? 'Create your first order to get started'
                : `No orders with status "${filterStatus}"`}
            </p>
          </div>
        ) : (
          filteredOrders.map(order => {
            const config = statusConfig[order.status] || statusConfig['PENDING'];
            const info = parseOrderInfo(order.orderNumber);
            const totalItems = (parseInt(info.qty) || 0) + info.extraItems.reduce((sum, ei) => sum + (parseInt(ei.qty) || 0), 0);
            const orderTotal = (parseFloat(info.qty) * parseFloat(info.price)) +
              info.extraItems.reduce((sum, ei) => sum + (parseFloat(ei.qty) || 0) * (parseFloat(ei.price) || 0), 0);

            return (
              <div key={order.id} className="bg-white rounded-2xl border border-gray-200 hover:shadow-md transition-all overflow-hidden">
                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    {/* Left: Order Info */}
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white shadow-sm">
                        <FiShoppingCart size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-gray-800">{order.orderNumber.split('|')[0]}</p>
                          <span className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${config.color}`}>
                            {config.icon}{config.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 text-sm text-gray-500">
                          <span>{info.customer}</span>
                          <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                          <span>{totalItems} items</span>
                          <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                          <span>{new Date(order.orderDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Price & Actions */}
                    <div className="flex items-center gap-4">
                      <p className="font-bold text-lg text-gray-800">${orderTotal.toFixed(2)}</p>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <FiEye size={18} />
                        </button>

                        {order.status === 'PENDING' && (
                          <button
                            onClick={() => updateStatus(order.orderNumber, 'PICKING')}
                            className="text-sm text-white px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors font-medium"
                          >
                            Start Picking
                          </button>
                        )}
                        {order.status === 'PICKING' && (
                          <button
                            onClick={() => updateStatus(order.orderNumber, 'PACKED')}
                            className="text-sm text-white px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 transition-colors font-medium"
                          >
                            Mark Packed
                          </button>
                        )}
                        {order.status === 'PACKED' && (
                          <button
                            onClick={() => updateStatus(order.orderNumber, 'SHIPPED')}
                            className="text-sm text-white px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 transition-colors font-medium"
                          >
                            Mark Shipped
                          </button>
                        )}
                        {order.status === 'SHIPPED' && (
                          <div className="flex items-center gap-1 text-green-600 bg-green-50 px-3 py-2 rounded-lg text-sm font-medium">
                            <FiCheck size={16} /> Completed
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between text-xs text-gray-400 mb-1.5 px-1">
                      <span>Pending</span>
                      <span>Picking</span>
                      <span>Packed</span>
                      <span>Shipped</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${order.status === 'PENDING' ? 'w-1/4 bg-gray-400' :
                          order.status === 'PICKING' ? 'w-2/4 bg-blue-500' :
                            order.status === 'PACKED' ? 'w-3/4 bg-amber-500' :
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

      {showNewModal && <NewOrderModal onClose={() => setShowNewModal(false)} onAdd={fetchOrders} />}
      {selectedOrder && <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />}
    </div>
  );
};

export default OrdersPage;