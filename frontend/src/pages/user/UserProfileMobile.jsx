import React, { useState, useEffect } from 'react';
import { User, Camera, Save, Loader2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const BASE_URL = 'http://localhost:8000'; 

const UserProfile = () => {
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
      const res = await api.post('/users/me/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setProfile(prev => ({ ...prev, avatar: res.data.avatar }));
    } catch (error) {
      alert("Gagal upload foto");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-100">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center">
      <div className="w-full max-w-md bg-white min-h-screen shadow-2xl relative flex flex-col">
        <div className="bg-penabur-blue p-6 flex items-center text-white shadow-md">
            <Link to="/user/home" className="mr-4 hover:bg-white/20 p-2 rounded-full transition-colors">
                <ArrowLeft size={20} />
            </Link>
            <h2 className="text-lg font-bold">Profil Saya</h2>
        </div>

        <div className="p-8 flex-1 flex flex-col items-center">
          <div className="relative group mb-6">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-50 shadow-inner bg-gray-100">
              {profile.avatar ? (
                <img src={`${BASE_URL}${profile.avatar}`} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400"><User size={48} /></div>
              )}
            </div>
            <label className="absolute bottom-0 right-0 bg-penabur-blue text-white p-2 rounded-full cursor-pointer hover:bg-penabur-dark transition-colors shadow-lg">
              {uploading ? <Loader2 size={16} className="animate-spin"/> : <Camera size={16} />}
              <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={uploading} />
            </label>
          </div>

          <div className="text-center w-full mb-8">
            <p className="text-gray-500 text-sm font-medium">{profile.email}</p>
            <div className="mt-2 inline-block bg-blue-50 text-penabur-blue text-xs px-3 py-1 rounded-full font-bold uppercase">
                IT Support
            </div>
          </div>
          <form onSubmit={handleUpdateName} className="w-full space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Nama Lengkap</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-penabur-blue font-medium text-gray-700 bg-gray-50 focus:bg-white transition-all"
                placeholder="Nama Lengkap Anda"
              />
            </div>
            
            <button className="w-full bg-penabur-blue text-white py-3.5 rounded-xl font-bold hover:bg-penabur-dark flex justify-center items-center shadow-lg hover:shadow-xl transition-all active:scale-95">
              <Save size={18} className="mr-2" /> Simpan Perubahan
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};

export default UserProfile;