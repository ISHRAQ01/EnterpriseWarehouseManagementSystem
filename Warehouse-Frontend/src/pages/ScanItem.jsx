import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import toast from 'react-hot-toast';
import {
  FiCamera, FiSearch, FiMapPin, FiBox, FiAlertTriangle,
  FiShoppingCart, FiTruck, FiRefreshCw, FiZap, FiUser, FiPhone,
  FiHome, FiDollarSign, FiPackage, FiHash
} from 'react-icons/fi';
import { Html5QrcodeScanner } from 'html5-qrcode';

const ScanItem = () => {
  const [scanInput, setScanInput] = useState('');
  const [products, setProducts] = useState([]);
  const [resultType, setResultType] = useState(null);
  const [orderData, setOrderData] = useState(null);
  const [shipmentData, setShipmentData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const scanner = new Html5QrcodeScanner('reader', {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        rememberLastUsedCamera: true,
      }, false);
      scanner.render(onScanSuccess, onScanError);
      return () => scanner.clear().catch(() => {});
    }, 500);
    return () => clearTimeout(timeout);
  }, []);

  const onScanSuccess = (decodedText) => {
    if (decodedText.startsWith('ORD-')) {
      setScanInput(decodedText.split('|')[0]);
      handleOrderScan(decodedText);
      return;
    }
    if (decodedText.startsWith('SHP-')) {
      setScanInput(decodedText.split('|')[0]);
      handleShipmentScan(decodedText);
      return;
    }
    try {
      const parsed = JSON.parse(decodedText);
      if (parsed.sku) {
        setScanInput(parsed.sku);
        handleScan(parsed.sku);
        return;
      }
    } catch {}
    setScanInput(decodedText);
    handleScan(decodedText);
  };

  const onScanError = () => {};

  const handleScan = async (value) => {
    const searchTerm = value || scanInput;
    if (!searchTerm) return;
    try {
      const res = await api.get(`/inventory/all/${searchTerm}`);
      if (res.data.length === 0) {
        toast.error('Item not found');
        setProducts([]);
        setError('Product not found');
      } else {
        setProducts(res.data);
        setResultType('product');
        setOrderData(null);
        setShipmentData(null);
        setError(null);
        toast.success(`${res.data.length} location(s) found!`);
      }
    } catch {
      toast.error('Item not found');
      setError('Search failed');
    }
  };

  const handleOrderScan = async (decodedText) => {
    const parts = decodedText.split('|');
    const sku = parts.find(p => p.startsWith('SKU:'))?.replace('SKU:', '') || 'N/A';
    const qty = parts.find(p => p.startsWith('QTY:'))?.replace('QTY:', '') || '0';
    const price = parts.find(p => p.startsWith('PRICE:'))?.replace('PRICE:', '') || '0';
    const cust = parts.find(p => p.startsWith('CUST:'))?.replace('CUST:', '') || 'N/A';
    const phone = parts.find(p => p.startsWith('PHONE:'))?.replace('PHONE:', '') || 'N/A';
    const addr = parts.find(p => p.startsWith('ADDR:'))?.replace('ADDR:', '') || 'N/A';

    const extraItems = [];
    parts.forEach(part => {
      if (part.startsWith('EXTRA:')) {
        const content = part.replace('EXTRA:', '');
        const tokens = content.split(':');
        const extraItem = { sku: '', qty: '0', price: '0', warehouseId: null };
        for (let i = 0; i < tokens.length; i++) {
          if (tokens[i] === 'SKU' && tokens[i + 1]) extraItem.sku = tokens[i + 1];
          if (tokens[i] === 'QTY' && tokens[i + 1]) extraItem.qty = tokens[i + 1];
          if (tokens[i] === 'PRICE' && tokens[i + 1]) extraItem.price = tokens[i + 1];
          if (tokens[i] === 'WH' && tokens[i + 1]) extraItem.warehouseId = tokens[i + 1];
        }
        if (extraItem.sku) extraItems.push(extraItem);
      }
    });

    let allItems = [
      { sku, qty, price, warehouseId: parts.find(p => p.startsWith('WH:'))?.replace('WH:', '') || null, name: sku },
      ...extraItems.map(ei => ({ ...ei, name: ei.sku }))
    ];

    try {
      const res = await api.get('/inventory/with-warehouse');
      allItems = allItems.map(item => {
        const match = res.data.find(p =>
          p.sku === item.sku && (item.warehouseId ? String(p.warehouseId) === String(item.warehouseId) : true)
        );
        return { ...item, name: match?.name || item.sku, warehouseName: match?.warehouseName || '' };
      });
    } catch {}

    const total = allItems.reduce((sum, item) =>
      sum + (parseFloat(item.qty) || 0) * (parseFloat(item.price) || 0), 0
    );

    setOrderData({ orderNo: parts[0], customer: cust, phone, address: addr, items: allItems, total });
    setResultType('order');
    setProducts([]);
    setShipmentData(null);
    setError(null);
    toast.success('Order found!');
  };

  const handleShipmentScan = async (decodedText) => {
    const parts = decodedText.split('|');
    const supplier = parts.find(p => p.startsWith('SUP:'))?.replace('SUP:', '') || 'N/A';

    const mainItem = {
      sku: parts.find(p => p.startsWith('SKU:'))?.replace('SKU:', '') || 'N/A',
      qty: parts.find(p => p.startsWith('QTY:'))?.replace('QTY:', '') || '0',
      warehouseId: parts.find(p => p.startsWith('WH:'))?.replace('WH:', '') || null
    };

    const extraItems = [];
    parts.forEach(part => {
      if (part.startsWith('EXTRA:')) {
        const content = part.replace('EXTRA:', '');
        const tokens = content.split(':');
        const extraItem = { sku: '', qty: '0', warehouseId: null };
        for (let i = 0; i < tokens.length; i++) {
          if (tokens[i] === 'SKU' && tokens[i + 1]) extraItem.sku = tokens[i + 1];
          if (tokens[i] === 'QTY' && tokens[i + 1]) extraItem.qty = tokens[i + 1];
          if (tokens[i] === 'WH' && tokens[i + 1]) extraItem.warehouseId = tokens[i + 1];
        }
        if (extraItem.sku) extraItems.push(extraItem);
      }
    });

    const allItems = [mainItem, ...extraItems];
    let totalQty = 0;
    
    try {
      const res = await api.get('/inventory/with-warehouse');
      for (let item of allItems) {
        const match = res.data.find(p =>
          p.sku === item.sku && (item.warehouseId ? String(p.warehouseId) === String(item.warehouseId) : true)
        );
        item.name = match?.name || item.sku;
        item.warehouseName = match?.warehouseName || '';
        item.location = match?.location || '';
        item.binCode = match?.binCode || '';
        totalQty += parseInt(item.qty) || 0;
      }
    } catch {}

    setShipmentData({
      shipmentNo: parts[0],
      supplier,
      items: allItems,
      totalQty
    });
    setResultType('shipment');
    setProducts([]);
    setOrderData(null);
    setError(null);
    toast.success('Shipment found!');
  };

  const handleManualSearch = () => {
    if (!scanInput.trim()) return;
    setError(null);
    handleScan(scanInput.trim());
  };

  const resetAll = () => {
    setScanInput('');
    setProducts([]);
    setResultType(null);
    setOrderData(null);
    setShipmentData(null);
    setError(null);
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">QR Scanner</h1>
          <p className="text-gray-500 text-sm mt-1">Scan product, order & shipment QR codes instantly</p>
        </div>
        <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2 border border-gray-200 shadow-sm">
          <FiZap size={16} className="text-amber-500" />
          <span className="text-sm font-medium text-gray-600">Live Scanner</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Camera */}
        <div className="flex-1">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-all">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <FiCamera size={20} className="text-white" />
                </div>
                <div>
                  <span className="font-bold text-white text-lg">Camera Scanner</span>
                  <p className="text-blue-100 text-xs">Point camera at any QR code</p>
                </div>
              </div>
            </div>
            <div className="p-3">
              <div id="reader" style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}></div>
            </div>
          </div>
        </div>

        {/* Right: Results */}
        <div className="flex-1 space-y-4">
          {/* Search Bar */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              <FiSearch size={12} className="inline mr-1" /> Manual Search
            </label>
            <div className="flex gap-2">
              <input
                type="text" placeholder="Type SKU or scan QR..."
                value={scanInput}
                onChange={(e) => setScanInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleManualSearch()}
                className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <button onClick={handleManualSearch} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl transition-colors font-medium">
                <FiSearch size={18} />
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-center animate-fade-in">
              <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <FiAlertTriangle size={24} className="text-amber-500" />
              </div>
              <p className="text-amber-700 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Product Results */}
          {resultType === 'product' && products.length > 0 && (
            <div className="space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                  <FiBox size={14} /> {products.length} Location{products.length > 1 ? 's' : ''} Found
                </h3>
                <button onClick={resetAll} className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium transition-colors">
                  <FiRefreshCw size={12} /> Scan Another
                </button>
              </div>
              {products.map((product, i) => {
                const isLowStock = product.quantity < 30;
                return (
                  <div key={i} className={`border-2 rounded-2xl p-5 transition-all hover:shadow-md ${
                    isLowStock ? 'border-amber-200 bg-amber-50/50' : 'border-green-200 bg-green-50/50'
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          isLowStock ? 'bg-amber-100' : 'bg-green-100'
                        }`}>
                          <FiBox size={20} className={isLowStock ? 'text-amber-600' : 'text-green-600'} />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800 text-lg">{product.name}</h3>
                          <code className="text-xs bg-white px-2 py-0.5 rounded text-gray-500 font-mono">{product.sku}</code>
                        </div>
                      </div>
                      <span className={`text-xs px-3 py-1.5 rounded-full font-bold ${
                        isLowStock ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {product.quantity} units
                      </span>
                    </div>
                    <div className="flex items-start gap-2 bg-white/60 rounded-xl p-3">
                      <FiMapPin className="text-purple-500 mt-0.5" size={16} />
                      <div>
                        <span className="text-sm font-semibold text-purple-700">{product.location || product.binCode || 'Not assigned'}</span>
                        {product.warehouseName && (
                          <p className="text-xs text-gray-500 mt-0.5">📍 {product.warehouseName} • Bin: {product.binCode || 'N/A'}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Order Result */}
          {resultType === 'order' && orderData && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden animate-fade-in">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-5 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                      <FiShoppingCart size={24} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">{orderData.orderNo}</h2>
                      <p className="text-emerald-100 text-sm">Order Details</p>
                    </div>
                  </div>
                  <span className="text-2xl font-black">${orderData.total.toFixed(2)}</span>
                </div>
              </div>
              <div className="p-5 space-y-4">
                {/* Customer Info */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <FiUser size={18} className="text-gray-400 mx-auto mb-1" />
                    <p className="text-xs text-gray-400 uppercase">Customer</p>
                    <p className="text-sm font-bold text-gray-800 truncate">{orderData.customer}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <FiPhone size={18} className="text-gray-400 mx-auto mb-1" />
                    <p className="text-xs text-gray-400 uppercase">Phone</p>
                    <p className="text-sm font-bold text-gray-800">{orderData.phone}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <FiHome size={18} className="text-gray-400 mx-auto mb-1" />
                    <p className="text-xs text-gray-400 uppercase">Address</p>
                    <p className="text-sm font-medium text-gray-800 truncate">{orderData.address}</p>
                  </div>
                </div>

                {/* Items */}
                <div className="border-t pt-4">
                  <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <FiPackage size={14} /> Items ({orderData.items.length})
                  </p>
                  <div className="space-y-2">
                    {orderData.items.map((item, i) => (
                      <div key={i} className="flex items-center justify-between bg-gray-50 rounded-xl p-3 hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-xs font-bold text-blue-600">
                            {i + 1}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800">{item.name}</p>
                            <p className="text-xs text-gray-500">{item.sku} • {item.warehouseName}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-800">{item.qty} × ${item.price}</p>
                          <p className="text-xs text-emerald-600 font-medium">${(parseFloat(item.qty) * parseFloat(item.price)).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="bg-emerald-50 rounded-xl p-4 flex items-center justify-between">
                  <span className="text-sm font-semibold text-emerald-700">Grand Total</span>
                  <span className="text-xl font-black text-emerald-700">${orderData.total.toFixed(2)}</span>
                </div>

                <button onClick={resetAll} className="w-full flex items-center justify-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors py-2">
                  <FiRefreshCw size={14} /> Scan Another Code
                </button>
              </div>
            </div>
          )}

          {/* Shipment Result */}
          {resultType === 'shipment' && shipmentData && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden animate-fade-in">
              <div className="bg-gradient-to-r from-violet-500 to-purple-600 px-6 py-5 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                    <FiTruck size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{shipmentData.shipmentNo}</h2>
                    <p className="text-violet-100 text-sm">Shipment Details</p>
                  </div>
                </div>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Supplier</p>
                    <p className="text-sm font-bold text-gray-800">{shipmentData.supplier}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Quantity</p>
                    <p className="text-2xl font-black text-gray-800">{shipmentData.qty} <span className="text-sm font-normal text-gray-500">units</span></p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Product</p>
                  <p className="text-lg font-bold text-gray-800">{shipmentData.productName}</p>
                  <code className="text-sm text-gray-500 font-mono">{shipmentData.sku}</code>
                </div>

                {shipmentData.warehouseName && (
                  <div className="bg-violet-50 rounded-xl p-4">
                    <p className="text-xs text-violet-400 uppercase tracking-wider mb-1">Warehouse</p>
                    <p className="text-sm font-bold text-violet-700">{shipmentData.warehouseName}</p>
                  </div>
                )}

                {shipmentData.location && (
                  <div className="bg-purple-50 rounded-xl p-4 flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-200 rounded-lg flex items-center justify-center">
                      <FiMapPin size={16} className="text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-purple-400 uppercase tracking-wider mb-0.5">Location</p>
                      <p className="text-sm font-semibold text-purple-800">{shipmentData.location}</p>
                      {shipmentData.binCode && <p className="text-xs text-purple-500 mt-1">Bin: {shipmentData.binCode}</p>}
                    </div>
                  </div>
                )}

                <button onClick={resetAll} className="w-full flex items-center justify-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors py-2">
                  <FiRefreshCw size={14} /> Scan Another Code
                </button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!resultType && !error && (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
              <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <FiSearch size={36} className="text-gray-300" />
              </div>
              <p className="text-gray-600 font-medium text-lg">Ready to Scan</p>
              <p className="text-gray-400 text-sm mt-1">Point camera at a QR code or search manually</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScanItem;