import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, ScanBarcode, Box, Cpu, Shield, Activity, Loader2 } from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';
import api from '../../services/api';
import { SCHOOL_CODE_MAPPING } from '../../constants/assetData';
import { useBreadcrumb } from '../../context/BreadcrumbContext';

const EditAsset = () => {
  const { schoolId, assetId } = useParams();
  const navigate = useNavigate();
  const { setCrumbs } = useBreadcrumb();

  const [schoolInfo, setSchoolInfo] = useState(null);
  const [schoolCode, setSchoolCode] = useState('XXX');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const [masterOptions, setMasterOptions] = useState([]);

  const [formData, setFormData] = useState({
    city_code: '',
    type_code: '',
    category_code: '',
    subcategory_code: '',
    procurement_month: '',
    procurement_year: '',
    floor: '',
    sequence_number: '',
    barcode: '',
    placement: '',
    brand: '',
    room: '',
    model_series: '',
    serial_number: '',
    ip_address: '',
    mac_address: '',
    ram: '',
    processor: '',
    gpu: '',
    storage: '',
    os: '',
    connect_to: '',
    channel: '',
    username: '',
    password: '',
    assigned_to: '',
    status: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const masterRes = await api.get('/master');
        setMasterOptions(masterRes.data);

        const schoolRes = await api.get(`/schools/${schoolId}`);
        setSchoolInfo(schoolRes.data);
        setSchoolCode(SCHOOL_CODE_MAPPING[schoolRes.data.name] || 'A01');

        setCrumbs(['Loading...', schoolRes.data.name, 'Form Edit']); 

        const assetRes = await api.get(`/assets/${assetId}`);
        const data = assetRes.data;

        setFormData({
            ...data,
            subcategory_code: data.subcategory_code || '',
            ip_address: data.ip_address || '',
            mac_address: data.mac_address || '',
            ram: data.ram || '',
            processor: data.processor || '',
            gpu: data.gpu || '',
            storage: data.storage || '',
            os: data.os || '',
            connect_to: data.connect_to || '',
            channel: data.channel || '',
            username: data.username || '',
            password: data.password || '',
            assigned_to: data.assigned_to || '',
        });

      } catch (error) {
        console.error(error);
        alert("Data aset tidak ditemukan!");
        navigate(`/school/${schoolId}`);
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, [schoolId, assetId, navigate]);

  const getOptions = (category, parentCode = null) => {
    return masterOptions.filter(opt => {
        if (parentCode) return opt.category === category && opt.parent_code === parentCode;
        return opt.category === category && !opt.parent_code;
    });
  };
  useEffect(() => {
    if (!loadingData) {
        const { city_code, type_code, category_code, subcategory_code, procurement_month, procurement_year, floor, sequence_number } = formData;
        
        if (city_code && type_code && category_code && floor) {
          let parts = [city_code, schoolCode, type_code, category_code];
          if (subcategory_code) parts.push(subcategory_code);
          parts.push(`${procurement_month}${procurement_year}`);
          parts.push(floor);
          parts.push(sequence_number);
          setFormData(prev => ({ ...prev, barcode: parts.join('-') }));
        }
    }
  }, [formData.city_code, formData.type_code, formData.category_code, formData.subcategory_code, formData.procurement_month, formData.procurement_year, formData.floor, formData.sequence_number, schoolCode, loadingData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.put(`/assets/${assetId}`, formData, {
        headers: { 'Content-Type': 'application/json' }
      });
      alert(`SUKSES! Data aset berhasil diperbarui.`);
      navigate(`/school/${schoolId}`);
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.detail || "Gagal mengupdate data aset.";
      alert(`GAGAL UPDATE: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingData) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-penabur-blue" size={40}/></div>;

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto space-y-6 pb-12">
        <div className="flex items-center justify-between">
          <div>
            <Link to={`/school/${schoolId}`} className="inline-flex items-center px-3 py-1.5 bg-white border border-gray-300 rounded-md text-gray-600 hover:text-penabur-blue mb-3 text-sm">
              <ArrowLeft size={16} className="mr-2"/> Batal & Kembali
            </Link>
            <h2 className="text-2xl font-bold text-gray-800">Edit Data Aset</h2>
            <p className="text-gray-500 text-lg mt-1">
              Unit Kerja: <span className="font-bold text-penabur-blue">{schoolInfo ? schoolInfo.name : 'Loading...'} ({schoolCode})</span>
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-penabur-blue"></div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-800 flex items-center">
                <ScanBarcode className="mr-2 text-penabur-blue" /> 1. Identitas & Barcode
              </h3>
              <div className="bg-gray-800 text-white px-4 py-2 rounded-lg font-mono text-lg tracking-wider shadow-inner border border-gray-600">
                {formData.barcode}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kota</label>
                <select name="city_code" value={formData.city_code} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-penabur-blue bg-white">
                  {getOptions('CITY').map(opt => <option key={opt.id} value={opt.code}>{opt.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Aset</label>
                <select name="type_code" value={formData.type_code} required onChange={(e) => setFormData(prev => ({ ...prev, type_code: e.target.value, category_code: '', subcategory_code: '' }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-penabur-blue bg-white">
                  {getOptions('ASSET_TYPE').map(opt => <option key={opt.id} value={opt.code}>{opt.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                <select name="category_code" value={formData.category_code} required disabled={!formData.type_code} onChange={(e) => setFormData(prev => ({ ...prev, category_code: e.target.value, subcategory_code: '' }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-penabur-blue disabled:bg-gray-50 bg-white">
                  {getOptions('ASSET_CATEGORY', formData.type_code).map(opt => <option key={opt.id} value={opt.code}>{opt.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jenis (Opsional)</label>
                <select name="subcategory_code" value={formData.subcategory_code} disabled={!formData.category_code} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-penabur-blue disabled:bg-gray-50 bg-white">
                  <option value="">- Tidak Ada -</option>
                  {getOptions('ASSET_SUBCATEGORY', formData.category_code).map(opt => <option key={opt.id} value={opt.code}>{opt.label}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Bulan</label>
                   <select name="procurement_month" value={formData.procurement_month} onChange={handleChange} className="w-full px-2 py-2 border border-gray-300 rounded-lg outline-none bg-white">{Array.from({length: 12}, (_, i) => String(i + 1).padStart(2, '0')).map(m => <option key={m} value={m}>{m}</option>)}</select>
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Tahun</label>
                   <select name="procurement_year" value={formData.procurement_year} onChange={handleChange} className="w-full px-2 py-2 border border-gray-300 rounded-lg outline-none bg-white">{Array.from({length: 25}, (_, i) => String(i + 16).padStart(2, '0')).map(y => <option key={y} value={y}>20{y}</option>)}</select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Lantai</label>
                   <select name="floor" value={formData.floor} onChange={handleChange} className="w-full px-2 py-2 border border-gray-300 rounded-lg outline-none bg-white">
                      {getOptions('FLOOR').map(opt => <option key={opt.id} value={opt.code}>{opt.label}</option>)}
                   </select>
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">No Urut</label>
                   <input type="text" name="sequence_number" maxLength="3" value={formData.sequence_number} onChange={(e) => setFormData(prev => ({...prev, sequence_number: e.target.value.replace(/\D/g, '')}))} onBlur={() => setFormData(prev => ({...prev, sequence_number: prev.sequence_number.padStart(3, '0')}))} className="w-full px-2 py-2 border border-gray-300 rounded-lg outline-none text-center font-mono"/>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-1 h-full bg-penabur-gold"></div>
             <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <Box className="mr-2 text-penabur-gold" /> 2. Detail Fisik
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Penempatan</label>
                    <select name="placement" value={formData.placement} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none bg-white">
                        {getOptions('PLACEMENT').map(opt => <option key={opt.id} value={opt.label}>{opt.label}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ruangan</label>
                    <input type="text" name="room" value={formData.room} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                    <input type="text" name="brand" value={formData.brand} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Model / Seri</label>
                    <input type="text" name="model_series" value={formData.model_series} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"/>
                </div>
             </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
             <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <Cpu className="mr-2 text-indigo-500" /> 3. Spesifikasi & Network
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                    <label className="block text-sm font-bold text-gray-700 mb-1">Serial Number</label>
                    <input type="text" name="serial_number" required value={formData.serial_number} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">IP Address</label>
                    <input type="text" name="ip_address" value={formData.ip_address} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">MAC Address</label>
                    <input type="text" name="mac_address" value={formData.mac_address} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"/>
                </div>
                <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">RAM</label>
                        <input type="text" name="ram" value={formData.ram} onChange={handleChange} className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"/>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Processor</label>
                        <input type="text" name="processor" value={formData.processor} onChange={handleChange} className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"/>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Storage</label>
                        <input type="text" name="storage" value={formData.storage} onChange={handleChange} className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"/>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">OS</label>
                        <input type="text" name="os" value={formData.os} onChange={handleChange} className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"/>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Connect To</label>
                    <input type="text" name="connect_to" value={formData.connect_to} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Channel</label>
                    <input type="text" name="channel" value={formData.channel} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"/>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-red-400"></div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center"><Shield className="mr-2 text-red-400"/> 4. User & Akses</h3>
                <div className="space-y-3">
                    <input type="text" name="username" placeholder="Username" value={formData.username} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"/>
                    <input type="text" name="password" placeholder="Password" value={formData.password} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"/>
                    <input type="text" name="assigned_to" placeholder="Pengguna" value={formData.assigned_to} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"/>
                </div>
             </div>

             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center"><Activity className="mr-2 text-green-500"/> 5. Status Aset</h3>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Kondisi Saat Ini</label>
                    <select name="status" value={formData.status} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none font-bold text-gray-700 bg-white">
                        {getOptions('ASSET_STATUS').map(opt => <option key={opt.id} value={opt.label}>{opt.label}</option>)}
                    </select>
                </div>
             </div>
          </div>

          <div className="flex justify-end pt-6">
             <button 
               type="submit"
               disabled={isSubmitting}
               className="bg-yellow-500 text-white px-8 py-3 rounded-lg font-bold hover:bg-yellow-600 flex items-center shadow-lg transform hover:-translate-y-1 transition-all disabled:opacity-70"
             >
               {isSubmitting ? <Loader2 className="mr-2 animate-spin"/> : <Save size={20} className="mr-2" />} 
               UPDATE DATA ASET
             </button>
          </div>

        </form>
      </div>
    </MainLayout>
  );
};

export default EditAsset;