import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import toast from 'react-hot-toast';
import { FiCamera, FiSearch, FiMapPin, FiBox, FiAlertCircle } from 'react-icons/fi';
import { Html5QrcodeScanner } from 'html5-qrcode';

const ScanItem = () => {
  const [scanInput, setScanInput] = useState('');
  const [product, setProduct] = useState(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const scanner = new Html5QrcodeScanner('reader', {
        fps: 10, qrbox: { width: 250, height: 150 }, rememberLastUsedCamera: true,
      }, false);
      scanner.render(onScanSuccess, onScanError);
      return () => scanner.clear().catch(() => {});
    }, 500);
    return () => clearTimeout(timeout);
  }, []);

  const onScanSuccess = (decodedText) => {
    try {
      const parsed = JSON.parse(decodedText);
      if (parsed.sku) {
        setScanInput(parsed.sku);  // Show SKU in input, not raw JSON
        handleScan(parsed.sku);
        return;
      }
    } catch {}
    // Otherwise use the raw text
    setScanInput(decodedText);
    handleScan(decodedText);
};

  const onScanError = () => {};

  const handleScan = async (value) => {
    const searchTerm = value || scanInput;
    if (!searchTerm) return;
    try {
      const res = await api.get(`/inventory/${searchTerm}`);
      setProduct(res.data);
      toast.success('Item found!');
    } catch {
      try {
        const res = await api.get(`/inventory/barcode/${searchTerm}`);
        setProduct(res.data);
        toast.success('Item found by barcode!');
      } catch {
        toast.error('Item not found');
        setProduct(null);
      }
    }
};

  const isLowStock = product?.quantity < 30;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <FiCamera size={20} /> Scan Product
        </h2>
        <p className="text-blue-100 text-xs mt-1">Scan barcode or type SKU to find item location</p>
      </div>

      <div className="p-6">
        {/* Scanner */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left: Camera */}
          <div className="flex-1">
            <div id="reader" style={{ width: '100%', maxWidth: '350px', margin: '0 auto' }}></div>
          </div>

          {/* Right: Manual Input + Result */}
          <div className="flex-1 space-y-4">
            {/* Manual Input */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Manual Search</label>
              <div className="flex gap-2">
                <input type="text" placeholder="Type SKU or Barcode..." value={scanInput}
                  onChange={(e) => setScanInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleScan()}
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <button onClick={() => handleScan()} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg transition-colors">
                  <FiSearch size={18} />
                </button>
              </div>
            </div>

            {/* Product Result */}
            {product && (
              <div className={`border rounded-xl p-4 ${isLowStock ? 'border-amber-200 bg-amber-50' : 'border-green-200 bg-green-50'}`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-gray-800 text-base">{product.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    isLowStock ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {isLowStock ? 'Low Stock' : 'In Stock'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <FiBox className="text-gray-400" size={14} />
                    <div>
                      <p className="text-xs text-gray-500">SKU</p>
                      <p className="font-semibold text-gray-800">{product.sku}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiAlertCircle className={`${isLowStock ? 'text-amber-500' : 'text-green-500'}`} size={14} />
                    <div>
                      <p className="text-xs text-gray-500">Quantity</p>
                      <p className={`font-bold ${isLowStock ? 'text-amber-600' : 'text-green-600'}`}>
                        {product.quantity} units
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-start gap-2">
                    <FiMapPin className="text-purple-500 mt-0.5" size={14} />
                    <div>
                      <p className="text-xs text-gray-500">Location</p>
                      <p className="font-semibold text-purple-700 text-sm">
                        {product.location || product.binCode || 'Not assigned'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!product && (
              <div className="text-center py-8 text-gray-400">
                <FiSearch size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">Scan or search for a product</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScanItem;