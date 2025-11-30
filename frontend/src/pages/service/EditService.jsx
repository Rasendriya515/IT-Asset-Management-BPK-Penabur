import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Wrench, CalendarDays, Loader2 } from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';
import api from '../../services/api';

const EditService = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [masterOptions, setMasterOptions] = useState([]);

  const [formData, setFormData] = useState({
    ticket_no: '', 
    service_date: '', 
    asset_name: '', 
    sn_or_barcode: '',
    unit_name: '', 
    owner: '', 
    production_year: '',
    issue_description: '', 
    vendor: '', 
    status: ''
  });

  useEffect(() => {
    const initData = async () => {
      try {
        const masterRes = await api.get('/master');
        setMasterOptions(masterRes.data);
        const res = await api.get(`/services`); 
        const found = res.data.find(s => s.id === parseInt(id));
        
        if (found) {
            setFormData({
                ticket_no: found.ticket_no || '',
                service_date: found.service_date || '',
                asset_name: found.asset_name || '',
                sn_or_barcode: found.sn_or_barcode || '',
                unit_name: found.unit_name || '',
                owner: found.owner || '',
                production_year: found.production_year || '',
                issue_description: found.issue_description || '',
                vendor: found.vendor || '',
                status: found.status || ''
            });
        } else {
            alert("Data service tidak ditemukan");
            navigate('/service-history');
        }
      } catch (error) {
        console.error("Gagal load data", error);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, [id, navigate]);

  const getOptions = (category) => {
    return masterOptions.filter(opt => opt.category === category);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.put(`/services/${id}`, formData, {
        headers: { 'Content-Type': 'application/json' }
      });
      alert("Status Service berhasil diperbarui!");
      navigate('/service-history');
    } catch (error) {
      console.error(error);
      alert("Gagal update data service.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value});

  if (loading) return <MainLayout><div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin mr-2"/> Memuat Data...</div></MainLayout>;

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6 pb-20">
        <div className="flex items-center justify-between">
          <div>
            <Link to="/service-history" className="inline-flex items-center px-3 py-1.5 bg-white border border-gray-300 rounded-md text-gray-600 text-sm mb-3 hover:text-penabur-blue">
              <ArrowLeft size={16} className="mr-2"/> Batal & Kembali
            </Link>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <Wrench className="mr-2 text-penabur-blue" /> Edit Data Service
            </h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">No Tiket</label>
            <input type="text" name="ticket_no" value={formData.ticket_no} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg outline-none"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Service</label>
            <input type="date" name="service_date" value={formData.service_date} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg outline-none"/>
          </div>

          <div className="md:col-span-2 bg-blue-50 p-4 rounded-lg border border-blue-100">
            <label className="block text-sm font-bold text-gray-700 mb-1">Serial Number / Barcode IT <span className="text-red-500">*</span></label>
            <input type="text" required name="sn_or_barcode" value={formData.sn_or_barcode} onChange={handleChange} className="w-full px-3 py-2 border border-blue-300 rounded-lg outline-none focus:ring-2 focus:ring-penabur-blue"/>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Aset</label>
            <input type="text" name="asset_name" value={formData.asset_name} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg outline-none"/>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tahun Produksi</label>
            <div className="relative">
                <CalendarDays size={18} className="absolute left-3 top-2.5 text-gray-400"/>
                <input type="text" name="production_year" value={formData.production_year} onChange={handleChange} className="w-full pl-10 pr-3 py-2 border rounded-lg outline-none"/>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unit Kerja / Sekolah</label>
            <input type="text" name="unit_name" value={formData.unit_name} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg outline-none"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pemilik (Owner)</label>
            <input type="text" name="owner" value={formData.owner} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg outline-none"/>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Kondisi / Keluhan <span className="text-red-500">*</span></label>
            <input type="text" required maxLength="50" name="issue_description" value={formData.issue_description} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg outline-none"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vendor <span className="text-red-500">*</span></label>
            <select name="vendor" required value={formData.vendor} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg outline-none bg-white">
              <option value="">- Pilih Vendor -</option>
              {getOptions('VENDOR').map(v => <option key={v.id} value={v.label}>{v.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status <span className="text-red-500">*</span></label>
            <select name="status" required value={formData.status} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg outline-none font-bold text-gray-700 bg-white">
              <option value="">- Pilih Status -</option>
              {getOptions('SERVICE_STATUS').map(s => <option key={s.id} value={s.label}>{s.label}</option>)}
            </select>
          </div>

          <div className="md:col-span-2 flex justify-end pt-4">
             <button type="submit" disabled={isSubmitting} className="bg-yellow-500 text-white px-8 py-3 rounded-lg font-bold hover:bg-yellow-600 flex items-center shadow-lg transform hover:-translate-y-1 transition-all disabled:opacity-70">
               {isSubmitting ? <Loader2 className="animate-spin mr-2"/> : <Save size={20} className="mr-2" />} 
               UPDATE DATA SERVICE
             </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
};

export default EditService;