import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Server, Loader2 } from 'lucide-react';
import api from '../../services/api';

const MobileAssetList = () => {
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

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center font-sans">
      <div className="w-full max-w-md bg-gray-50 min-h-screen shadow-2xl relative flex flex-col">
        <div className="bg-penabur-blue p-6 pb-8 rounded-b-[2rem] shadow-md z-10">
           <button onClick={() => navigate('/user/home')} className="text-white mb-4 flex items-center">
              <ArrowLeft className="mr-2" /> Kembali
           </button>
           <h1 className="text-2xl font-bold text-white">Daftar Aset</h1>
           <p className="text-blue-200 text-xs">Cari aset di seluruh database</p>
           <div className="mt-6">
              <div className="bg-white p-3 rounded-xl shadow-lg flex items-center border border-gray-100">
                  <Search className="text-gray-400 mr-3" size={20} />
                  <input 
                      type="text" 
                      placeholder="Cari SN / Barcode / Nama..." 
                      className="w-full outline-none text-gray-700 placeholder-gray-400 font-medium"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                  />
              </div>
           </div>
        </div>
        <div className="px-6 pt-6 pb-20 flex-1 overflow-y-auto">
           {loading ? (
               <div className="flex justify-center mt-10"><Loader2 className="animate-spin text-penabur-blue"/></div>
           ) : assets.length === 0 ? (
               <div className="text-center text-gray-400 mt-10">Tidak ada aset ditemukan.</div>
           ) : (
               <div className="space-y-3">
                   {assets.map((asset) => (
                       <div 
                         key={asset.id} 
                         onClick={() => navigate(`/user/asset/${asset.id}`)}
                         className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 active:scale-98 transition-transform cursor-pointer"
                       >
                           <div className="bg-blue-50 p-3 rounded-lg text-penabur-blue">
                               <Server size={20} />
                           </div>
                           <div className="flex-1 min-w-0">
                               <h3 className="font-bold text-gray-800 truncate">{asset.brand} {asset.model_series}</h3>
                               <p className="text-xs text-gray-500 font-mono truncate">{asset.barcode}</p>
                               <div className={`mt-1 inline-block text-[10px] px-2 py-0.5 rounded font-bold ${
                                   asset.status === 'Berfungsi' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                               }`}>
                                   {asset.status}
                               </div>
                           </div>
                       </div>
                   ))}
               </div>
           )}
        </div>

      </div>
    </div>
  );
};

export default MobileAssetList;