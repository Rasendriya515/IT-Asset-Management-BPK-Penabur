import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Search, Plus, ArrowLeft, Download, Database, Pencil, Trash2, FileText, QrCode, X, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';
import api from '../../services/api';
import { TABLE_COLUMNS } from '../../constants/assetData';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useBreadcrumb } from '../../context/BreadcrumbContext';
import QRCode from 'react-qr-code';

const SchoolDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assets, setAssets] = useState([]);
  const [schoolInfo, setSchoolInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [masterData, setMasterData] = useState([]);
  
  const [selectedType, setSelectedType] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSub, setSelectedSub] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedAssetQR, setSelectedAssetQR] = useState(null);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  const { setCrumbs } = useBreadcrumb();
  const role = localStorage.getItem('role');

  useEffect(() => {
    const fetchInitData = async () => {
      try {
        const [schoolRes, masterRes] = await Promise.all([
          api.get(`/schools/${id}`),
          api.get('/master')
        ]);
        
        setSchoolInfo(schoolRes.data);
        setMasterData(masterRes.data);
        
        let areaName = 'Area Lain';
        if (schoolRes.data.area_id) {
            try {
                const areaRes = await api.get(`/areas/${schoolRes.data.area_id}`);
                areaName = areaRes.data.name;
            } catch (e) {}
        }
        setCrumbs([areaName, schoolRes.data.name]);

      } catch (err) {
        console.error(err);
      }
    };
    fetchInitData();
  }, [id]);

  const fetchAssetData = async () => {
    setLoading(true);
    try {
      const params = {
        school_id: id,
        page: page,
        size: pageSize,
        type_code: selectedType || undefined,
        category_code: selectedCategory || undefined,
        subcategory_code: selectedSub || undefined,
        search: searchQuery || undefined,
        sort_by: sortBy,
        sort_order: sortOrder
      };
      const assetRes = await api.get('/assets', { params });
      setAssets(assetRes.data.items || []);
      setTotalItems(assetRes.data.total || 0);
      setTotalPages(Math.ceil((assetRes.data.total || 0) / pageSize));
    } catch (error) {
      console.error(error);
      setAssets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchAssetData();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [id, selectedType, selectedCategory, selectedSub, searchQuery, page, pageSize, sortBy, sortOrder]);

  const getOptions = (category, parentCode = null) => {
    return masterData.filter(opt => {
        if (parentCode) return opt.category === category && opt.parent_code === parentCode;
        return opt.category === category && !opt.parent_code;
    });
  };

  const getLabel = (code, category) => {
    const found = masterData.find(m => m.category === category && m.code === code);
    return found ? found.label : code;
  };

  const handleSort = (key) => {
        if (sortBy === key) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(key);
            setSortOrder('asc');
        }
        setPage(1);
      };

  const getVisibleColumns = () => {
    return TABLE_COLUMNS.filter(col => {
      if (col.showAlways) return true;
      
      if (['ram', 'processor', 'storage', 'os'].includes(col.key)) {
        return ['HW', 'SD', 'MP'].includes(selectedType);
      }

      if (['connect_to', 'channel', 'ip_address', 'mac_address'].includes(col.key)) {
        return ['IT', 'SD'].includes(selectedType);
      }

      return false;
    });
  };

  const handleExport = () => {
    const dataToExport = assets.map((asset, index) => {
      return {
        'No': (page - 1) * pageSize + index + 1,
        'Barcode IT': asset.barcode,
        'Serial Number': asset.serial_number,
        'Nama Aset': `${asset.brand} - ${asset.model_series}`,
        'Tipe': getLabel(asset.type_code, 'ASSET_TYPE'),
        'Kategori': getLabel(asset.category_code, 'ASSET_CATEGORY'),
        'Lokasi': `Lt. ${asset.floor} - ${asset.room}`,
        'Status': asset.status,
        'Pengguna': asset.assigned_to || '-',
        'Tahun Pengadaan': `20${asset.procurement_year}`
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Aset");
    XLSX.writeFile(workbook, `Data_Aset_${schoolInfo?.name}.xlsx`);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF('landscape'); 
    doc.setFontSize(18);
    doc.text(`Laporan Aset: ${schoolInfo?.name}`, 14, 22);
    doc.setFontSize(11);
    doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`, 14, 30);

    const tableColumn = ["No", "Barcode IT", "SN", "Nama Aset", "Tipe", "Kategori", "Lokasi", "Status"];
    const tableRows = assets.map((asset, index) => [
        (page - 1) * pageSize + index + 1,
        asset.barcode,
        asset.serial_number,
        `${asset.brand} - ${asset.model_series}`,
        getLabel(asset.type_code, 'ASSET_TYPE'),
        getLabel(asset.category_code, 'ASSET_CATEGORY'),
        `Lt. ${asset.floor} - ${asset.room}`,
        asset.status,
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      theme: 'grid',
      styles: { fontSize: 8 },
    });

    doc.save(`Laporan_Aset_${schoolInfo?.name}.pdf`);
  };

  const handleDelete = async (assetId, assetBarcode) => {
    if (window.confirm(`Yakin hapus aset ${assetBarcode}?`)) {
      try {
        setLoading(true);
        await api.delete(`/assets/${assetId}`);
        fetchAssetData();
        alert("Aset berhasil dihapus!");
      } catch (error) {
        alert("Gagal menghapus aset.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleViewQR = (asset) => {
    setSelectedAssetQR(asset);
    setQrModalOpen(true);
  };

  const downloadQR = () => {
    const svg = document.getElementById("qr-code-svg");
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `QR_${selectedAssetQR.barcode}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  const getQRContent = (asset) => {
    if(!asset || !schoolInfo) return "";
    const baseUrl = window.location.origin; 
    const assetUrl = `${baseUrl}/user/asset/${asset.id}`; 
    return `BPK PENABUR ASSET\n------------------\nNama: ${asset.brand} ${asset.model_series}\nSN: ${asset.serial_number}\nBarcode: ${asset.barcode}\nSekolah: ${schoolInfo.name}\nLokasi: ${asset.room} (Lt. ${asset.floor})\nStatus: ${asset.status}\n------------------\nLink: ${assetUrl}`;
  };

  const visibleColumns = getVisibleColumns();

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Link to={schoolInfo ? `/area/${schoolInfo.area_id}` : '/dashboard'} className="inline-flex items-center px-3 py-1.5 bg-white border border-gray-300 rounded-md text-gray-600 hover:text-penabur-blue mb-3 text-sm">
              <ArrowLeft size={16} className="mr-2"/> Kembali ke Area
            </Link>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <Database className="text-penabur-blue mr-3" />
              {schoolInfo ? `Data Aset ${schoolInfo.name}` : 'Memuat...'}
            </h2>
          </div>
          {role !== 'user' && (
            <Link to={`/school/${id}/add`}>
                <button className="bg-penabur-blue text-white px-5 py-2.5 rounded-lg hover:bg-penabur-dark flex items-center shadow-lg font-semibold">
                <Plus size={20} className="mr-2" /> Input Aset Baru
                </button>
            </Link>
          )}
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari Barcode / SN..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-penabur-blue outline-none"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            />
          </div>
          <select className="border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-penabur-blue cursor-pointer" value={selectedType} onChange={(e) => { setSelectedType(e.target.value); setSelectedCategory(''); setSelectedSub(''); setPage(1); }}>
            <option value="">Semua Tipe Aset</option>
            {getOptions('ASSET_TYPE').map(t => <option key={t.code} value={t.code}>{t.label}</option>)}
          </select>
          <select className="border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-penabur-blue disabled:bg-gray-100 cursor-pointer" disabled={!selectedType} value={selectedCategory} onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}>
            <option value="">Semua Kategori</option>
            {getOptions('ASSET_CATEGORY', selectedType).map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
          </select>
           <select className="border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-penabur-blue disabled:bg-gray-100 cursor-pointer" disabled={!selectedCategory} value={selectedSub} onChange={(e) => { setSelectedSub(e.target.value); setPage(1); }}>
            <option value="">Semua Jenis</option>
            {getOptions('ASSET_SUBCATEGORY', selectedCategory).map(s => <option key={s.code} value={s.code}>{s.label}</option>)}
          </select>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <div className="flex items-center gap-4">
                <span className="text-gray-500 text-sm font-medium">Total: {totalItems} aset</span>
                <select className="border border-gray-300 rounded-lg px-2 py-1 outline-none text-xs" value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}>
                    <option value="10">10 / Hal</option>
                    <option value="25">25 / Hal</option>
                    <option value="50">50 / Hal</option>
                    <option value="100">100 / Hal</option>
                </select>
            </div>
            <div className="flex space-x-2">
                <button onClick={handleExportPDF} className="text-red-600 hover:bg-red-50 px-3 py-1 rounded-md text-sm flex items-center font-medium"><FileText size={16} className="mr-2"/> PDF</button>
                <button onClick={handleExport} className="text-green-600 hover:bg-green-50 px-3 py-1 rounded-md text-sm flex items-center font-medium"><Download size={16} className="mr-2"/> Excel</button>
            </div>
          </div>

          <div className="overflow-x-auto pb-2">
            <table className="min-w-max w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 text-gray-700 text-center uppercase font-bold text-xs tracking-wider">
                <tr>
                  <th className="p-4 border-b border-gray-200 w-10 text-center">No</th>
                  {visibleColumns.map((col) => (
                    <th key={col.key} className={`p-4 border-b border-gray-200 ${col.minWidth} cursor-pointer hover:bg-gray-100`} onClick={() => handleSort(col.key)}>
                      <div className="flex items-center gap-1">{col.label} <ArrowUpDown size={12}/></div>
                    </th>
                  ))}
                  <th className="p-4 border-b border-gray-200 text-center sticky right-0 bg-gray-50 shadow-l z-10 min-w-[150px]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan="100" className="p-8 text-center text-gray-500">Loading...</td></tr>
                ) : assets.length === 0 ? (
                  <tr><td colSpan="100" className="p-8 text-center text-gray-500">Tidak ada data.</td></tr>
                ) : (
                  assets.map((asset, index) => (
                    <tr key={asset.id} className="hover:bg-blue-50 transition-colors group">
                      <td className="p-4 text-center text-gray-400">{(page - 1) * pageSize + index + 1}</td>
                      {visibleColumns.map((col) => (
                        <td key={col.key} className="p-4 text-gray-700">
                          {col.key === 'status' ? (
                            <span className={`px-2 py-1 rounded-full text-xs font-bold border ${asset.status.toLowerCase().includes('berfungsi') ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}`}>{asset.status}</span>
                          ) : col.key === 'barcode' ? (
                            <span className="font-mono font-bold text-penabur-blue">{asset[col.key]}</span>
                          ) : (
                            asset[col.key] || '-'
                          )}
                        </td>
                      ))}
                      <td className="p-3 text-center sticky right-0 bg-white group-hover:bg-blue-50 shadow-l border-l border-gray-100 z-10">
                        <div className="flex items-center justify-center space-x-2">
                          <button onClick={() => handleViewQR(asset)} className="bg-purple-50 text-purple-700 p-2 rounded-lg" title="QR"><QrCode size={16}/></button>
                          {role !== 'user' && (
                            <>
                                <Link to={`/school/${id}/asset/${asset.id}/edit`}>
                                    <button className="bg-yellow-50 text-yellow-700 p-2 rounded-lg"><Pencil size={16}/></button>
                                </Link>
                                {role === 'admin' && (
                                    <button onClick={() => handleDelete(asset.id, asset.barcode)} className="bg-red-50 text-red-700 p-2 rounded-lg"><Trash2 size={16}/></button>
                                )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          <div className="flex items-center justify-between p-4 border-t border-gray-100 bg-gray-50">
            <div className="text-xs text-gray-500 font-medium">Halaman {page} dari {totalPages}</div>
            <div className="flex gap-2">
                <button disabled={page === 1} onClick={() => setPage(prev => Math.max(prev - 1, 1))} className="p-2 bg-white border rounded-lg hover:bg-gray-100 disabled:opacity-50"><ChevronLeft size={16} /></button>
                <button disabled={page === totalPages || totalPages === 0} onClick={() => setPage(prev => Math.min(prev + 1, totalPages))} className="p-2 bg-white border rounded-lg hover:bg-gray-100 disabled:opacity-50"><ChevronRight size={16} /></button>
            </div>
          </div>
        </div>
      </div>

      {qrModalOpen && selectedAssetQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-penabur-blue p-4 flex justify-between items-center text-white">
              <h3 className="font-bold text-lg flex items-center"><QrCode className="mr-2" /> QR Code Aset</h3>
              <button onClick={() => setQrModalOpen(false)} className="hover:bg-white/20 p-1 rounded-full"><X size={20} /></button>
            </div>
            <div className="p-8 flex flex-col items-center justify-center space-y-6">
              <div className="bg-white p-4 rounded-xl border-4 border-gray-100 shadow-inner">
                <QRCode id="qr-code-svg" value={getQRContent(selectedAssetQR)} size={200} level="H" />
              </div>
              <div className="text-center space-y-1">
                <p className="font-bold text-gray-800 text-lg">{selectedAssetQR.brand}</p>
                <p className="text-penabur-blue font-mono font-medium">{selectedAssetQR.barcode}</p>
              </div>
              <button onClick={downloadQR} className="w-full bg-penabur-blue text-white py-2.5 rounded-lg font-bold hover:bg-penabur-dark flex items-center justify-center shadow-lg">
                  <Download size={18} className="mr-2" /> Download Gambar
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default SchoolDetail;