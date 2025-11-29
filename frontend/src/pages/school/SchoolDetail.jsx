import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Search, Plus, ArrowLeft, Download, Database, Pencil, Trash2, FileText } from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';
import api from '../../services/api';
import { ASSET_TYPES, ASSET_CATEGORIES, ASSET_SUBCATEGORIES, TABLE_COLUMNS } from '../../constants/assetData';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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

const SchoolDetail = () => {
  const { id } = useParams();
  const [assets, setAssets] = useState([]);
  const [schoolInfo, setSchoolInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [selectedType, setSelectedType] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSub, setSelectedSub] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const { setCrumbs } = useBreadcrumb();

  useEffect(() => {
    const fetchSchoolInfo = async () => {
      try {
        const res = await api.get(`/schools/${id}`);
        const data = res.data;
        setSchoolInfo(data);
        
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

        setCrumbs([areaName, data.name]);

      } catch (err) {
        console.error("Gagal load info sekolah:", err);
      }
    };
    fetchSchoolInfo();
  }, [id]);

  useEffect(() => {
    const fetchAssetData = async () => {
      setLoading(true);
      try {
        const params = {
          school_id: id,
          type_code: selectedType || undefined,
          category_code: selectedCategory || undefined
        };
        const assetRes = await api.get('/assets', { params });
        setAssets(assetRes.data);
      } catch (error) {
        console.error("Error fetching assets:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssetData();
  }, [id, selectedType, selectedCategory]);

  const getVisibleColumns = () => {
    return TABLE_COLUMNS.filter(col => {
      if (col.showAlways) return true;
      if (['IT', 'SD'].includes(selectedType) && ['ip_address', 'mac_address', 'connect_to', 'channel'].includes(col.key)) return true;
      if (['HW', 'SD'].includes(selectedType) && ['ram', 'processor', 'storage', 'os'].includes(col.key)) return true;
      return false; 
    });
  };

  const getAssetLabel = (key, value, assetContext) => {
    if (!value) return '-';
    if (key === 'type_code') {
      const found = ASSET_TYPES.find(t => t.code === value);
      return found ? found.label : value;
    }
    if (key === 'category_code') {
      const list = ASSET_CATEGORIES[assetContext.type_code]; 
      if (list) {
        const found = list.find(c => c.code === value);
        return found ? found.label : value;
      }
    }
    if (key === 'subcategory_code') {
      const list = ASSET_SUBCATEGORIES[assetContext.category_code];
      if (list) {
        const found = list.find(s => s.code === value);
        return found ? found.label : value;
      }
    }
    return value;
  };

  const handleExport = () => {
    const dataToExport = filteredAssets.map((asset, index) => {
      return {
        'No': index + 1,
        'Barcode IT': asset.barcode,
        'Serial Number': asset.serial_number,
        'Nama Aset': `${asset.brand} - ${asset.model_series}`,
        'Tipe': getAssetLabel('type_code', asset.type_code, asset),
        'Kategori': getAssetLabel('category_code', asset.category_code, asset),
        'Lokasi': `Lt. ${asset.floor} - ${asset.room}`,
        'Status': asset.status,
        'Pengguna': asset.assigned_to || '-',
        'Tahun Pengadaan': `20${asset.procurement_year}`
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const columnWidths = [
      { wch: 5 },  
      { wch: 25 }, 
      { wch: 20 }, 
      { wch: 30 },
      { wch: 15 }, 
      { wch: 15 }, 
      { wch: 20 }, 
      { wch: 15 }, 
      { wch: 20 }, 
      { wch: 15 }, 
    ];
    worksheet['!cols'] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Aset");

    const fileName = `Data_Aset_${schoolInfo ? schoolInfo.name : 'Sekolah'}_${new Date().toISOString().slice(0,10)}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF('landscape'); 

    doc.setFontSize(18);
    doc.text(`Laporan Aset: ${schoolInfo ? schoolInfo.name : 'Sekolah'}`, 14, 22);
    
    doc.setFontSize(11);
    doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`, 14, 30);

    const tableColumn = ["No", "Barcode IT", "SN", "Nama Aset", "Tipe", "Kategori", "Lokasi", "Status"];
    const tableRows = [];

    filteredAssets.forEach((asset, index) => {
      const assetData = [
        index + 1,
        asset.barcode,
        asset.serial_number,
        `${asset.brand} - ${asset.model_series}`,
        getAssetLabel('type_code', asset.type_code, asset),
        getAssetLabel('category_code', asset.category_code, asset),
        `Lt. ${asset.floor} - ${asset.room}`,
        asset.status,
      ];
      tableRows.push(assetData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      theme: 'grid',
      headStyles: { fillColor: [0, 74, 173] }, 
      styles: { fontSize: 8 },
    });

    doc.save(`Laporan_Aset_${schoolInfo ? schoolInfo.name : 'Sekolah'}.pdf`);
  };

  const handleDelete = async (assetId, assetBarcode) => {
    if (window.confirm(`Yakin ingin menghapus aset ${assetBarcode}? Data yang dihapus tidak bisa kembali.`)) {
      try {
        setLoading(true);
        await api.delete(`/assets/${assetId}`);
        
        const params = {
          school_id: id,
          type_code: selectedType || undefined,
          category_code: selectedCategory || undefined
        };
        const assetRes = await api.get('/assets', { params });
        setAssets(assetRes.data);
        
        alert("Aset berhasil dihapus!");
      } catch (error) {
        console.error("Gagal hapus:", error);
        alert("Gagal menghapus aset.");
      } finally {
        setLoading(false);
      }
    }
  };

  const visibleColumns = getVisibleColumns();

  const filteredAssets = assets.filter(asset => 
    asset.barcode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    asset.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    asset.serial_number?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Link 
              to={schoolInfo ? `/area/${schoolInfo.area_id}` : '/dashboard'} 
              className="inline-flex items-center px-3 py-1.5 bg-white border border-gray-300 rounded-md text-gray-600 hover:text-penabur-blue hover:border-penabur-blue transition-all shadow-sm text-sm font-medium mb-3"
            >
              <ArrowLeft size={16} className="mr-2"/> Kembali ke List Sekolah
            </Link>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <Database className="text-penabur-blue mr-3" />
              {schoolInfo ? `Data Aset ${schoolInfo.name}` : 'Memuat Data Sekolah...'}
            </h2>
          </div>

          <Link to={`/school/${id}/add`}>
            <button className="bg-penabur-blue text-white px-5 py-2.5 rounded-lg hover:bg-penabur-dark flex items-center shadow-lg hover:shadow-xl transition-all font-semibold">
              <Plus size={20} className="mr-2" /> Input Aset Baru
            </button>
          </Link>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari Barcode / SN..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-penabur-blue outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select 
            className="border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-penabur-blue cursor-pointer"
            value={selectedType}
            onChange={(e) => { setSelectedType(e.target.value); setSelectedCategory(''); setSelectedSub(''); }}
          >
            <option value="">Semua Tipe Aset</option>
            {ASSET_TYPES.map(t => <option key={t.code} value={t.code}>{t.label}</option>)}
          </select>
          <select 
            className="border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-penabur-blue disabled:bg-gray-100 cursor-pointer"
            disabled={!selectedType}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">Semua Kategori</option>
            {selectedType && ASSET_CATEGORIES[selectedType]?.map(c => (
              <option key={c.code} value={c.code}>{c.label}</option>
            ))}
          </select>
           <select 
            className="border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-penabur-blue disabled:bg-gray-100 cursor-pointer"
            disabled={!selectedCategory || !ASSET_SUBCATEGORIES[selectedCategory]}
            value={selectedSub}
            onChange={(e) => setSelectedSub(e.target.value)}
          >
            <option value="">Semua Jenis</option>
            {selectedCategory && ASSET_SUBCATEGORIES[selectedCategory]?.map(s => (
              <option key={s.code} value={s.code}>{s.label}</option>
            ))}
          </select>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <span className="text-gray-500 text-sm font-medium">Menampilkan {filteredAssets.length} data aset</span>
            
            <div className="flex space-x-2">
                <button 
                  onClick={handleExportPDF}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded-md text-sm flex items-center transition-colors font-medium border border-transparent hover:border-red-200"
                >
                  <FileText size={16} className="mr-2"/> Export PDF
                </button>

                <button 
                  onClick={handleExport}
                  className="text-green-600 hover:text-green-700 hover:bg-green-50 px-3 py-1 rounded-md text-sm flex items-center transition-colors font-medium border border-transparent hover:border-green-200"
                >
                  <Download size={16} className="mr-2"/> Export Excel
                </button>
            </div>
          </div>

          <div className="overflow-x-auto pb-2">
            <table className="min-w-max w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 text-gray-700 text-center uppercase font-bold text-xs tracking-wider">
                <tr>
                  <th className="p-4 border-b border-gray-200 w-10 text-center">No</th>
                  {visibleColumns.map((col) => (
                    <th key={col.key} className={`p-4 border-b border-gray-200 ${col.minWidth} ${col.key === 'status' ? 'text-center' : ''}`}>
                      {col.label}
                    </th>
                  ))}
                  <th className="p-4 border-b border-gray-200 text-center sticky right-0 bg-gray-50 shadow-l z-10 w-24">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan="100" className="p-8 text-center text-gray-500">Loading data aset...</td></tr>
                ) : filteredAssets.length === 0 ? (
                  <tr><td colSpan="100" className="p-8 text-center text-gray-500">Tidak ada data aset ditemukan.</td></tr>
                ) : (
                  filteredAssets.map((asset, index) => (
                    <tr key={asset.id} className="hover:bg-blue-50 transition-colors group">
                      <td className="p-4 text-center text-gray-400 font-medium">{index + 1}</td>
                      
                      {visibleColumns.map((col) => (
                        <td key={col.key} className={`p-4 text-gray-700 ${col.key === 'status' ? 'text-center' : ''}`}>
                          
                          {col.key === 'status' ? (
                            <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-bold border ${
                              asset.status === 'Berfungsi' ? 'bg-green-100 text-green-700 border-green-200' :
                              asset.status === 'Rusak' ? 'bg-red-100 text-red-700 border-red-200' :
                              'bg-yellow-100 text-yellow-700 border-yellow-200'
                            }`}>
                              {asset.status}
                            </span>
                          ) 
                          : col.key === 'barcode' ? (
                            <span className="font-mono font-bold text-penabur-blue">{asset[col.key]}</span>
                          ) 
                          : ['type_code', 'category_code', 'subcategory_code'].includes(col.key) ? (
                            <span className="font-medium">
                              {getAssetLabel(col.key, asset[col.key], asset)}
                            </span>
                          )
                          : (
                            asset[col.key] || <span className="text-gray-300">-</span>
                          )}
                        </td>
                      ))}

                      <td className="p-3 text-center sticky right-0 bg-white group-hover:bg-blue-50 shadow-l border-l border-gray-100 transition-colors z-10">
                        <div className="flex items-center justify-center space-x-2">
                          
                          <Link to={`/school/${id}/asset/${asset.id}/edit`}>
                            <button 
                                className="bg-yellow-50 text-yellow-700 hover:bg-yellow-500 hover:text-white border border-yellow-200 px-3 py-1.5 rounded-lg transition-all shadow-sm flex items-center text-xs font-bold"
                                title="Edit Aset"
                            >
                                <Pencil size={14} className="mr-1.5" /> Edit
                            </button>
                          </Link>

                          <button 
                            onClick={() => handleDelete(asset.id, asset.barcode)}
                            className="bg-red-50 text-red-700 hover:bg-red-600 hover:text-white border border-red-200 px-3 py-1.5 rounded-lg transition-all shadow-sm flex items-center text-xs font-bold"
                            title="Hapus Aset"
                          >
                            <Trash2 size={14} className="mr-1.5" /> Hapus
                          </button>

                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default SchoolDetail;