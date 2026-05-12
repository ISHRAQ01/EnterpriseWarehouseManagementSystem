/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import toast from 'react-hot-toast';
import {
  FiDatabase, FiPlus, FiX, FiMapPin, FiPackage,
  FiGrid, FiLoader, FiChevronDown,
  FiChevronRight, FiTrash2, FiEdit
} from 'react-icons/fi';

// ===================== Capacity Bar =====================
const CapacityBar = ({ used, total }) => {
  const percent = total > 0 ? Math.round((used / total) * 100) : 0;
  const color = percent >= 90 ? 'bg-red-500' : percent >= 70 ? 'bg-amber-500' : 'bg-green-500';
  return (
    <div>
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>{used} / {total} bins used</span>
        <span>{percent}%</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div className={`h-2 rounded-full transition-all ${color}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
};

// ===================== Warehouse Modal =====================
const NewWarehouseModal = ({ onClose, onAdd }) => {
  const [form, setForm] = useState({ name: '', location: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.location) { toast.error('Name and location are required'); return; }
    setLoading(true);
    try {
      const code = 'WH-' + form.name.substring(0, 3).toUpperCase() + '-' + Date.now().toString().slice(-4);
      await api.get('/warehouse/create', { params: { code, name: form.name, address: form.location } });
      toast.success('Warehouse created!');
      onAdd(); onClose();
    } catch { toast.error('Failed to create warehouse'); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Add New Warehouse</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><FiX size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input placeholder="Warehouse Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          <input placeholder="Location (City, State)" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white py-3 rounded-xl flex items-center justify-center gap-2">
              {loading ? <FiLoader className="animate-spin" /> : null} Add Warehouse
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ===================== Edit Warehouse Modal =====================
const EditWarehouseModal = ({ warehouse, onClose, onSave }) => {
  const [form, setForm] = useState({ name: warehouse.name, address: warehouse.address || warehouse.location || '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/warehouse/${warehouse.id}`, null, { params: { name: form.name, address: form.address } });
      toast.success('Warehouse updated!');
      onSave(); onClose();
    } catch { toast.error('Failed to update warehouse'); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Edit Warehouse</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><FiX size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input placeholder="Warehouse Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          <input placeholder="Location" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white py-3 rounded-xl flex items-center justify-center gap-2">
              {loading ? <FiLoader className="animate-spin" /> : null} Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ===================== Zone Detail Modal =====================
const ZoneDetailModal = ({ warehouse, onClose, onRefresh }) => {
  const [detail, setDetail] = useState(null);
  const [expandedZones, setExpandedZones] = useState({});
  const [showAddZoneForm, setShowAddZoneForm] = useState(false);
  const [newZoneCode, setNewZoneCode] = useState('');
  const [newZoneType, setNewZoneType] = useState('');
  const [newAislesCount, setNewAislesCount] = useState('');
  const [newBinsPerAisle, setNewBinsPerAisle] = useState('');
  const [occupancy, setOccupancy] = useState({});

  useEffect(() => {
    api.get(`/warehouse/${warehouse.id}`)
      .then(res => { setDetail(res.data); return api.get(`/warehouse/${warehouse.id}/occupancy`); })
      .then(res => setOccupancy(res.data))
      .catch(() => toast.error('Failed to load'));
  }, [warehouse.id]);

  const refresh = async () => {
    const res = await api.get(`/warehouse/${warehouse.id}`);
    setDetail(res.data);
    const occRes = await api.get(`/warehouse/${warehouse.id}/occupancy`);
    setOccupancy(occRes.data);
    if (onRefresh) onRefresh();
  };

  const handleDeleteZone = async (zoneId, zoneName) => {
    if (!window.confirm(`Delete zone "${zoneName}"?`)) return;
    try { await api.delete(`/warehouse/zone/${zoneId}`); toast.success('Zone deleted'); refresh(); }
    catch { toast.error('Failed'); }
  };

  const handleDeleteAisle = async (aisleId, aisleName) => {
    if (!window.confirm(`Delete aisle "${aisleName}"?`)) return;
    try { await api.delete(`/warehouse/aisle/${aisleId}`); toast.success('Aisle deleted'); refresh(); }
    catch { toast.error('Failed'); }
  };

  const handleDeleteBin = async (binId, binName) => {
    if (!window.confirm(`Delete bin "${binName}"?`)) return;
    try { await api.delete(`/warehouse/bin/${binId}`); toast.success('Bin deleted'); refresh(); }
    catch { toast.error('Failed'); }
  };

  const handleAddZone = async (e) => {
    e.preventDefault();
    if (!newZoneCode.trim()) return;
    try {
      await api.get('/warehouse/zone/create', { params: { code: newZoneCode, type: newZoneType, warehouseId: warehouse.id } });
      const res = await api.get(`/warehouse/${warehouse.id}`);
      const createdZone = res.data.zones.find(z => z.zoneCode === newZoneCode);
      const ac = parseInt(newAislesCount, 10), bp = parseInt(newBinsPerAisle, 10);
      if (createdZone && ac > 0 && bp > 0) {
        for (let a = 1; a <= ac; a++) {
          const aisleRes = await api.get('/warehouse/aisle/create', { params: { code: `AISLE-${String(a).padStart(2, '0')}`, zoneId: createdZone.id } });
          for (let b = 1; b <= bp; b++) {
            await api.get('/warehouse/bin/create', { params: { code: `BIN-${String(b).padStart(2, '0')}`, capacity: 100, aisleId: aisleRes.data.id } });
          }
        }
      }
      toast.success('Zone created!');
      setNewZoneCode(''); setNewZoneType(''); setNewAislesCount(''); setNewBinsPerAisle(''); setShowAddZoneForm(false);
      refresh();
    } catch { toast.error('Failed to create zone'); }
  };

  if (!detail) return <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"><FiLoader className="animate-spin text-blue-500" size={24} /></div>;

  const zones = detail.zones || [];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">{detail.name} - Zones</h2>
          <button onClick={onClose}><FiX size={20} /></button>
        </div>
        <div className="mb-4"><button onClick={() => setShowAddZoneForm(!showAddZoneForm)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl"><FiPlus size={16} /> Add Zone</button></div>
        {showAddZoneForm && (
          <form onSubmit={handleAddZone} className="mb-4 p-4 bg-gray-50 rounded-xl space-y-3">
            <input placeholder="Zone Code" value={newZoneCode} onChange={e => setNewZoneCode(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" required />
            <input placeholder="Zone Type" value={newZoneType} onChange={e => setNewZoneType(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" />
            <div className="grid grid-cols-2 gap-3">
              <input type="number" placeholder="Aisles" value={newAislesCount} onChange={e => setNewAislesCount(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" />
              <input type="number" placeholder="Bins per Aisle" value={newBinsPerAisle} onChange={e => setNewBinsPerAisle(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="flex gap-2"><button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm">Save</button><button type="button" onClick={() => setShowAddZoneForm(false)} className="text-gray-500 text-sm">Cancel</button></div>
          </form>
        )}
        {zones.length === 0 ? <p className="text-center py-4 text-gray-500">No zones yet.</p> : (
          <div className="space-y-3">
            {zones.map(zone => {
              const aisles = zone.aisles || [];
              const totalBins = aisles.reduce((s, a) => s + (a.bins?.length || 0), 0);
              const usedBins = occupancy?.usedBins ?? 0;
              const percent = totalBins > 0 ? Math.round((usedBins / totalBins) * 100) : 0;
              const isExpanded = expandedZones[zone.id] || false;

              return (
                <div key={zone.id} className="bg-gray-50 rounded-xl overflow-hidden">
                  <div className="p-4 cursor-pointer hover:bg-gray-100" onClick={() => setExpandedZones(prev => ({ ...prev, [zone.id]: !prev[zone.id] }))}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {isExpanded ? <FiChevronDown size={16} /> : <FiChevronRight size={16} />}
                        <div><p className="font-semibold">{zone.zoneCode}</p><p className="text-xs text-gray-500">{aisles.length} Aisle{aisles.length !== 1 ? 's' : ''} • {zone.zoneType}</p></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full">{totalBins} Bins</span>
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteZone(zone.id, zone.zoneCode); }} className="text-red-500"><FiTrash2 size={14} /></button>
                      </div>
                    </div>
                    <CapacityBar used={usedBins} total={totalBins} />
                    <p className="text-right text-xs text-gray-500 mt-1">{percent}%</p>
                  </div>
                  {isExpanded && (
                    <div className="px-4 pb-4 space-y-2">
                      {aisles.map(aisle => (
                        <div key={aisle.id} className="pl-4 border-l-2 border-blue-200">
                          <div className="flex items-center justify-between py-2">
                            <p className="text-sm font-medium">{aisle.aisleCode}</p>
                            <button onClick={() => handleDeleteAisle(aisle.id, aisle.aisleCode)} className="text-red-500"><FiTrash2 size={12} /></button>
                          </div>
                          {aisle.bins && aisle.bins.length > 0 && (
                            <div className="flex gap-1 mt-1 flex-wrap">
                              {aisle.bins.map(bin => {
                                const binUsed = bin.used || 0;
                                const binFree = (bin.capacity || 100) - binUsed;
                                const percentUsed = Math.round((binUsed / (bin.capacity || 100)) * 100);
                                const barColor = percentUsed >= 90 ? 'bg-red-500' : percentUsed >= 70 ? 'bg-amber-500' : 'bg-green-500';

                                return (
                                  <div key={bin.id} className="bg-white border px-3 py-2 rounded-lg text-xs w-32">
                                    <div className="flex justify-between mb-1">
                                      <span className="font-medium">{bin.binCode}</span>
                                      <button onClick={() => handleDeleteBin(bin.id, bin.binCode)} className="text-red-500"><FiTrash2 size={10} /></button>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                                      <div className={`h-1.5 rounded-full ${barColor}`} style={{ width: `${percentUsed}%` }} />
                                    </div>
                                    <div className="flex justify-between mt-0.5 text-gray-400">
                                      <span>{binUsed} used</span>
                                      <span>{binFree} free</span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// ===================== Warehouse Page =====================
const WarehousePage = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [editWarehouse, setEditWarehouse] = useState(null);
  const [occupancyMap, setOccupancyMap] = useState({});

  const fetchOccupancy = async (list) => {
    const map = {};
    await Promise.all(list.map(async (wh) => {
      try { map[wh.id] = (await api.get(`/warehouse/${wh.id}/occupancy`)).data; } catch { map[wh.id] = { usedBins: 0 }; }
    }));
    setOccupancyMap(map);
  };

  const fetchWarehouses = async () => {
    setLoading(true);
    try {
      const res = await api.get('/warehouse');
      const mapped = res.data.map(wh => {
        const bins = (wh.zones || []).flatMap(z => (z.aisles || []).flatMap(a => a.bins || []));
        return { ...wh, location: wh.address, totalBins: bins.length };
      });
      setWarehouses(mapped);
      await fetchOccupancy(mapped);
    } catch { toast.error('Failed to load'); } finally { setLoading(false); }
  };

  useEffect(() => { fetchWarehouses(); }, []);

  const totalBins = warehouses.reduce((s, w) => s + w.totalBins, 0);
  const totalUsed = warehouses.reduce((s, w) => s + (occupancyMap[w.id]?.usedBins || 0), 0);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><FiLoader className="animate-spin text-blue-500" size={40} /></div>;

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Warehouses</h1><p className="text-gray-500 text-sm">Manage warehouse zones and bin locations</p></div>
        <button onClick={() => setShowNewModal(true)} className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl"><FiPlus size={18} /> Add Warehouse</button>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border"><p className="text-gray-500 text-sm">Total Warehouses</p><p className="text-2xl font-bold">{warehouses.length}</p></div>
        <div className="bg-white rounded-xl p-4 border"><p className="text-blue-600 text-sm">Total Bins</p><p className="text-2xl font-bold">{totalBins}</p></div>
        <div className="bg-white rounded-xl p-4 border"><p className="text-green-600 text-sm">Overall Capacity Used</p><p className="text-2xl font-bold">{totalBins > 0 ? Math.round((totalUsed / totalBins) * 100) : 0}%</p></div>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {warehouses.map(wh => {
          const occ = occupancyMap[wh.id] || { usedBins: 0 };
          return (
            <div key={wh.id} className="bg-white rounded-2xl p-6 shadow-sm border">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center"><FiDatabase className="text-blue-500" size={22} /></div>
                  <div><h3 className="font-bold">{wh.name}</h3><div className="flex items-center gap-1 text-gray-500 text-sm"><FiMapPin size={12} />{wh.location || wh.address}</div></div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setEditWarehouse(wh)} className="text-blue-500 hover:text-blue-700"><FiEdit size={16} /></button>
                  <button onClick={() => setSelectedWarehouse(wh)} className="text-sm text-blue-600"><FiGrid size={14} /> View Zones</button>
                </div>
              </div>
              <CapacityBar used={occ.usedBins} total={wh.totalBins} />
              <div className="flex gap-2 flex-wrap mt-4">
                {(wh.zones || []).map(z => (
                  <div key={z.id} className="flex items-center gap-1 bg-gray-50 border px-3 py-1.5 rounded-lg text-xs">
                    <FiPackage size={12} />{z.zoneCode} ({(z.aisles || []).length} aisles)
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {showNewModal && <NewWarehouseModal onClose={() => setShowNewModal(false)} onAdd={fetchWarehouses} />}
      {selectedWarehouse && <ZoneDetailModal warehouse={selectedWarehouse} onClose={() => setSelectedWarehouse(null)} onRefresh={fetchWarehouses} />}
      {editWarehouse && <EditWarehouseModal warehouse={editWarehouse} onClose={() => setEditWarehouse(null)} onSave={fetchWarehouses} />}
    </div>
  );
};

export default WarehousePage;