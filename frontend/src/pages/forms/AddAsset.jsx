import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, ScanBarcode, Box, Cpu, Shield, Activity, Loader2 } from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';
import api from '../../services/api';
import { ASSET_TYPES, ASSET_CATEGORIES, ASSET_SUBCATEGORIES, CITIES, FLOORS, SCHOOL_CODE_MAPPING } from '../../constants/assetData';
import { useBreadcrumb } from '../../context/BreadcrumbContext';

const AREA_MAP = {
  'BRT': 'Area Barat',
  'PST': 'Area Pusat',
  'UTR': 'Area Utara',
  'TMR': 'Area Timur',
  'SLT': 'Area Selatan',
  'TNG': 'Area Tangerang',
  'BKS': 'Area Bekasi',
  'CBR': 'Area Cibubur',
  'DPK': 'Area Depok'
};

const AddAsset = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [schoolInfo, setSchoolInfo] = useState(null);
  const [schoolCode, setSchoolCode] = useState('XXX');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setCrumbs } = useBreadcrumb();

  const [formData, setFormData] = useState({
    city_code: '01',
    type_code: '',
    category_code: '',
    subcategory_code: '',
    procurement_month: new Date().toISOString().slice(5, 7),
    procurement_year: new Date().getFullYear().toString().slice(-2),
    floor: '01',
    sequence_number: '001',
    barcode: '',
    placement: 'Indoor',
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
    status: 'Berfungsi'
  });

  useEffect(() => {
    const fetchSchool = async () => {
      try {
        const res = await api.get(`/schools/${id}`);
        const data = res.data;
        setSchoolInfo(data);
        
        const code = SCHOOL_CODE_MAPPING[data.name] || 'A01';
        setSchoolCode(code);

        let areaName = 'Area Lain';
        if (data.city_code && AREA_MAP[data.city_code.toUpperCase()]) {
          areaName = AREA_MAP[data.city_code.toUpperCase()];
        } else if (data.area_id) {
          try {
            const areaRes = await api.get(`/areas/${data.area_id}`);
            areaName = areaRes.data.name;
          } catch (e) {
            console.error(e);
          }
        }

        setCrumbs([areaName, data.name, 'Form Input']);

      } catch (error) {
        console.error("Gagal ambil info sekolah", error);
      }
    };
    fetchSchool();
  }, [id]);

  useEffect(() => {
    const { city_code, type_code, category_code, subcategory_code, procurement_month, procurement_year, floor, sequence_number } = formData;

    if (type_code && category_code) {
      let parts = [city_code, schoolCode, type_code, category_code];
      if (subcategory_code) parts.push(subcategory_code);
      parts.push(`${procurement_month}${procurement_year}`);
      parts.push(floor);
      parts.push(sequence_number);
      setFormData(prev => ({ ...prev, barcode: parts.join('-') }));
    } else {
      setFormData(prev => ({ ...prev, barcode: 'Lengkapi Data Tipe & Kategori...' }));
    }
  }, [formData.city_code, formData.type_code, formData.category_code, formData.subcategory_code, formData.procurement_month, formData.procurement_year, formData.floor, formData.sequence_number, schoolCode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.serial_number) {
      alert("Serial Number WAJIB diisi!");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        school_id: parseInt(id),
        subcategory_code: formData.subcategory_code || null,
        ip_address: formData.ip_address || null,
        mac_address: formData.mac_address || null,
        ram: formData.ram || null,
        processor: formData.processor || null,
        gpu: formData.gpu || null,
        storage: formData.storage || null,
        os: formData.os || null,
        connect_to: formData.connect_to || null,
        channel: formData.channel || null,
        username: formData.username || null,
        password: formData.password || null,
        assigned_to: formData.assigned_to || null,
      };

      await api.post('/assets/', payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      alert(`SUKSES! Aset baru berhasil disimpan.\nBarcode: ${formData.barcode}`);
      navigate(`/school/${id}`); 

    } catch (error) {
      console.error("Gagal simpan aset:", error);
      
      if (error.response && error.response.data && error.response.data.detail) {
        const detailError = error.response.data.detail;
        let errorMessage = "Ada data yang formatnya salah:\n";
        
        if (Array.isArray(detailError)) {
            detailError.forEach(err => {
                const field = err.loc ? err.loc[err.loc.length - 1] : 'unknown';
                errorMessage += `- Field '${field}': ${err.msg}\n`;
            });
        } else {
            errorMessage += JSON.stringify(detailError);
        }
        alert(errorMessage);
      } else {
        const msg = error.response?.data?.detail || "Terjadi kesalahan saat menyimpan data.";
        alert(`GAGAL SIMPAN: ${msg}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto space-y-6 pb-12"> 
        <div className="flex items-center justify-between">
          <div>
            <Link 
              to={`/school/${id}`} 
              className="inline-flex items-center px-3 py-1.5 bg-white border border-gray-300 rounded-md text-gray-600 hover:text-penabur-blue hover:border-penabur-blue transition-all shadow-sm text-sm font-medium mb-3"
            >
              <ArrowLeft size={16} className="mr-2"/> Batal & Kembali
            </Link>

            <h2 className="text-2xl font-bold text-gray-800">Input Aset Baru</h2>
            
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
                <select name="city_code" value={formData.city_code} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-penabur-blue">
                  {CITIES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Aset <span className="text-red-500">*</span></label>
                <select name="type_code" value={formData.type_code} required onChange={(e) => setFormData(prev => ({ ...prev, type_code: e.target.value, category_code: '', subcategory_code: '' }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-penabur-blue">
                  <option value="">- Pilih -</option>
                  {ASSET_TYPES.map(t => <option key={t.code} value={t.code}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori Aset<span className="text-red-500">*</span></label>
                <select name="category_code" value={formData.category_code} required disabled={!formData.type_code} onChange={(e) => setFormData(prev => ({ ...prev, category_code: e.target.value, subcategory_code: '' }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-penabur-blue disabled:bg-gray-50">
                  <option value="">- Pilih -</option>
                  {formData.type_code && ASSET_CATEGORIES[formData.type_code]?.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Aset (Opsional)</label>
                <select name="subcategory_code" value={formData.subcategory_code} disabled={!formData.category_code} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-penabur-blue disabled:bg-gray-50">
                  <option value="">- Tidak Ada -</option>
                  {formData.category_code && ASSET_SUBCATEGORIES[formData.category_code]?.map(s => <option key={s.code} value={s.code}>{s.label}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Bulan</label>
                   <select name="procurement_month" value={formData.procurement_month} onChange={handleChange} className="w-full px-2 py-2 border border-gray-300 rounded-lg outline-none">{Array.from({length: 12}, (_, i) => String(i + 1).padStart(2, '0')).map(m => <option key={m} value={m}>{m}</option>)}</select>
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Tahun</label>
                   <select name="procurement_year" value={formData.procurement_year} onChange={handleChange} className="w-full px-2 py-2 border border-gray-300 rounded-lg outline-none">{Array.from({length: 25}, (_, i) => String(i + 16).padStart(2, '0')).map(y => <option key={y} value={y}>20{y}</option>)}</select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Lantai</label>
                   <select name="floor" value={formData.floor} onChange={handleChange} className="w-full px-2 py-2 border border-gray-300 rounded-lg outline-none">{FLOORS.map(f => <option key={f} value={f}>{f}</option>)}</select>
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
                    <select name="placement" value={formData.placement} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none">
                        <option value="Indoor">Indoor</option>
                        <option value="Outdoor">Outdoor</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ruangan</label>
                    <input type="text" name="room" placeholder="Contoh: Ruang Guru" value={formData.room} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                    <input type="text" name="brand" placeholder="Contoh: Lenovo" value={formData.brand} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Model / Seri</label>
                    <input type="text" name="model_series" placeholder="Contoh: Thinkpad E14" value={formData.model_series} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"/>
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
                    <label className="block text-sm font-bold text-gray-700 mb-1">Serial Number <span className="text-red-500">*</span></label>
                    <input type="text" name="serial_number" required placeholder="Wajib Diisi" value={formData.serial_number} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">IP Address</label>
                    <input type="text" name="ip_address" placeholder="192.168.x.x" value={formData.ip_address} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">MAC Address</label>
                    <input type="text" name="mac_address" placeholder="XX:XX:XX:XX:XX" value={formData.mac_address} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"/>
                </div>
                <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">RAM</label>
                        <input type="text" name="ram" placeholder="16 GB" value={formData.ram} onChange={handleChange} className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"/>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Processor</label>
                        <input type="text" name="processor" placeholder="Intel i5" value={formData.processor} onChange={handleChange} className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"/>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Storage</label>
                        <input type="text" name="storage" placeholder="SSD 512" value={formData.storage} onChange={handleChange} className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"/>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">OS</label>
                        <input type="text" name="os" placeholder="Win 11" value={formData.os} onChange={handleChange} className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"/>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Connect To (CCTV)</label>
                    <input type="text" name="connect_to" placeholder="NVR-01" value={formData.connect_to} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Channel</label>
                    <input type="text" name="channel" placeholder="CH-1" value={formData.channel} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"/>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-red-400"></div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center"><Shield className="mr-2 text-red-400"/> 4. User & Akses</h3>
                <div className="space-y-3">
                    <input type="text" name="username" placeholder="Username / Email Aset" value={formData.username} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"/>
                    <input type="text" name="password" placeholder="Password Aset" value={formData.password} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"/>
                    <input type="text" name="assigned_to" placeholder="Digunakan Oleh (User)" value={formData.assigned_to} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"/>
                </div>
             </div>

             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center"><Activity className="mr-2 text-green-500"/> 5. Status Aset</h3>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Kondisi Saat Ini</label>
                    <select name="status" value={formData.status} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none font-bold text-gray-700">
                        <option value="Berfungsi">✅ Berfungsi Normal</option>
                        <option value="Terkendala">⚠️ Terkendala (Butuh Cek)</option>
                        <option value="Perbaikan">🔧 Sedang Perbaikan (Service)</option>
                        <option value="Rusak">❌ Rusak Total</option>
                        <option value="Dihapuskan">🗑️ Dihapuskan (Scrap)</option>
                    </select>
                </div>
             </div>
          </div>

          <div className="flex justify-end pt-6">
             <button 
               type="submit"
               disabled={isSubmitting}
               className="bg-penabur-blue text-white px-8 py-3 rounded-lg font-bold hover:bg-penabur-dark flex items-center shadow-lg transform hover:-translate-y-1 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
             >
               {isSubmitting ? <Loader2 className="mr-2 animate-spin"/> : <Save size={20} className="mr-2" />} 
               {isSubmitting ? 'MENYIMPAN...' : 'SIMPAN DATA ASET'}
             </button>
          </div>

        </form>
      </div>
    </MainLayout>
  );
};

export default AddAsset;