import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Loader2, Eye, Building2, MapPin, Pencil } from 'lucide-react';
import api from '../../services/api';
import logoBpk from '../../assets/images/logo-bpk.png';

const DesktopAssetList = () => {
  const navigate = useNavigate();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchAssets = async () => {
      setLoading(true);
      try {
        const res = await api.get('/assets', { 
            params: { search: search || undefined } 
        });
        setAssets(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    const timeoutId = setTimeout(() => fetchAssets(), 500);
    return () => clearTimeout(timeoutId);
  }, [search]);

  const getStatusColor = (statusRaw) => {
    const status = statusRaw?.toLowerCase() || '';
    if (status.includes('berfungsi') || status.includes('baik') || status.includes('ok')) return 'bg-green-100 text-green-700 border border-green-200';
    if (status.includes('rusak') || status.includes('bad')) return 'bg-red-100 text-red-700 border border-red-200';
    if (status.includes('perbaikan') || status.includes('service')) return 'bg-orange-100 text-orange-700 border border-orange-200';
    if (status.includes('terkendala') || status.includes('warn')) return 'bg-yellow-100 text-yellow-700 border border-yellow-200';
    return 'bg-gray-100 text-gray-700 border border-gray-200';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-penabur-blue border-b border-blue-800 px-8 py-4 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-4">
            <div className="bg-white/10 p-1 rounded-lg backdrop-blur-sm"><img src={logoBpk} alt="Logo" className="h-10 w-auto" /></div>
            <h1 className="font-bold text-white text-xl leading-none">Daftar Aset</h1>
        </div>
        <button onClick={() => navigate('/user/home')} className="bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-colors flex items-center text-sm font-medium">
            <ArrowLeft size={16} className="mr-2" /> Kembali
        </button>
      </nav>

      <main className="flex-1 max-w-7xl w-full mx-auto p-8">
        
        <div className="flex justify-between items-center mb-6">
            <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                <input 
                    type="text" 
                    placeholder="Cari Serial Number, Barcode, atau Nama..." 
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-200 shadow-sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            <div className="text-gray-500 font-medium text-sm bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
                Total Aset: <span className="text-penabur-blue font-bold">{assets.length}</span>
            </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-700 text-center uppercase font-bold text-xs">
                        <tr>
                            <th className="p-4 border-b w-10 text-center">No</th>
                            <th className="p-4 border-b">Nama Aset</th>
                            <th className="p-4 border-b">Barcode IT</th>
                            <th className="p-4 border-b">Serial Number</th>
                            <th className="p-4 border-b">Sekolah</th>
                            <th className="p-4 border-b">Area</th>
                            <th className="p-4 border-b">Lokasi</th>
                            <th className="p-4 border-b text-center">Status</th>
                            <th className="p-4 border-b text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan="9" className="p-8 text-center"><Loader2 className="animate-spin inline mr-2"/> Loading...</td></tr>
                        ) : assets.length === 0 ? (
                            <tr><td colSpan="9" className="p-8 text-center text-gray-500">Tidak ada data ditemukan.</td></tr>
                        ) : (
                            assets.map((asset, idx) => (
                                <tr key={asset.id} className="hover:bg-blue-50 transition-colors group">
                                    <td className="p-4 text-center text-gray-400">{idx + 1}</td>
                                    <td className="p-4 font-bold text-gray-800">{asset.brand} {asset.model_series}</td>
                                    <td className="p-4 font-mono text-penabur-blue">{asset.barcode}</td>
                                    <td className="p-4 text-gray-600">{asset.serial_number}</td>
                                    
                                    <td className="p-4 text-gray-700">
                                        <div className="flex items-center gap-2">
                                            <Building2 size={14} className="text-gray-400"/>
                                            <span className="font-medium">{asset.school?.name || '-'}</span>
                                        </div>
                                    </td>

                                    <td className="p-4 text-gray-600">
                                        <span className="bg-gray-100 px-2 py-1 rounded text-xs font-bold uppercase text-gray-500">
                                            {asset.school?.area?.name || '-'}
                                        </span>
                                    </td>

                                    <td className="p-4 text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <MapPin size={14} className="text-gray-400"/>
                                            <span>{asset.room} (Lt. {asset.floor})</span>
                                        </div>
                                    </td>

                                    <td className="p-4 text-center">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(asset.status)}`}>
                                            {asset.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button 
                                                onClick={() => navigate(`/user/asset/${asset.id}`)}
                                                className="bg-blue-50 text-blue-600 p-2 rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
                                                title="Lihat Detail"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button 
                                                onClick={() => navigate(`/school/${asset.school_id}/asset/${asset.id}/edit`)}
                                                className="bg-yellow-50 text-yellow-600 p-2 rounded-lg hover:bg-yellow-500 hover:text-white transition-colors"
                                                title="Edit Aset"
                                            >
                                                <Pencil size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>

      </main>
    </div>
  );
};

export default DesktopAssetList;