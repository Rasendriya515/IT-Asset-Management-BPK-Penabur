import React, { useState, useEffect } from 'react';
import { ArrowLeftRight, Building2, MapPin, CheckCircle, AlertTriangle, Box, ArrowRight, Loader2 } from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';
import api from '../../services/api';

const TransferAset = () => {
  const [activeTab, setActiveTab] = useState('mass'); 
  const [loading, setLoading] = useState(false);
  const [areas, setAreas] = useState([]);
  const [schools, setSchools] = useState([]);
  const [assets, setAssets] = useState([]);

  const [massForm, setMassForm] = useState({
    school_id: '',
    new_area_id: ''
  });

  const [partialForm, setPartialForm] = useState({
    source_school_id: '',
    target_school_id: '',
    new_room: 'Gudang',
    new_floor: '01',
    selected_assets: []
  });

  const [modalStep, setModalStep] = useState(0); 
  const [confirmInput, setConfirmInput] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [areaRes, schoolRes] = await Promise.all([
          api.get('/areas'),
          api.get('/areas/1/schools').then(() => api.get('/areas').then(async (areas) => {
             let allSchools = [];
             for(let area of areas.data) {
                const res = await api.get(`/areas/${area.id}/schools`);
                allSchools = [...allSchools, ...res.data];
             }
             return allSchools;
          }))
        ]);
        setAreas(areaRes.data);
        setSchools(schoolRes); 
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (activeTab === 'partial' && partialForm.source_school_id) {
      const fetchAssets = async () => {
        setLoading(true);
        try {
          const res = await api.get('/assets', { params: { school_id: partialForm.source_school_id } });
          setAssets(res.data);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      };
      fetchAssets();
    }
  }, [partialForm.source_school_id, activeTab]);

  const handleMassTransfer = async () => {
    setLoading(true);
    try {
      await api.post('/transfers/mass-school', {
        school_id: parseInt(massForm.school_id),
        new_area_id: parseInt(massForm.new_area_id)
      });
      alert("Berhasil! Sekolah dan seluruh asetnya telah dipindahkan.");
      setModalStep(0);
      setMassForm({ school_id: '', new_area_id: '' });
    } catch (error) {
      alert("Gagal melakukan transfer massal.");
    } finally {
      setLoading(false);
    }
  };

  const handlePartialTransfer = async () => {
    setLoading(true);
    try {
      await api.post('/transfers/partial-assets', {
        target_school_id: parseInt(partialForm.target_school_id),
        asset_ids: partialForm.selected_assets,
        new_room: partialForm.new_room,
        new_floor: partialForm.new_floor
      });
      alert(`Berhasil! ${partialForm.selected_assets.length} aset telah dipindahkan.`);
      setModalStep(0);
      setPartialForm(prev => ({ ...prev, selected_assets: [] }));
      
      const res = await api.get('/assets', { params: { school_id: partialForm.source_school_id } });
      setAssets(res.data);

    } catch (error) {
      alert("Gagal melakukan transfer aset.");
    } finally {
      setLoading(false);
    }
  };

  const executeTransfer = () => {
    if (confirmInput !== 'KONFIRMASI') {
      alert("Kata kunci salah!");
      return;
    }
    if (activeTab === 'mass') handleMassTransfer();
    else handlePartialTransfer();
  };

  const toggleAssetSelection = (assetId) => {
    setPartialForm(prev => {
      const isSelected = prev.selected_assets.includes(assetId);
      if (isSelected) {
        return { ...prev, selected_assets: prev.selected_assets.filter(id => id !== assetId) };
      } else {
        return { ...prev, selected_assets: [...prev.selected_assets, assetId] };
      }
    });
  };

  return (
    <MainLayout>
      <div className="space-y-6 pb-20">
        
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <ArrowLeftRight className="text-penabur-blue mr-3" /> Transfer Aset
            </h2>
            <p className="text-gray-500 text-lg mt-1">Pindahkan aset antar Sekolah atau Relokasi Sekolah antar Area.</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex border-b border-gray-100">
            <button 
              onClick={() => setActiveTab('mass')}
              className={`flex-1 py-4 text-sm font-bold flex items-center justify-center transition-colors ${activeTab === 'mass' ? 'bg-blue-50 text-penabur-blue border-b-2 border-penabur-blue' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <Building2 size={18} className="mr-2"/> Pindah Sekolah (Massal)
            </button>
            <button 
              onClick={() => setActiveTab('partial')}
              className={`flex-1 py-4 text-sm font-bold flex items-center justify-center transition-colors ${activeTab === 'partial' ? 'bg-blue-50 text-penabur-blue border-b-2 border-penabur-blue' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <Box size={18} className="mr-2"/> Pindah Aset (Parsial)
            </button>
          </div>

          <div className="p-8">
            {activeTab === 'mass' ? (
              <div className="max-w-2xl mx-auto space-y-8">
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg flex items-start">
                  <AlertTriangle className="text-yellow-600 mr-3 flex-shrink-0" size={20}/>
                  <p className="text-sm text-yellow-700">
                    <strong>Perhatian:</strong> Tindakan ini akan memindahkan Sekolah beserta <strong>SEMUA</strong> aset di dalamnya ke Area Administratif yang baru.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div className="space-y-2">
                    <label className="font-bold text-gray-700">Sekolah Asal</label>
                    <select 
                      className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-penabur-blue"
                      value={massForm.school_id}
                      onChange={(e) => setMassForm({...massForm, school_id: e.target.value})}
                    >
                      <option value="">-- Pilih Sekolah --</option>
                      {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>

                  <div className="flex justify-center">
                    <div className="bg-gray-100 p-3 rounded-full">
                      <ArrowRight className="text-gray-400" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="font-bold text-gray-700">Area Tujuan Baru</label>
                    <select 
                      className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-penabur-blue"
                      value={massForm.new_area_id}
                      onChange={(e) => setMassForm({...massForm, new_area_id: e.target.value})}
                    >
                      <option value="">-- Pilih Area Baru --</option>
                      {areas.map(a => <option key={a.id} value={a.id}>Area {a.name}</option>)}
                    </select>
                  </div>
                </div>

                <button 
                  disabled={!massForm.school_id || !massForm.new_area_id}
                  onClick={() => setModalStep(1)}
                  className="w-full bg-penabur-blue text-white py-3 rounded-lg font-bold hover:bg-penabur-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  Proses Pemindahan Sekolah
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Dari Sekolah (Sumber)</label>
                    <select 
                      className="w-full p-2 border rounded-lg"
                      value={partialForm.source_school_id}
                      onChange={(e) => setPartialForm({...partialForm, source_school_id: e.target.value, selected_assets: []})}
                    >
                      <option value="">-- Pilih Sekolah Asal --</option>
                      {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Ke Sekolah (Tujuan)</label>
                    <select 
                      className="w-full p-2 border rounded-lg"
                      value={partialForm.target_school_id}
                      onChange={(e) => setPartialForm({...partialForm, target_school_id: e.target.value})}
                    >
                      <option value="">-- Pilih Sekolah Tujuan --</option>
                      {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                </div>

                {partialForm.source_school_id && (
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-50 p-3 border-b font-bold text-sm text-gray-700 flex justify-between items-center">
                      <span>Pilih Aset untuk Dipindahkan</span>
                      <span className="text-penabur-blue">{partialForm.selected_assets.length} aset dipilih</span>
                    </div>
                    <div className="max-h-64 overflow-y-auto p-2 space-y-1">
                      {loading ? (
                        <div className="p-4 text-center"><Loader2 className="animate-spin inline"/></div>
                      ) : assets.length === 0 ? (
                        <div className="p-4 text-center text-gray-400">Tidak ada aset di sekolah ini.</div>
                      ) : (
                        assets.map(asset => (
                          <div 
                            key={asset.id} 
                            onClick={() => toggleAssetSelection(asset.id)}
                            className={`p-3 rounded-lg border cursor-pointer flex items-center justify-between transition-all ${partialForm.selected_assets.includes(asset.id) ? 'bg-blue-50 border-blue-300' : 'border-gray-100 hover:bg-gray-50'}`}
                          >
                            <div>
                              <p className="font-bold text-sm text-gray-800">{asset.brand} {asset.model_series}</p>
                              <p className="text-xs text-gray-500">{asset.barcode}</p>
                            </div>
                            {partialForm.selected_assets.includes(asset.id) && <CheckCircle size={18} className="text-penabur-blue"/>}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Ruangan Baru (Default)</label>
                        <input type="text" className="w-full p-2 border rounded" value={partialForm.new_room} onChange={(e) => setPartialForm({...partialForm, new_room: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Lantai Baru (Default)</label>
                        <input type="text" className="w-full p-2 border rounded" value={partialForm.new_floor} onChange={(e) => setPartialForm({...partialForm, new_floor: e.target.value})} />
                    </div>
                </div>

                <button 
                  disabled={!partialForm.target_school_id || partialForm.selected_assets.length === 0}
                  onClick={() => setModalStep(1)}
                  className="w-full bg-penabur-blue text-white py-3 rounded-lg font-bold hover:bg-penabur-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  Pindahkan {partialForm.selected_assets.length} Aset Terpilih
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {modalStep > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
             {modalStep === 1 && (
                <div className="p-6 text-center">
                    <div className="bg-red-100 text-red-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Konfirmasi Pemindahan</h3>
                    <p className="text-gray-600 mb-6">
                        {activeTab === 'mass' 
                            ? "Anda yakin ingin memindahkan SELURUH sekolah dan asetnya ke Area baru?"
                            : `Anda yakin ingin memindahkan ${partialForm.selected_assets.length} aset ke sekolah baru?`
                        }
                    </p>
                    <div className="flex gap-3">
                        <button onClick={() => setModalStep(0)} className="flex-1 py-2 border border-gray-300 rounded-lg font-bold text-gray-600 hover:bg-gray-50">Batal</button>
                        <button onClick={() => setModalStep(2)} className="flex-1 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700">Ya, Lanjutkan</button>
                    </div>
                </div>
             )}

             {modalStep === 2 && (
                <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Verifikasi Keamanan</h3>
                    <p className="text-sm text-gray-600 mb-4">
                        Fitur ini bersifat sensitif. Silakan ketik kata <strong>KONFIRMASI</strong> di bawah ini untuk mengeksekusi.
                    </p>
                    <input 
                        type="text" 
                        className="w-full border-2 border-gray-300 rounded-lg p-3 text-center font-bold tracking-widest uppercase focus:border-penabur-blue outline-none mb-6"
                        placeholder="Ketik KONFIRMASI"
                        value={confirmInput}
                        onChange={(e) => setConfirmInput(e.target.value)}
                    />
                    <button 
                        onClick={executeTransfer}
                        disabled={confirmInput !== 'KONFIRMASI' || loading}
                        className="w-full bg-penabur-blue text-white py-3 rounded-lg font-bold hover:bg-penabur-dark disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Memproses...' : 'EKSEKUSI PEMINDAHAN'}
                    </button>
                    <button onClick={() => setModalStep(0)} className="w-full mt-3 text-gray-400 text-sm font-medium hover:text-gray-600">Batal</button>
                </div>
             )}
          </div>
        </div>
      )}

    </MainLayout>
  );
};

export default TransferAset;