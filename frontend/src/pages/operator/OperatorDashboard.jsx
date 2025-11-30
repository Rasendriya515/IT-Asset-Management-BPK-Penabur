import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, QrCode, Package, User, Building2, MapPin } from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';
import api from '../../services/api';

const OperatorDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total_assets: 0, your_school: 'Loading...' });
  const [search, setSearch] = useState('');
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard/stats');
        setStats(prev => ({ ...prev, total_assets: res.data.total_assets }));
      } catch (error) {
        console.error("Gagal load stats");
      }
    };
    fetchStats();
  }, []);

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      navigate(`/user/assets?search=${search}`);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-8">

        <div className="bg-gradient-to-r from-penabur-blue to-blue-600 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-2">Halo, Operator!</h1>
            <p className="text-blue-100 max-w-xl">
              Selamat datang di panel manajemen aset. Silakan cari aset untuk melihat detail, melakukan pengecekan, atau memperbarui status kondisi.
            </p>
          </div>
          <div className="absolute right-0 top-0 h-full w-1/3 bg-white/10 skew-x-12 transform translate-x-10"></div>
        </div>

        <div className="max-w-2xl mx-auto -mt-16 relative z-20">
          <div className="bg-white p-2 rounded-xl shadow-xl flex items-center border border-blue-100">
            <Search className="ml-4 text-gray-400" size={24} />
            <input 
              type="text"
              placeholder="Ketik Serial Number atau Barcode lalu Tekan Enter..."
              className="w-full px-4 py-3 outline-none text-lg text-gray-700 rounded-lg"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleSearch}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          <div 
            onClick={() => navigate('/user/scan')}
            className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-penabur-blue cursor-pointer transition-all group"
          >
            <div className="bg-blue-50 w-14 h-14 rounded-lg flex items-center justify-center text-penabur-blue mb-4 group-hover:bg-penabur-blue group-hover:text-white transition-colors">
              <QrCode size={28}/>
            </div>
            <h3 className="font-bold text-lg text-gray-800">Scan QR Aset</h3>
            <p className="text-sm text-gray-500 mt-1">Gunakan kamera untuk memindai label aset.</p>
          </div>

          <div 
            onClick={() => navigate('/user/assets')}
            className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-purple-500 cursor-pointer transition-all group"
          >
            <div className="bg-purple-50 w-14 h-14 rounded-lg flex items-center justify-center text-purple-600 mb-4 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <Package size={28}/>
            </div>
            <h3 className="font-bold text-lg text-gray-800">Semua Aset</h3>
            <p className="text-sm text-gray-500 mt-1">Lihat {stats.total_assets} aset terdaftar di sistem.</p>
          </div>

          <div 
            className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm"
          >
            <div className="bg-green-50 w-14 h-14 rounded-lg flex items-center justify-center text-green-600 mb-4">
              <User size={28}/>
            </div>
            <h3 className="font-bold text-lg text-gray-800">Area Kerja</h3>
            <p className="text-sm text-gray-500 mt-1">Anda login sebagai Operator.</p>
          </div>
        </div>

      </div>
    </MainLayout>
  );
};

export default OperatorDashboard;