import React, { useState, useEffect, useRef } from 'react';
import api from '../api/axiosConfig';
import toast from 'react-hot-toast';
import { FiCamera, FiPackage, FiTruck, FiSearch, FiMapPin } from 'react-icons/fi';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';

const OperatorDashboard = () => {
  const [activeTab, setActiveTab] = useState('scan');
  const [scanInput, setScanInput] = useState('');
  const [product, setProduct] = useState(null);
  const [order, setOrder] = useState(null);

  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [barcodeField, setBarcodeField] = useState('');
  const [binCode, setBinCode] = useState('');
  const [quantity, setQuantity] = useState('');

  const [orderNumber, setOrderNumber] = useState('');
  const [pendingOrders, setPendingOrders] = useState([]);
  const [scanningReceive, setScanningReceive] = useState(false);

  const receiveScannerRef = useRef(null);

  // ========== FETCH PENDING ORDERS FOR PICK TAB ==========
  const fetchPendingOrders = async () => {
    try {
      const res = await api.get('/orders');
      const pickable = res.data.filter(
        o => o.status === 'PENDING' || o.status === 'PICKING'
      );
      setPendingOrders(pickable);
    } catch (err) {
      toast.error('Failed to load orders');
    }
  };

  useEffect(() => {
    if (activeTab === 'pick') {
      fetchPendingOrders();
    }
    // Stop receive scanner when leaving receive tab
    if (activeTab !== 'receive' && receiveScannerRef.current) {
      receiveScannerRef.current.stop().catch(console.error);
      receiveScannerRef.current = null;
      setScanningReceive(false);
    }
  }, [activeTab]);

  // ========== CAMERA SCANNER (SCAN TAB) ==========
  useEffect(() => {
    let scanner;
    if (activeTab === 'scan') {
      const timeout = setTimeout(() => {
        scanner = new Html5QrcodeScanner(
          'reader',
          {
            fps: 10,
            qrbox: { width: 250, height: 150 },
            rememberLastUsedCamera: true,
          },
          false
        );
        scanner.render(onScanSuccess, onScanError);
      }, 500);
      return () => {
        clearTimeout(timeout);
        if (scanner) {
          scanner.clear().catch(console.error);
        }
      };
    }
  }, [activeTab]);

  const onScanSuccess = (decodedText) => {
    setScanInput(decodedText);
    handleScan(decodedText);
  };

  const onScanError = (err) => {
    // ignore
  };

  // ========== SCAN PRODUCT (manual or camera) ==========
  const handleScan = async (value) => {
    const searchTerm = value || scanInput;
    if (!searchTerm) return;
    try {
      const res = await api.get(`/inventory/${searchTerm}`);
      setProduct(res.data);
      toast.success('Item found!');
    } catch (err) {
      try {
        const res = await api.get(`/inventory/barcode/${searchTerm}`);
        setProduct(res.data);
        toast.success('Item found by barcode!');
      } catch (err2) {
        toast.error('Item not found');
        setProduct(null);
      }
    }
  };

  // ========== RECEIVE TAB SCANNER ==========
  const startReceiveScanner = async () => {
    try {
      const devices = await Html5Qrcode.getCameras();
      if (devices && devices.length) {
        const cameraId = devices[0].id; // Use first camera
        const html5QrCode = new Html5Qrcode('receive-reader');
        receiveScannerRef.current = html5QrCode;
        setScanningReceive(true);
        await html5QrCode.start(
          cameraId,
          { fps: 10, qrbox: { width: 250, height: 150 } },
          (decodedText) => {
            // On successful scan, fill the form
            setSku(decodedText);
            setBarcodeField(decodedText);
            toast.success(`Scanned: ${decodedText}`);
            // Stop scanner after successful scan
            html5QrCode.stop().catch(console.error);
            receiveScannerRef.current = null;
            setScanningReceive(false);
          },
          (errorMessage) => {
            // ignore scan errors
          }
        );
      } else {
        toast.error('No camera found');
      }
    } catch (err) {
      toast.error('Failed to start camera');
    }
  };

  // ========== RECEIVE PRODUCT ==========
  const handleReceive = async (e) => {
    e.preventDefault();
    try {
      await api.get('/inventory/receive', {
        params: { sku, name, barcode: barcodeField, binCode, quantity: parseInt(quantity) },
      });
      toast.success('Item received and putaway to bin!');
      setSku('');
      setName('');
      setBarcodeField('');
      setBinCode('');
      setQuantity('');
    } catch (err) {
      toast.error('Failed to receive item');
    }
  };

  // ========== PICK ORDER ==========
  const handleUpdateStatus = async (newStatus) => {
    if (!order) return;
    try {
      await api.get(`/orders/${order.orderNumber}/status`, {
        params: { newStatus },
      });
      toast.success(`Order updated to ${newStatus}`);
      setOrder({ ...order, status: newStatus });
      fetchPendingOrders();
    } catch (err) {
      toast.error('Failed to update order');
    }
  };

  const tabs = [
    { id: 'scan', label: '📷 Scan Item', icon: <FiCamera /> },
    { id: 'receive', label: '📥 Receive & Putaway', icon: <FiPackage /> },
    { id: 'pick', label: '📦 Pick & Ship', icon: <FiTruck /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">🚚 Operator Console</h1>
        <p className="text-blue-200 text-sm mb-8">
          Scan barcodes, receive items, and pick orders for shipping
        </p>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setProduct(null);
                setOrder(null);
              }}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all text-sm
                ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg' : 'bg-white/10 text-blue-200 hover:bg-white/20'}`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* ========== SCAN TAB ========== */}
        {activeTab === 'scan' && (
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 text-center">
            <FiCamera className="text-blue-300 mx-auto mb-4" size={50} />
            <h2 className="text-xl font-bold text-white mb-2">Scan Barcode or SKU</h2>
            <p className="text-blue-200 text-sm mb-4">
              Position barcode in front of camera or type manually
            </p>

            <div id="reader" style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}></div>

            <div className="mt-4 flex gap-2">
              <input
                type="text"
                placeholder="Or type SKU/Barcode..."
                value={scanInput}
                onChange={(e) => setScanInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleScan()}
                className="flex-1 p-4 bg-white/10 border border-white/20 rounded-xl text-white text-lg placeholder-blue-300/50 focus:outline-none"
              />
              <button
                onClick={() => handleScan()}
                className="px-6 py-4 bg-blue-600 text-white rounded-xl font-bold"
              >
                <FiSearch size={20} />
              </button>
            </div>

            {product && (
              <div className="mt-6 p-6 bg-white/5 rounded-xl border border-white/10 text-left">
                <h3 className="text-white font-bold text-lg mb-3">{product.name}</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <p className="text-blue-200">
                    SKU: <span className="text-white font-bold">{product.sku}</span>
                  </p>
                  <p className="text-blue-200">
                    Barcode: <span className="text-white">{product.barcode || 'N/A'}</span>
                  </p>
                  <p className="text-blue-200">
                    Quantity:{' '}
                    <span className={product.quantity < 10 ? 'text-red-400 font-bold' : 'text-green-400 font-bold'}>
                      {product.quantity}
                    </span>
                  </p>
                  <p className="text-blue-200">
                    Location:{' '}
                    <span className="text-white font-bold">
                      {product.bin?.binCode || 'Not assigned'}
                    </span>
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========== RECEIVE TAB ========== */}
        {activeTab === 'receive' && (
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8">
            <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <FiPackage /> Receive & Putaway
            </h2>
            <p className="text-blue-200 text-sm mb-6">Scan incoming items and assign to storage bin</p>

            {/* Scanner area for Receive */}
            <div className="mb-4 text-center">
              <button
                type="button"
                onClick={startReceiveScanner}
                disabled={scanningReceive}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-xl transition-colors mx-auto"
              >
                <FiCamera size={18} />
                {scanningReceive ? 'Scanning...' : 'Scan Barcode'}
              </button>
              <div id="receive-reader" className="mt-3" style={{ width: '100%', maxWidth: '300px', margin: '0 auto' }}></div>
            </div>

            <form onSubmit={handleReceive} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="SKU *"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300/50 focus:outline-none"
                  required
                />
                <input
                  type="text"
                  placeholder="Barcode *"
                  value={barcodeField}
                  onChange={(e) => setBarcodeField(e.target.value)}
                  className="p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300/50 focus:outline-none"
                  required
                />
              </div>
              <input
                type="text"
                placeholder="Product Name *"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300/50 focus:outline-none"
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <FiMapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300" />
                  <input
                    type="text"
                    placeholder="Bin Code (BIN-001) *"
                    value={binCode}
                    onChange={(e) => setBinCode(e.target.value)}
                    className="w-full pl-10 p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300/50 focus:outline-none"
                    required
                  />
                </div>
                <input
                  type="number"
                  placeholder="Quantity *"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300/50 focus:outline-none"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-green-600 text-white font-bold rounded-xl text-lg"
              >
                📥 Receive & Putaway to Bin
              </button>
            </form>
          </div>
        )}

        {/* ========== PICK TAB ========== */}
        {activeTab === 'pick' && (
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8">
            <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <FiTruck /> Pick for Shipping
            </h2>
            <p className="text-blue-200 text-sm mb-6">Select an order to pick and update status</p>

            {pendingOrders.length === 0 ? (
              <p className="text-center text-blue-200 py-8">No orders waiting to be picked</p>
            ) : (
              <div className="space-y-3 mb-6">
                {pendingOrders.map((o) => (
                  <div
                    key={o.id}
                    onClick={() => {
                      setOrder(o);
                      setOrderNumber(o.orderNumber);
                    }}
                    className={`p-4 rounded-xl cursor-pointer transition-all ${
                      o.orderNumber === orderNumber
                        ? 'bg-blue-600 border border-blue-400'
                        : 'bg-white/5 border border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-white font-bold">{o.orderNumber}</p>
                        <p className="text-blue-200 text-sm">{o.orderDate}</p>
                      </div>
                      <span
                        className={`text-xs px-3 py-1 rounded-full ${
                          o.status === 'PENDING' ? 'bg-gray-500 text-white' : 'bg-blue-500 text-white'
                        }`}
                      >
                        {o.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {order && (
              <div className="p-6 bg-white/5 rounded-xl border border-white/10">
                <h3 className="text-white font-bold text-lg mb-2">Order: {order.orderNumber}</h3>
                <p className="text-blue-200 mb-4">
                  Status:{' '}
                  <span className={`font-bold ${order.status === 'SHIPPED' ? 'text-green-400' : 'text-yellow-400'}`}>
                    {order.status}
                  </span>
                </p>

                {order.barcodeImage && (
                  <div className="flex justify-center mb-4 p-3 bg-white rounded-xl">
                    <img
                      src={`data:image/png;base64,${order.barcodeImage}`}
                      alt="Order QR"
                      className="w-40 h-40"
                    />
                  </div>
                )}

                <div className="flex gap-2">
                  {order.status === 'PENDING' && (
                    <button
                      onClick={() => handleUpdateStatus('PICKING')}
                      className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold"
                    >
                      Start Picking
                    </button>
                  )}
                  {order.status === 'PICKING' && (
                    <button
                      onClick={() => handleUpdateStatus('PACKED')}
                      className="flex-1 py-2 bg-purple-600 text-white rounded-lg text-sm font-bold"
                    >
                      Mark Packed
                    </button>
                  )}
                  {order.status === 'PACKED' && (
                    <button
                      onClick={() => handleUpdateStatus('SHIPPED')}
                      className="flex-1 py-2 bg-green-600 text-white rounded-lg text-sm font-bold"
                    >
                      🚀 Ship Order
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Bottom Tip */}
        <div className="mt-8 p-4 bg-white/5 rounded-xl border border-white/10 text-center">
          <p className="text-blue-200 text-xs">
            💡 <strong>Tip:</strong> Use camera to scan barcodes. Orders in "Pick & Ship" load automatically.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OperatorDashboard;