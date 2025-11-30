import React, { useState, useEffect } from 'react';
import { LogOut, ScanLine, Search, Package, User, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import logoBpk from '../../assets/images/logo-bpk.png';

const BASE_URL = 'http://localhost:8000';

const DesktopHome = () => {
  const navigate = useNavigate();
  
  const [user, setUser] = useState({ full_name: 'User', avatar: null });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/users/me');
        setUser(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      
      <nav className="bg-penabur-blue border-b border-blue-800 px-8 py-4 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-4">
            <div className="bg-white/10 p-1 rounded-lg backdrop-blur-sm">
                <img src={logoBpk} alt="Logo" className="h-10 w-auto" />
            </div>
            <div>
                <h1 className="font-bold text-white text-xl leading-none">IT Asset Management</h1>
            </div>
        </div>
        
        <div className="flex items-center gap-6">
            
            <div 
                onClick={() => navigate('/user/profile')}
                className="flex items-center gap-3 cursor-pointer hover:bg-white/10 px-3 py-1.5 rounded-xl transition-all"
            >
                <div className="text-right hidden md:block text-white">
                    <p className="text-sm font-bold">{user.full_name || 'User'}</p>
                    <p className="text-xs text-green-400 font-medium flex items-center justify-end gap-1">
                        Online <span className="block w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                    </p> 
                </div>
                <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-white/30 bg-white flex items-center justify-center">
                    {user.avatar ? (
                        <img src={`${BASE_URL}${user.avatar}`} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                        <User className="text-gray-400" size={18} />
                    )}
                </div>
            </div>

            <button 
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all duration-200 hover:shadow-lg active:scale-95 flex items-center gap-2 font-bold text-sm border border-red-500"
            >
                <LogOut size={18} />
                <span>Sign Out</span>
            </button>
        </div>
      </nav>

      <main className="flex-1 max-w-6xl w-full mx-auto p-8">
        
        <div className="bg-white rounded-2xl p-10 text-gray-800 shadow-lg border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-8 mb-10 relative overflow-hidden">
            <div className="relative z-10">
                <h2 className="text-3xl font-bold mb-2 text-penabur-blue">Halo, {user.full_name}!</h2>
                <p className="text-gray-500 max-w-lg">
                    Selamat datang! Gunakan menu di bawah untuk mengelola dan memeriksa aset di lingkungan BPK PENABUR.
                </p>
            </div>
            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                <div className="flex items-center gap-4">
                    <Building2 size={32} className="text-penabur-blue" />
                    <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wider">Lokasi Anda</p>
                        <p className="font-bold text-lg text-gray-800">Kantor Pusat</p>
                    </div>
                </div>
            </div>
        </div>

        <div className="relative max-w-2xl mx-auto -mt-16 mb-12 shadow-xl">
            <input 
                type="text" 
                placeholder="Cari Aset berdasarkan Serial Number atau Barcode..." 
                className="w-full pl-6 pr-14 py-4 rounded-xl border border-gray-200 outline-none text-gray-700 font-medium text-lg focus:ring-4 focus:ring-blue-100 transition-all"
            />
            <button className="absolute right-3 top-3 bg-penabur-blue text-white p-2 rounded-lg hover:bg-penabur-dark transition-colors">
                <Search size={24} />
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <div 
                onClick={() => navigate('/user/scan')}
                className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 cursor-pointer transition-all group flex flex-col items-center text-center"
            >
                <div className="bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center text-penabur-blue mb-6 group-hover:bg-penabur-blue group-hover:text-white transition-colors">
                    <ScanLine size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Scan QR Code</h3>
                <p className="text-gray-500 text-sm">Gunakan kamera perangkat ini untuk memindai kode QR aset.</p>
            </div>

            <div 
                onClick={() => navigate('/user/assets')}
                className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-purple-200 cursor-pointer transition-all group flex flex-col items-center text-center"
            >
                <div className="bg-purple-50 w-16 h-16 rounded-2xl flex items-center justify-center text-purple-600 mb-6 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    <Package size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Daftar Aset</h3>
                <p className="text-gray-500 text-sm">Lihat seluruh daftar aset yang tersedia dan status kondisinya.</p>
            </div>

            <div 
                onClick={() => navigate('/user/profile')}
                className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-green-200 cursor-pointer transition-all group flex flex-col items-center text-center"
            >
                <div className="bg-green-50 w-16 h-16 rounded-2xl flex items-center justify-center text-green-600 mb-6 group-hover:bg-green-600 group-hover:text-white transition-colors">
                    <User size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Profil Saya</h3>
                <p className="text-gray-500 text-sm">Kelola informasi akun dan preferensi pengguna.</p>
            </div>

        </div>

      </main>
    </div>
  );
};

export default DesktopHome;