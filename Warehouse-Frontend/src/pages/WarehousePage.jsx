import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import toast from 'react-hot-toast';
import {
  FiDatabase, FiPlus, FiX, FiMapPin, FiPackage,
  FiGrid, FiLoader, FiChevronDown,
  FiChevronRight, FiTrash2, FiEdit, FiLayers
} from 'react-icons/fi';

// ===================== Capacity Bar =====================
const CapacityBar = ({ used, total }) => {
  const percent = total > 0 ? Math.round((used / total) * 100) : 0;
  const color = percent >= 90 ? 'bg-red-500' : percent >= 70 ? 'bg-amber-500' : 'bg-green-500';
  return (
    <div>
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>{used} / {total} bins used</span>
        <span className="font-medium">{percent}%</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
        <div className={`h-2 rounded-full transition-all duration-500 ${color}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
};

// ===================== New Warehouse Modal =====================
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
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Add New Warehouse</h2>
            <p className="text-sm text-gray-500 mt-0.5">Create a new storage facility</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <FiX size={20} className="text-gray-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Warehouse Name *</label>
            <input placeholder="e.g. Main Warehouse" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Location *</label>
            <input placeholder="e.g. New York, NY" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" required />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl hover:bg-gray-50 font-medium text-sm transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2 font-medium text-sm transition-colors disabled:opacity-50">
              {loading ? <FiLoader className="animate-spin" size={16} /> : <FiPlus size={16} />} Add Warehouse
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
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Edit Warehouse</h2>
            <p className="text-sm text-gray-500 mt-0.5">{warehouse.name}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <FiX size={20} className="text-gray-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Warehouse Name</label>
            <input placeholder="Warehouse Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Location</label>
            <input placeholder="Location" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" required />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl hover:bg-gray-50 font-medium text-sm transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2 font-medium text-sm transition-colors disabled:opacity-50">
              {loading ? <FiLoader className="animate-spin" size={16} /> : <FiEdit size={16} />} Save Changes
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
  const [addingAisleForZone, setAddingAisleForZone] = useState(null);
  const [aisleCode, setAisleCode] = useState('');
  const [addingBinForAisle, setAddingBinForAisle] = useState(null);
  const [binCode, setBinCode] = useState('');
  const [binCapacity, setBinCapacity] = useState('');

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
    if (!window.confirm(`Delete zone "${zoneName}" and all its aisles/bins?`)) return;
    try { await api.delete(`/warehouse/zone/${zoneId}`); toast.success('Zone deleted'); refresh(); }
    catch { toast.error('Failed'); }
  };

  const handleDeleteAisle = async (aisleId, aisleName) => {
    if (!window.confirm(`Delete aisle "${aisleName}" and all its bins?`)) return;
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
            const whPrefix = detail.warehouseCode?.substring(0, 3) || 'WH';
            await api.get('/warehouse/bin/create', { params: { code: `${whPrefix}-BIN-${String(b).padStart(2, '0')}`, capacity: 100, aisleId: aisleRes.data.id } });
          }
        }
      }
      toast.success('Zone created with aisles and bins!');
      setNewZoneCode(''); setNewZoneType(''); setNewAislesCount(''); setNewBinsPerAisle(''); setShowAddZoneForm(false);
      refresh();
    } catch { toast.error('Failed to create zone'); }
  };

  const handleAddAisle = async (zoneId) => {
    if (!aisleCode.trim()) return;
    try { await api.get('/warehouse/aisle/create', { params: { code: aisleCode, zoneId } }); toast.success('Aisle added!'); setAisleCode(''); setAddingAisleForZone(null); refresh(); }
    catch { toast.error('Failed'); }
  };

  const handleAddBin = async (aisleId) => {
    if (!binCode.trim() || !binCapacity) return;
    try { await api.get('/warehouse/bin/create', { params: { code: binCode, capacity: parseFloat(binCapacity), aisleId } }); toast.success('Bin added!'); setBinCode(''); setBinCapacity(''); setAddingBinForAisle(null); refresh(); }
    catch { toast.error('Failed'); }
  };

  if (!detail) return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8"><FiLoader className="animate-spin text-blue-500" size={32} /></div>
    </div>
  );

  const zones = detail.zones || [];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 rounded-t-2xl z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                <FiDatabase size={18} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">{detail.name}</h2>
                <p className="text-sm text-gray-500">{zones.length} Zone{zones.length !== 1 ? 's' : ''} • {detail.warehouseCode}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <FiX size={20} className="text-gray-500" />
            </button>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Add Zone Button */}
          <button onClick={() => setShowAddZoneForm(!showAddZoneForm)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl transition-colors font-medium text-sm shadow-sm">
            <FiPlus size={16} /> Add Zone
          </button>

          {/* Add Zone Form */}
          {showAddZoneForm && (
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
              <p className="text-sm font-semibold text-blue-700 mb-3">Create New Zone</p>
              <form onSubmit={handleAddZone} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input placeholder="Zone Code (e.g. ZONE-A)" value={newZoneCode} onChange={e => setNewZoneCode(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                  <input placeholder="Zone Type (e.g. Storage)" value={newZoneType} onChange={e => setNewZoneType(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input type="number" placeholder="Number of Aisles" value={newAislesCount} onChange={e => setNewAislesCount(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <input type="number" placeholder="Bins per Aisle" value={newBinsPerAisle} onChange={e => setNewBinsPerAisle(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">Create Zone</button>
                  <button type="button" onClick={() => setShowAddZoneForm(false)} className="text-gray-500 text-sm font-medium hover:text-gray-700">Cancel</button>
                </div>
              </form>
            </div>
          )}

          {/* Zones List */}
          {zones.length === 0 ? (
            <div className="text-center py-12">
              <FiLayers size={48} className="mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500 font-medium">No zones yet</p>
              <p className="text-gray-400 text-sm mt-1">Add a zone to organize your warehouse</p>
            </div>
          ) : (
            <div className="space-y-3">
              {zones.map(zone => {
                const aisles = zone.aisles || [];
                const totalBins = aisles.reduce((s, a) => s + (a.bins?.length || 0), 0);
                const usedBins = aisles.reduce((s, a) => s + (a.bins || []).filter(b => b.used > 0).length, 0);
                const percent = totalBins > 0 ? Math.round((usedBins / totalBins) * 100) : 0;
                const isExpanded = expandedZones[zone.id] || false;

                return (
                  <div key={zone.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-all">
                    {/* Zone Header */}
                    <div className="p-4 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => setExpandedZones(prev => ({ ...prev, [zone.id]: !prev[zone.id] }))}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isExpanded ? 'bg-blue-100' : 'bg-gray-100'}`}>
                            {isExpanded ? <FiChevronDown size={16} className="text-blue-600" /> : <FiChevronRight size={16} className="text-gray-600" />}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{zone.zoneCode}</p>
                            <p className="text-xs text-gray-500">{aisles.length} Aisle{aisles.length !== 1 ? 's' : ''} • {zone.zoneType || 'No type'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-medium">{totalBins} Bins</span>
                          <button onClick={(e) => { e.stopPropagation(); handleDeleteZone(zone.id, zone.zoneCode); }} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <CapacityBar used={usedBins} total={totalBins} />
                      <p className="text-right text-xs text-gray-400 mt-1 font-medium">{percent}% utilized</p>
                    </div>

                    {/* Expanded: Aisles & Bins */}
                    {isExpanded && (
                      <div className="border-t border-gray-100 bg-gray-50/50 px-4 py-3 space-y-2">
                        {aisles.map(aisle => (
                          <div key={aisle.id} className="bg-white rounded-lg border border-gray-200 p-3">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <p className="text-sm font-medium text-gray-800">{aisle.aisleCode}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <button onClick={() => { setAddingBinForAisle(aisle.id); setBinCode(''); setBinCapacity(''); }} className="text-xs text-blue-600 hover:bg-blue-50 px-2 py-1 rounded-lg transition-colors font-medium">
                                  + Add Bin
                                </button>
                                <button onClick={() => handleDeleteAisle(aisle.id, aisle.aisleCode)} className="p-1 text-red-400 hover:bg-red-50 rounded transition-colors">
                                  <FiTrash2 size={12} />
                                </button>
                              </div>
                            </div>

                            {/* Bins */}
                            {aisle.bins && aisle.bins.length > 0 && (
                              <div className="flex gap-2 flex-wrap">
                                {aisle.bins.map(bin => {
                                  const binCapacity = bin.capacity || 100;
                                  const binUsed = bin.used || 0;
                                  const binFree = binCapacity - binUsed;
                                  const percentUsed = binCapacity > 0 ? Math.round((binUsed / binCapacity) * 100) : 0;
                                  const barColor = percentUsed >= 90 ? 'bg-red-500' : percentUsed >= 70 ? 'bg-amber-500' : 'bg-green-500';
                                  return (
                                    <div key={bin.id} className="bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg text-xs w-36 hover:shadow-sm transition-all">
                                      <div className="flex justify-between mb-1">
                                        <span className="font-medium text-gray-700">{bin.binCode}</span>
                                        <button onClick={() => handleDeleteBin(bin.id, bin.binCode)} className="text-red-400 hover:text-red-600">
                                          <FiTrash2 size={10} />
                                        </button>
                                      </div>
                                      <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                        <div className={`h-1.5 rounded-full ${barColor}`} style={{ width: `${percentUsed}%` }} />
                                      </div>
                                      <div className="flex justify-between mt-1 text-gray-400">
                                        <span>{binUsed}</span>
                                        <span>{binFree} free</span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {/* Add Bin Form */}
                            {addingBinForAisle === aisle.id && (
                              <div className="mt-2 flex gap-2 items-end bg-gray-50 p-2 rounded-lg">
                                <input type="text" placeholder="Bin Code" value={binCode} onChange={(e) => setBinCode(e.target.value)} className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm w-28 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                <input type="number" placeholder="Capacity" value={binCapacity} onChange={(e) => setBinCapacity(e.target.value)} className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm w-20 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                <button onClick={() => handleAddBin(aisle.id)} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700">Save</button>
                                <button onClick={() => setAddingBinForAisle(null)} className="text-gray-500 text-sm hover:text-gray-700">Cancel</button>
                              </div>
                            )}
                          </div>
                        ))}

                        {/* Add Aisle */}
                        <button onClick={(e) => { e.stopPropagation(); setAddingAisleForZone(zone.id); setAisleCode(''); }} className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors">
                          <FiPlus size={14} /> Add Aisle
                        </button>
                        {addingAisleForZone === zone.id && (
                          <div className="flex gap-2 items-end bg-white p-2 rounded-lg border border-gray-200">
                            <input type="text" placeholder="Aisle Code" value={aisleCode} onChange={(e) => setAisleCode(e.target.value)} className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            <button onClick={() => handleAddAisle(zone.id)} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700">Save</button>
                            <button onClick={() => setAddingAisleForZone(null)} className="text-gray-500 text-sm hover:text-gray-700">Cancel</button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
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
          <h1 className="text-2xl font-bold text-gray-800">Warehouses</h1>
          <p className="text-gray-500 text-sm mt-1">Manage warehouse zones, aisles, and bin locations</p>
        </div>
        <button onClick={() => setShowNewModal(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl transition-colors shadow-sm font-medium">
          <FiPlus size={18} /> Add Warehouse
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Warehouses', count: warehouses.length, color: 'bg-blue-500', icon: <FiDatabase size={18} /> },
          { label: 'Total Bins', count: totalBins, color: 'bg-purple-500', icon: <FiGrid size={18} /> },
          { label: 'Capacity Used', count: `${totalBins > 0 ? Math.round((totalUsed / totalBins) * 100) : 0}%`, color: 'bg-green-500', icon: <FiPackage size={18} /> },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-all">
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

      {/* Warehouse Cards */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {warehouses.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-white rounded-2xl border">
            <FiDatabase size={48} className="mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500 font-medium">No warehouses yet</p>
            <p className="text-gray-400 text-sm mt-1">Add your first warehouse to get started</p>
          </div>
        ) : (
          warehouses.map(wh => {
            const occ = occupancyMap[wh.id] || { usedBins: 0 };
            const totalZones = (wh.zones || []).length;
            const totalAisles = (wh.zones || []).reduce((s, z) => s + (z.aisles || []).length, 0);
            
            return (
              <div key={wh.id} className="bg-white rounded-2xl border border-gray-200 hover:shadow-md transition-all overflow-hidden">
                <div className="p-5">
                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                        <FiDatabase className="text-white" size={22} />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 text-lg">{wh.name}</h3>
                        <div className="flex items-center gap-1 text-gray-500 text-sm mt-0.5">
                          <FiMapPin size={12} />{wh.location || wh.address}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setEditWarehouse(wh)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                        <FiEdit size={16} />
                      </button>
                      <button onClick={() => setSelectedWarehouse(wh)} className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium flex items-center gap-1">
                        <FiGrid size={14} /> View Zones
                      </button>
                    </div>
                  </div>

                  {/* Capacity */}
                  <CapacityBar used={occ.usedBins} total={wh.totalBins} />

                  {/* Stats Row */}
                  <div className="grid grid-cols-3 gap-3 mt-4">
                    <div className="bg-gray-50 rounded-lg p-2.5 text-center">
                      <p className="text-lg font-bold text-gray-800">{totalZones}</p>
                      <p className="text-xs text-gray-500">Zones</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2.5 text-center">
                      <p className="text-lg font-bold text-gray-800">{totalAisles}</p>
                      <p className="text-xs text-gray-500">Aisles</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2.5 text-center">
                      <p className="text-lg font-bold text-gray-800">{wh.totalBins}</p>
                      <p className="text-xs text-gray-500">Bins</p>
                    </div>
                  </div>

                  {/* Zone Tags */}
                  {(wh.zones || []).length > 0 && (
                    <div className="flex gap-2 flex-wrap mt-4">
                      {(wh.zones || []).slice(0, 4).map(z => (
                        <span key={z.id} className="flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-lg text-xs font-medium">
                          <FiLayers size={12} />{z.zoneCode}
                        </span>
                      ))}
                      {(wh.zones || []).length > 4 && (
                        <span className="text-xs text-gray-500 font-medium px-2 py-1.5">
                          +{(wh.zones || []).length - 4} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {showNewModal && <NewWarehouseModal onClose={() => setShowNewModal(false)} onAdd={fetchWarehouses} />}
      {selectedWarehouse && <ZoneDetailModal warehouse={selectedWarehouse} onClose={() => setSelectedWarehouse(null)} onRefresh={fetchWarehouses} />}
      {editWarehouse && <EditWarehouseModal warehouse={editWarehouse} onClose={() => setEditWarehouse(null)} onSave={fetchWarehouses} />}
    </div>
  );
};

export default WarehousePage;