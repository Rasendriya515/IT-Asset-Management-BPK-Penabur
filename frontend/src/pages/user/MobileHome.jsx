import React, { useState, useEffect } from 'react';
import { LogOut, ScanLine, Search, Package, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const BASE_URL = 'http://localhost:8000';

const MobileHome = () => {
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
    <div className="min-h-screen bg-gray-100 flex justify-center">
      <div className="w-full max-w-md bg-gray-50 min-h-screen shadow-2xl relative">
        
        <div className="bg-penabur-blue p-8 pb-12 rounded-b-[2.5rem] shadow-md relative z-10">
          <div className="flex justify-between items-center text-white">
            
            <div 
                onClick={() => navigate('/user/profile')}
                className="flex items-center gap-3 cursor-pointer hover:bg-white/10 p-2 -ml-2 rounded-xl transition-all"
            >
                <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-white/30 bg-white flex items-center justify-center flex-shrink-0">
                    {user.avatar ? (
                        <img src={`${BASE_URL}${user.avatar}`} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                        <User className="text-gray-400" size={20} />
                    )}
                </div>
                <div>
                    <p className="text-blue-200 text-[10px] font-medium mb-0.5">Selamat Datang,</p>
                    <h2 className="text-sm font-bold leading-tight">{user.full_name || 'User'}</h2>
                    <div className="flex items-center gap-1 mt-0.5">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                        <p className="text-[10px] text-blue-100 font-medium">Online</p>
                    </div>
                </div>
            </div>
            
            <button 
                onClick={handleLogout} 
                className="bg-red-600 text-white px-3 py-2 rounded-xl hover:bg-red-700 transition-all duration-200 hover:shadow-lg active:scale-95 flex items-center gap-2 font-bold text-xs border border-red-500 flex-shrink-0 ml-2"
                title="Sign Out"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>

          <div className="mt-8 -mb-16">
              <div className="bg-white p-4 rounded-2xl shadow-lg flex items-center border border-gray-100">
                  <Search className="text-gray-400 mr-3" size={20} />
                  <input 
                      type="text" 
                      placeholder="Cari SN / Barcode..." 
                      className="w-full outline-none text-gray-700 placeholder-gray-400 font-medium"
                  />
              </div>
          </div>
        </div>

        <div className="px-6 pt-20 pb-10">
          <h3 className="font-bold text-gray-800 mb-6 text-lg">Aktivitas Utama</h3>
          
          <div className="grid grid-cols-2 gap-5">
              
              <button onClick={() => navigate('/user/scan')} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-4 hover:shadow-md hover:scale-[1.02] transition-all group cursor-pointer h-40">
                  <div className="bg-blue-50 text-penabur-blue p-4 rounded-2xl group-hover:bg-penabur-blue group-hover:text-white transition-colors">
                      <ScanLine size={32} strokeWidth={2.5} />
                  </div>
                  <span className="font-bold text-gray-700 text-sm">Scan QR Code</span>
              </button>

              <button onClick={() => navigate('/user/assets')} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-4 hover:shadow-md hover:scale-[1.02] transition-all group cursor-pointer h-40">
                  <div className="bg-purple-50 text-purple-600 p-4 rounded-2xl group-hover:bg-purple-600 group-hover:text-white transition-colors">
                      <Package size={32} strokeWidth={2.5} />
                  </div>
                  <span className="font-bold text-gray-700 text-sm">Daftar Aset</span>
              </button>

              <button onClick={() => navigate('/user/profile')} className="col-span-2 bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between px-8 hover:shadow-md hover:scale-[1.01] transition-all group cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="bg-green-50 text-green-600 p-3 rounded-2xl group-hover:bg-green-600 group-hover:text-white transition-colors">
                        <User size={24} strokeWidth={2.5} />
                    </div>
                    <div className="text-left">
                        <p className="font-bold text-gray-800">Profil Saya</p>
                        <p className="text-xs text-gray-400">Pengaturan Akun</p>
                    </div>
                  </div>
                  <div className="text-gray-300 group-hover:text-penabur-blue transition-colors">
                      ➔
                  </div>
              </button>
          </div>
        </div>

        <div className="absolute bottom-6 w-full text-center">
            <p className="text-[10px] text-gray-400 font-medium">IT Asset Management Mobile v1.0<br/>&copy; BPK PENABUR</p>
        </div>
      </div>
    </div>
  );
};

export default MobileHome;