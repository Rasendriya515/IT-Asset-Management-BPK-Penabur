import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, AlertTriangle, MapPin, Calendar, Server, Tag, User, Loader2, Building2 } from 'lucide-react';
import api from '../../services/api';

const AREA_MAP = {
  'BRT': 'Area Barat', 'PST': 'Area Pusat', 'UTR': 'Area Utara', 'TMR': 'Area Timur',
  'SLT': 'Area Selatan', 'TNG': 'Area Tangerang', 'BKS': 'Area Bekasi', 'CBR': 'Area Cibubur', 'DPK': 'Area Depok'
};

const MobileAssetDetail = () => {
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
                try {
                    const areaRes = await api.get(`/areas/${schoolRes.data.area_id}`);
                    foundArea = areaRes.data.name;
                } catch (e) {
                    console.error(e);
                }
            }
            setAreaName(foundArea);
        }
      } catch (error) {
        console.error("Gagal load data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return (<div className="min-h-screen bg-gray-100 flex items-center justify-center"><Loader2 className="animate-spin text-penabur-blue mr-2"/> Loading...</div>);
  if (!asset) return (<div className="min-h-screen bg-gray-100 flex items-center justify-center text-gray-500">Aset tidak ditemukan.</div>);

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center font-sans">
      <div className="w-full max-w-md bg-gray-50 min-h-screen shadow-2xl relative">
        <div className="bg-penabur-blue pb-14 pt-6 px-6 rounded-b-[2rem] shadow-lg relative z-10">
            <button onClick={() => navigate('/user/home')} className="bg-white text-penabur-blue px-4 py-2 rounded-full text-sm font-bold shadow-md flex items-center mb-6 hover:bg-gray-50 hover:scale-105 active:scale-95 transition-all duration-200">
                <ArrowLeft size={16} className="mr-2" /> Kembali
            </button>
            
            <div className="flex items-start space-x-4">
                <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm flex-shrink-0 border border-white/10">
                    <Server size={32} className="text-white" />
                </div>
                <div>
                    <h1 className="text-white font-bold text-lg leading-snug">{asset.brand}</h1>
                    <p className="text-blue-100 text-sm font-medium">{asset.model_series}</p>
                    <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-white/90 text-penabur-blue shadow-sm">
                        {asset.barcode}
                    </div>
                </div>
            </div>
        </div>

        <div className="px-5 -mt-8 relative z-20 pb-10">
            <div className="bg-white p-4 rounded-2xl shadow-md border border-gray-100 flex items-center justify-between mb-5">
                <span className="text-gray-500 text-sm font-medium">Status Kondisi</span>
                <span className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center shadow-sm ${asset.status === 'Berfungsi' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {asset.status === 'Berfungsi' ? <CheckCircle size={14} className="mr-1.5"/> : <AlertTriangle size={14} className="mr-1.5"/>}
                    {asset.status}
                </span>
            </div>

            <div className="space-y-4">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-800 mb-3 text-xs uppercase tracking-wider border-b border-gray-100 pb-2 text-penabur-blue">Area & Sekolah</h3>
                    <div className="space-y-3">
                        <InfoRow icon={<Building2 size={16}/>} label="Area" value={areaName} />
                        <InfoRow icon={<Building2 size={16}/>} label="Sekolah" value={schoolName} />
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-800 mb-3 text-xs uppercase tracking-wider border-b border-gray-100 pb-2 text-penabur-blue">Lokasi & Pengguna</h3>
                    <div className="space-y-3">
                        <InfoRow icon={<MapPin size={16}/>} label="Lokasi" value={`${asset.room} (Lt. ${asset.floor})`} />
                        <InfoRow icon={<User size={16}/>} label="Pengguna" value={asset.assigned_to || '-'} />
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-800 mb-3 text-xs uppercase tracking-wider border-b border-gray-100 pb-2 text-penabur-blue">Spesifikasi Teknis</h3>
                    <div className="space-y-3">
                        <InfoRow icon={<Tag size={16}/>} label="Serial Number" value={asset.serial_number} />
                        <InfoRow icon={<Server size={16}/>} label="Processor" value={asset.processor} />
                        <InfoRow icon={<Server size={16}/>} label="RAM / Storage" value={`${asset.ram || '-'} / ${asset.storage || '-'}`} />
                        <InfoRow icon={<Server size={16}/>} label="IP Address" value={asset.ip_address} />
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-800 mb-3 text-xs uppercase tracking-wider border-b border-gray-100 pb-2 text-penabur-blue">Pengadaan</h3>
                    <div className="space-y-3">
                        <InfoRow icon={<Calendar size={16}/>} label="Waktu" value={`Bulan ${asset.procurement_month} / Tahun 20${asset.procurement_year}`} />
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({ icon, label, value }) => (
    <div className="flex items-start">
        <div className="text-gray-400 mt-0.5 mr-3 bg-gray-50 p-1.5 rounded-lg">{icon}</div>
        <div>
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">{label}</p>
            <p className="text-sm text-gray-800 font-semibold">{value || '-'}</p>
        </div>
    </div>
);

export default MobileAssetDetail;