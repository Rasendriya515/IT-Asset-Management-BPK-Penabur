import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, AlertTriangle, MapPin, Calendar, Server, Tag, User, Loader2, Building2 } from 'lucide-react';
import api from '../../services/api';
import logoBpk from '../../assets/images/logo-bpk.png';

const AREA_MAP = { 'BRT': 'Area Barat', 'PST': 'Area Pusat', 'UTR': 'Area Utara', 'TMR': 'Area Timur', 'SLT': 'Area Selatan', 'TNG': 'Area Tangerang', 'BKS': 'Area Bekasi', 'CBR': 'Area Cibubur', 'DPK': 'Area Depok', 'LPS': 'Area Lapis' };

const DesktopAssetDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [schoolName, setSchoolName] = useState('-');
  const [areaName, setAreaName] = useState('-');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const assetRes = await api.get(`/assets/${id}`);
        setAsset(assetRes.data);

        if (assetRes.data.school_id) {
            const schoolRes = await api.get(`/schools/${assetRes.data.school_id}`);
            setSchoolName(schoolRes.data.name);
            let foundArea = '-';
            if (schoolRes.data.city_code && AREA_MAP[schoolRes.data.city_code.toUpperCase()]) {
                foundArea = AREA_MAP[schoolRes.data.city_code.toUpperCase()];
            } else if (schoolRes.data.area_id) {
                try { const areaRes = await api.get(`/areas/${schoolRes.data.area_id}`); foundArea = areaRes.data.name; } catch (e) {}
            }
            setAreaName(foundArea);
        }
      } catch (error) { console.error(error); } finally { setLoading(false); }
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><Loader2 className="animate-spin text-penabur-blue mr-2"/> Loading Data...</div>;
  if (!asset) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Aset tidak ditemukan.</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-penabur-blue border-b border-blue-800 px-8 py-4 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-4">
            <div className="bg-white/10 p-1 rounded-lg backdrop-blur-sm"><img src={logoBpk} alt="Logo" className="h-8 w-auto" /></div>
            <h1 className="font-bold text-white text-lg">Detail Aset</h1>
        </div>
        {/* FIX: Navigate back to asset list instead of home */}
        <button onClick={() => navigate('/user/assets')} className="bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-colors flex items-center text-sm font-medium">
            <ArrowLeft size={16} className="mr-2" /> Kembali
        </button>
      </nav>

      <main className="flex-1 max-w-5xl w-full mx-auto p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="md:col-span-1 space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
                    <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center text-penabur-blue mx-auto mb-4">
                        <Server size={40} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">{asset.brand}</h2>
                    <p className="text-gray-500 font-medium">{asset.model_series}</p>
                    <div className="mt-4 bg-gray-100 py-2 px-4 rounded-lg font-mono text-penabur-blue font-bold text-sm inline-block border border-gray-200">
                        {asset.barcode}
                    </div>
                    
                    {/* FIX: Improved status color logic */}
                    <div className={`mt-6 py-2 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 ${
                        asset.status && (asset.status.toLowerCase().includes('berfungsi') || asset.status.toLowerCase().includes('ok') || asset.status.toLowerCase().includes('baik')) 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                        {asset.status && (asset.status.toLowerCase().includes('berfungsi') || asset.status.toLowerCase().includes('ok') || asset.status.toLowerCase().includes('baik')) 
                            ? <CheckCircle size={16}/> 
                            : <AlertTriangle size={16}/>
                        }
                        {asset.status}
                    </div>
                </div>
            </div>

            <div className="md:col-span-2 space-y-6">
                
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-800 mb-6 text-sm uppercase tracking-wider border-b pb-3">Informasi Lokasi</h3>
                    <div className="grid grid-cols-2 gap-6">
                        <InfoItem label="Area" value={areaName} icon={<Building2 size={18}/>} />
                        <InfoItem label="Sekolah" value={schoolName} icon={<Building2 size={18}/>} />
                        <InfoItem label="Ruangan" value={`${asset.room} (Lt. ${asset.floor})`} icon={<MapPin size={18}/>} />
                        <InfoItem label="Pengguna Saat Ini" value={asset.assigned_to || '-'} icon={<User size={18}/>} />
                    </div>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-800 mb-6 text-sm uppercase tracking-wider border-b pb-3">Spesifikasi Teknis</h3>
                    <div className="grid grid-cols-2 gap-6">
                        <InfoItem label="Serial Number" value={asset.serial_number} icon={<Tag size={18}/>} />
                        <InfoItem label="Processor" value={asset.processor} icon={<Server size={18}/>} />
                        <InfoItem label="RAM" value={asset.ram} icon={<Server size={18}/>} />
                        <InfoItem label="Storage" value={asset.storage} icon={<Server size={18}/>} />
                        <InfoItem label="IP Address" value={asset.ip_address} icon={<Server size={18}/>} />
                        <InfoItem label="Tanggal Pengadaan" value={`Bulan ${asset.procurement_month} / ${asset.procurement_year}`} icon={<Calendar size={18}/>} />
                    </div>
                </div>

            </div>
        </div>
      </main>
    </div>
  );
};

const InfoItem = ({ label, value, icon }) => (
    <div>
        <div className="flex items-center gap-2 text-gray-400 mb-1">
            {icon}
            <span className="text-xs font-bold uppercase tracking-wide">{label}</span>
        </div>
        <p className="text-gray-800 font-semibold text-base pl-7">{value || '-'}</p>
    </div>
);

export default DesktopAssetDetail;