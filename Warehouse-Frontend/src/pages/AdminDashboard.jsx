import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import toast from 'react-hot-toast';
import { FiHome, FiGrid, FiLayers, FiBox, FiPlus } from 'react-icons/fi';

const AdminDashboard = ({ tab: propTab }) => {
  const [activeTab, setActiveTab] = useState(propTab || 'overview');
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({ warehouses: 0, products: 0, lowStock: 0 });

  const [whCode, setWhCode] = useState('');
  const [whName, setWhName] = useState('');
  const [whAddress, setWhAddress] = useState('');

  const [zoneCode, setZoneCode] = useState('');
  const [zoneType, setZoneType] = useState('STORAGE');
  const [zoneWarehouseId, setZoneWarehouseId] = useState('');

  const [aisleCode, setAisleCode] = useState('');
  const [aisleZoneId, setAisleZoneId] = useState('');

  const [binCode, setBinCode] = useState('');
  const [binCapacity, setBinCapacity] = useState('');
  const [binAisleId, setBinAisleId] = useState('');

  useEffect(() => {
    if (propTab) setActiveTab(propTab);
  }, [propTab]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [whRes, prodRes] = await Promise.all([
        api.get('/warehouse'),
        api.get('/inventory')
      ]);
      setWarehouses(whRes.data);
      setProducts(prodRes.data);
      setStats({
        warehouses: whRes.data.length,
        products: prodRes.data.length,
        lowStock: prodRes.data.filter(p => p.quantity < 10).length,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const addWarehouse = async (e) => {
    e.preventDefault();
    try {
      await api.get('/warehouse/create', { params: { code: whCode, name: whName, address: whAddress } });
      toast.success('Warehouse added!');
      setWhCode(''); setWhName(''); setWhAddress('');
      fetchData();
    } catch (err) { toast.error('Failed'); }
  };

  const addZone = async (e) => {
    e.preventDefault();
    try {
      await api.get('/warehouse/zone/create', { params: { code: zoneCode, type: zoneType, warehouseId: zoneWarehouseId } });
      toast.success('Zone added!');
      setZoneCode(''); setZoneWarehouseId('');
    } catch (err) { toast.error('Failed'); }
  };

  const addAisle = async (e) => {
    e.preventDefault();
    try {
      await api.get('/warehouse/aisle/create', { params: { code: aisleCode, zoneId: aisleZoneId } });
      toast.success('Aisle added!');
      setAisleCode(''); setAisleZoneId('');
    } catch (err) { toast.error('Failed'); }
  };

  const addBin = async (e) => {
    e.preventDefault();
    try {
      await api.get('/warehouse/bin/create', { params: { code: binCode, capacity: binCapacity, aisleId: binAisleId } });
      toast.success('Bin added!');
      setBinCode(''); setBinCapacity(''); setBinAisleId('');
    } catch (err) { toast.error('Failed'); }
  };

  const tabs = [
    { id: 'overview', label: 'Dashboard', icon: <FiHome /> },
    { id: 'warehouse', label: 'Add Warehouse', icon: <FiHome /> },
    { id: 'zone', label: 'Add Zone', icon: <FiGrid /> },
    { id: 'aisle', label: 'Add Aisle', icon: <FiLayers /> },
    { id: 'bin', label: 'Add Bin', icon: <FiBox /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">🛠️ Admin Dashboard</h1>

        <div className="flex gap-2 mb-8 flex-wrap">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all text-sm
                ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg' : 'bg-white/10 text-blue-200 hover:bg-white/20'}`}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div>
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
                <div className="text-4xl mb-2">🏭</div>
                <h3 className="text-3xl font-bold text-white">{stats.warehouses}</h3>
                <p className="text-blue-200 text-sm">Warehouses</p>
              </div>
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
                <div className="text-4xl mb-2">📦</div>
                <h3 className="text-3xl font-bold text-white">{stats.products}</h3>
                <p className="text-blue-200 text-sm">Products</p>
              </div>
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
                <div className="text-4xl mb-2">⚠️</div>
                <h3 className="text-3xl font-bold text-red-400">{stats.lowStock}</h3>
                <p className="text-blue-200 text-sm">Low Stock</p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">🏭 Warehouses</h2>
              <table className="w-full text-left">
                <thead>
                  <tr className="text-blue-200 text-sm border-b border-white/10">
                    <th className="py-3">Code</th><th className="py-3">Name</th><th className="py-3">Address</th>
                  </tr>
                </thead>
                <tbody>
                  {warehouses.map(wh => (
                    <tr key={wh.id} className="text-white border-b border-white/5">
                      <td className="py-3 font-bold">{wh.warehouseCode}</td>
                      <td className="py-3">{wh.name}</td>
                      <td className="py-3 text-blue-200">{wh.address}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'warehouse' && (
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 max-w-lg">
            <h2 className="text-2xl font-bold text-white mb-6">➕ Add Warehouse</h2>
            <form onSubmit={addWarehouse} className="space-y-4">
              <input type="text" placeholder="Code (WH-001)" value={whCode} onChange={e => setWhCode(e.target.value)}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300/50 focus:outline-none focus:border-blue-400" required />
              <input type="text" placeholder="Name" value={whName} onChange={e => setWhName(e.target.value)}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300/50 focus:outline-none focus:border-blue-400" required />
              <input type="text" placeholder="Address" value={whAddress} onChange={e => setWhAddress(e.target.value)}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300/50 focus:outline-none focus:border-blue-400" required />
              <button type="submit" className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl"><FiPlus className="inline mr-2" />Add Warehouse</button>
            </form>
          </div>
        )}

        {activeTab === 'zone' && (
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 max-w-lg">
            <h2 className="text-2xl font-bold text-white mb-6">➕ Add Zone</h2>
            <form onSubmit={addZone} className="space-y-4">
              <input type="text" placeholder="Zone Code (ZONE-A)" value={zoneCode} onChange={e => setZoneCode(e.target.value)}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300/50 focus:outline-none focus:border-blue-400" required />
              <select value={zoneType} onChange={e => setZoneType(e.target.value)}
                className="w-full p-3 bg-slate-800 border border-white/20 rounded-xl text-white">
                <option value="STORAGE">Storage</option>
                <option value="RECEIVING">Receiving</option>
                <option value="SHIPPING">Shipping</option>
              </select>
              <input type="number" placeholder="Warehouse ID" value={zoneWarehouseId} onChange={e => setZoneWarehouseId(e.target.value)}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300/50 focus:outline-none focus:border-blue-400" required />
              <button type="submit" className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl"><FiPlus className="inline mr-2" />Add Zone</button>
            </form>
          </div>
        )}

        {activeTab === 'aisle' && (
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 max-w-lg">
            <h2 className="text-2xl font-bold text-white mb-6">➕ Add Aisle</h2>
            <form onSubmit={addAisle} className="space-y-4">
              <input type="text" placeholder="Aisle Code (AISLE-01)" value={aisleCode} onChange={e => setAisleCode(e.target.value)}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300/50 focus:outline-none focus:border-blue-400" required />
              <input type="number" placeholder="Zone ID" value={aisleZoneId} onChange={e => setAisleZoneId(e.target.value)}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300/50 focus:outline-none focus:border-blue-400" required />
              <button type="submit" className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl"><FiPlus className="inline mr-2" />Add Aisle</button>
            </form>
          </div>
        )}

        {activeTab === 'bin' && (
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 max-w-lg">
            <h2 className="text-2xl font-bold text-white mb-6">➕ Add Bin</h2>
            <form onSubmit={addBin} className="space-y-4">
              <input type="text" placeholder="Bin Code (BIN-001)" value={binCode} onChange={e => setBinCode(e.target.value)}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300/50 focus:outline-none focus:border-blue-400" required />
              <input type="number" placeholder="Capacity" value={binCapacity} onChange={e => setBinCapacity(e.target.value)}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300/50 focus:outline-none focus:border-blue-400" required />
              <input type="number" placeholder="Aisle ID" value={binAisleId} onChange={e => setBinAisleId(e.target.value)}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300/50 focus:outline-none focus:border-blue-400" required />
              <button type="submit" className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl"><FiPlus className="inline mr-2" />Add Bin</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
  <h2></h2>
};

export default AdminDashboard;