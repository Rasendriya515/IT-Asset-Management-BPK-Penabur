import React, { useState, useEffect } from 'react';
import { User, Camera, Save, Loader2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import logoBpk from '../../assets/images/logo-bpk.png';

const BASE_URL = 'http://localhost:8000'; 

const UserProfileDesktop = () => {
  const [profile, setProfile] = useState({ email: '', full_name: '', avatar: '' });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [name, setName] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/users/me');
        setProfile(res.data);
        setName(res.data.full_name || '');
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdateName = async (e) => {
    e.preventDefault();
    try {
      await api.put('/users/me', { full_name: name });
      alert("Nama berhasil diperbarui!");
      window.location.reload(); 
    } catch (error) {
      alert("Gagal update nama");
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    setUploading(true);
    try {
      const res = await api.post('/users/me/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setProfile(prev => ({ ...prev, avatar: res.data.avatar }));
    } catch (error) { alert("Gagal upload foto"); } finally { setUploading(false); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-penabur-blue border-b border-blue-800 px-8 py-4 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-4">
            <div className="bg-white/10 p-1 rounded-lg backdrop-blur-sm"><img src={logoBpk} alt="Logo" className="h-10 w-auto" /></div>
            <h1 className="font-bold text-white text-xl leading-none">Profil Saya</h1>
        </div>
        <Link to="/user/home" className="text-white hover:bg-white/10 px-4 py-2 rounded-lg transition-all font-medium border border-white/10 flex items-center gap-2">
            <ArrowLeft size={18} /> Kembali
        </Link>
      </nav>

      <main className="flex-1 max-w-4xl w-full mx-auto p-8 flex items-center justify-center">
        <div className="bg-white p-10 rounded-2xl shadow-lg border border-gray-100 w-full flex flex-col md:flex-row gap-10 items-start">
            <div className="w-full md:w-1/3 flex flex-col items-center text-center border-r border-gray-100 pr-10">
                <div className="relative group mb-6">
                    <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-blue-50 shadow-inner bg-gray-100">
                    {profile.avatar ? (
                        <img src={`${BASE_URL}${profile.avatar}`} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400"><User size={64} /></div>
                    )}
                    </div>
                    <label className="absolute bottom-2 right-2 bg-penabur-blue text-white p-3 rounded-full cursor-pointer hover:bg-penabur-dark transition-colors shadow-lg">
                        {uploading ? <Loader2 size={20} className="animate-spin"/> : <Camera size={20} />}
                        <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={uploading} />
                    </label>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">{profile.full_name || 'User'}</h2>
                <p className="text-gray-500">{profile.email}</p>
                <span className="mt-3 inline-block bg-blue-100 text-penabur-blue px-4 py-1 rounded-full text-sm font-bold">IT Support Staff</span>
            </div>
            <div className="w-full md:w-2/3 pt-4">
                <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4">Edit Informasi</h3>
                <form onSubmit={handleUpdateName} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Nama Lengkap</label>
                        <input 
                            type="text" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            className="w-full px-5 py-4 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-penabur-blue font-medium text-lg text-gray-700 bg-gray-50 focus:bg-white transition-all"
                            placeholder="Nama Lengkap Anda"
                        />
                    </div>
                    <button className="bg-penabur-blue text-white px-8 py-4 rounded-xl font-bold hover:bg-penabur-dark flex items-center shadow-lg hover:shadow-xl transition-all active:scale-95">
                        <Save size={20} className="mr-2" /> Simpan Perubahan
                    </button>
                </form>
            </div>

        </div>
      </main>
    </div>
  );
};

export default UserProfileDesktop;