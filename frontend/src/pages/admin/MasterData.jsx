import React, { useState, useEffect } from 'react';
import MainLayout from '../../components/layout/MainLayout';
import { Plus, Trash2, Save, Database, Filter } from 'lucide-react';
import api from '../../services/api';

const MASTER_CATEGORIES = [
  { value: 'CITY', label: 'Kota / Area' },
  { value: 'ASSET_TYPE', label: 'Tipe Aset' },
  { value: 'ASSET_CATEGORY', label: 'Kategori Aset', hasParent: true, parentCategory: 'ASSET_TYPE' },
  { value: 'ASSET_SUBCATEGORY', label: 'Jenis Aset (Sub)', hasParent: true, parentCategory: 'ASSET_CATEGORY' },
  { value: 'FLOOR', label: 'Lantai' },
  { value: 'PLACEMENT', label: 'Penempatan' },
  { value: 'ASSET_STATUS', label: 'Status Aset' },
  { value: 'VENDOR', label: 'Vendor Service' },
  { value: 'SERVICE_STATUS', label: 'Status Service' }
];

const MasterData = () => {
  const [activeCategory, setActiveCategory] = useState('CITY');
  const [options, setOptions] = useState([]);
  const [parentOptions, setParentOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    code: '',
    label: '',
    parent_code: ''
  });

  const currentCategoryDef = MASTER_CATEGORIES.find(c => c.value === activeCategory);

  const fetchOptions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/master', { params: { category: activeCategory } });
      setOptions(res.data);

      if (currentCategoryDef.hasParent) {
        const parentRes = await api.get('/master', { params: { category: currentCategoryDef.parentCategory } });
        setParentOptions(parentRes.data);
      }
    } catch (error) {
      console.error("Gagal ambil data master", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOptions();
    setFormData({ code: '', label: '', parent_code: '' });
  }, [activeCategory]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/master', {
        category: activeCategory,
        ...formData
      });
      alert("Berhasil menambah data!");
      setFormData({ code: '', label: '', parent_code: '' });
      fetchOptions();
    } catch (error) {
      alert(error.response?.data?.detail || "Gagal menyimpan data");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Yakin hapus opsi ini?")) {
      try {
        await api.delete(`/master/${id}`);
        fetchOptions();
      } catch (error) {
        alert("Gagal menghapus data");
      }
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6 pb-20">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <Database className="mr-3 text-penabur-blue" /> Master Data Dropdown
        </h2>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          <div className="flex space-x-2">
            {MASTER_CATEGORIES.map(cat => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${
                  activeCategory === cat.value 
                    ? 'bg-penabur-blue text-white shadow-md' 
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Form Input */}
          <div className="md:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
              <h3 className="font-bold text-gray-700 mb-4 flex items-center">
                <Plus size={18} className="mr-2"/> Tambah {currentCategoryDef.label}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {currentCategoryDef.hasParent && (
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">
                      Induk ({MASTER_CATEGORIES.find(c => c.value === currentCategoryDef.parentCategory)?.label})
                    </label>
                    <select 
                      required
                      className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-penabur-blue"
                      value={formData.parent_code}
                      onChange={e => setFormData({...formData, parent_code: e.target.value})}
                    >
                      <option value="">- Pilih Induk -</option>
                      {parentOptions.map(opt => (
                        <option key={opt.id} value={opt.code}>{opt.label} ({opt.code})</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Kode (Unik)</label>
                  <input 
                    required
                    type="text" 
                    placeholder="Contoh: BKS / HW / LTP"
                    className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-penabur-blue uppercase"
                    value={formData.code}
                    onChange={e => setFormData({...formData, code: e.target.value.toUpperCase().replace(/\s/g, '')})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Label (Tampilan)</label>
                  <input 
                    required
                    type="text" 
                    placeholder="Contoh: Bekasi / Hardware"
                    className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-penabur-blue"
                    value={formData.label}
                    onChange={e => setFormData({...formData, label: e.target.value})}
                  />
                </div>
                <button className="w-full bg-penabur-blue text-white py-2 rounded-lg font-bold hover:bg-penabur-dark flex justify-center items-center">
                  <Save size={16} className="mr-2"/> Simpan
                </button>
              </form>
            </div>
          </div>

          {/* Table List */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200">
                  <tr>
                    <th className="p-4">Kode</th>
                    <th className="p-4">Label</th>
                    {currentCategoryDef.hasParent && <th className="p-4">Induk</th>}
                    <th className="p-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr><td colSpan="4" className="p-6 text-center text-gray-500">Loading...</td></tr>
                  ) : options.length === 0 ? (
                    <tr><td colSpan="4" className="p-6 text-center text-gray-500">Belum ada data.</td></tr>
                  ) : (
                    options.map(opt => (
                      <tr key={opt.id} className="hover:bg-blue-50">
                        <td className="p-4 font-mono font-bold text-penabur-blue">{opt.code}</td>
                        <td className="p-4 font-medium text-gray-800">{opt.label}</td>
                        {currentCategoryDef.hasParent && (
                          <td className="p-4 text-gray-500">
                            {parentOptions.find(p => p.code === opt.parent_code)?.label || opt.parent_code || '-'}
                          </td>
                        )}
                        <td className="p-4 text-center">
                          <button 
                            onClick={() => handleDelete(opt.id)}
                            className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-full transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default MasterData;