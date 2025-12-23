import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import logoBpk from '../../assets/images/logo-bpk.png';

const DetailRow = ({ label, value, isLast }) => (
  <div className={`flex justify-between py-2 ${!isLast ? 'border-b border-gray-100' : ''}`}>
    <span className="text-gray-500 text-xs font-medium">{label}</span>
    <span className="font-semibold text-gray-900 text-xs text-right truncate max-w-[60%]">{value || '-'}</span>
  </div>
);

const SectionHeader = ({ title }) => (
    <h3 className="text-[10px] font-bold text-blue-900 uppercase tracking-widest mb-2 mt-3 flex items-center before:block before:w-3 before:h-[2px] before:bg-blue-900 before:mr-2">
        {title}
    </h3>
);

const ScanResult = () => {
  const { id: paramValue } = useParams();
  const navigate = useNavigate();
  
  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAsset = async () => {
      if (!paramValue) {
        setError("QR Code tidak valid.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      setAsset(null);

      try {
        const safeParam = decodeURIComponent(paramValue);
        const isNumber = /^\d+$/.test(safeParam);
        let response;

        if (isNumber) {
            try {
                response = await api.get(`/assets/${safeParam}`);
            } catch (errId) {
                response = await api.get(`/assets/barcode/${safeParam}`);
            }
        } else {
            response = await api.get(`/assets/barcode/${safeParam}`);
        }

        setAsset(response.data);

      } catch (err) {
        if (err.response && err.response.status === 404) {
            setError(`Aset dengan ID/Barcode "${paramValue}" tidak ditemukan.`);
        } else {
            setError("Gagal memuat data aset.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAsset();
  }, [paramValue]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-t-blue-900 border-gray-200 mb-3"></div>
          <p className="text-blue-900 text-sm font-semibold tracking-wide animate-pulse">Memverifikasi...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl border-0 p-6 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>
            <div className="text-red-500 text-4xl mb-3 mt-2">⚠️</div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">Gagal Memuat</h2>
            <p className="text-gray-600 text-sm mb-6">{error}</p>
            <div className="flex flex-col gap-2">
                <button onClick={() => navigate('/user/scan')} className="w-full bg-blue-900 text-white font-bold py-3 text-sm rounded-lg hover:bg-blue-800 transition-all shadow-md">Scan Ulang</button>
                <button onClick={() => navigate('/user/home')} className="w-full bg-white text-gray-700 font-bold py-3 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 transition-all">Beranda</button>
            </div>
        </div>
      </div>
    );
  }

  if (!asset) return null;

  return (
    <div className="min-h-screen bg-[#eef2f6] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl overflow-hidden border border-gray-100 relative">
        
        <div className="bg-gradient-to-br from-[#0a1e3f] via-[#163363] to-[#0a1e3f] p-6 text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
            
            <div className="relative z-10 flex flex-row items-center gap-4">
                <div className="shrink-0 rounded-lg p-1 shadow-sm">
                    <img 
                        src={logoBpk} 
                        alt="Logo" 
                        className="h-12 w-auto object-contain" 
                    />
                </div>
                
                <div className="flex flex-col items-start min-w-0">
                    <h1 className="text-lg font-bold tracking-tight leading-tight truncate w-full">
                        {asset.brand}
                    </h1>
                    <p className="text-blue-200 text-xs font-medium mb-2 truncate w-full">{asset.model_series}</p>
                    
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-sm uppercase tracking-wider backdrop-blur-md bg-opacity-20 border border-white/30 ${
                        asset.status === 'Berfungsi' ? 'bg-green-500 text-green-100' : 
                        asset.status === 'Rusak' ? 'bg-red-500 text-red-100' : 'bg-yellow-500 text-yellow-100'
                    }`}>
                        <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${
                             asset.status === 'Berfungsi' ? 'bg-green-400' : 
                             asset.status === 'Rusak' ? 'bg-red-400' : 'bg-yellow-400'
                        }`}></span>
                        {asset.status}
                    </div>
                </div>
            </div>
        </div>

        <div className="px-5 py-4 bg-white">
            <SectionHeader title="Identitas" />
            <div className="bg-gray-50 rounded-xl px-4 py-2 border border-gray-100">
                <DetailRow label="Kategori" value={asset.category_name || asset.category_code} />
                <DetailRow label="Barcode" value={asset.barcode} />
                <DetailRow label="S/N" value={asset.serial_number} isLast={true} />
            </div>

            <SectionHeader title="Spesifikasi" />
            <div className="bg-gray-50 rounded-xl px-4 py-2 border border-gray-100">
                <DetailRow label="Processor" value={asset.processor} />
                <DetailRow label="RAM" value={asset.ram} />
                <DetailRow label="Storage" value={asset.storage} isLast={true} />
            </div>

            <SectionHeader title="Lokasi" />
            <div className="bg-gray-50 rounded-xl px-4 py-2 border border-gray-100">
                <DetailRow label="Ruangan" value={asset.room} />
                <DetailRow label="Posisi" value={asset.placement} />
                <DetailRow label="User" value={asset.assigned_to} isLast={true} />
            </div>

            <div className="mt-5">
                 <button 
                    onClick={() => navigate('/user/scan')}
                    className="w-full bg-[#0a1e3f] text-white font-bold text-sm py-3 rounded-xl hover:bg-[#163363] transition-all shadow-md transform active:scale-95"
                >
                    Scan Lainnya
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ScanResult;