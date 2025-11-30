import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Wrench, Calendar, Tag, Pencil } from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';
import api from '../../services/api';
import { useBreadcrumb } from '../../context/BreadcrumbContext';

const ServiceHistory = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { setCrumbs } = useBreadcrumb();

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await api.get('/services', { params: { search: search || undefined } });
      setServices(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCrumbs(['Service History']);
    fetchServices();
  }, [search]);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <Wrench className="text-penabur-blue mr-2" /> Riwayat Service
            </h2>
            <p className="text-gray-500 text-lg mt-1">Logbook perbaikan aset IT.</p>
          </div>
          <Link to="/service-history/add">
            <button className="bg-penabur-blue text-white px-4 py-2 rounded-lg hover:bg-penabur-dark flex items-center shadow-md">
              <Plus size={18} className="mr-2" /> Input Service Baru
            </button>
          </Link>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <Search className="text-gray-400 mr-2" size={20} />
          <input 
            type="text" 
            placeholder="Cari No Tiket atau SN/Barcode..." 
            className="w-full outline-none text-gray-700"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="overflow-x-auto pb-4">
            <table className="min-w-max w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 text-gray-700 text-center uppercase font-bold text-xs">
                <tr>
                  <th className="p-4 border-b w-10 text-center">No</th>
                  <th className="p-4 border-b">No Tiket</th>
                  <th className="p-4 border-b">Tanggal</th>
                  <th className="p-4 border-b">Nama Aset</th>
                  <th className="p-4 border-b">SN / Barcode</th>
                  <th className="p-4 border-b">Thn Prod</th>
                  <th className="p-4 border-b">Lokasi / Unit</th>
                  <th className="p-4 border-b">Owner</th>
                  <th className="p-4 border-b">Kondisi</th>
                  <th className="p-4 border-b">Vendor</th>
                  <th className="p-4 border-b text-center">Status</th>
                  <th className="p-4 border-b text-center sticky right-0 bg-gray-50 shadow-l">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan="12" className="p-6 text-center text-gray-500">Loading...</td></tr>
                ) : services.length === 0 ? (
                  <tr><td colSpan="12" className="p-6 text-center text-gray-500">Belum ada data service.</td></tr>
                ) : (
                  services.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-blue-50 group">
                      <td className="p-4 text-center text-gray-500">{idx + 1}</td>
                      
                      <td className="p-4 font-bold text-penabur-blue">{item.ticket_no || '-'}</td>
                      
                      <td className="p-4 text-gray-600">
                        {item.service_date || '-'}
                      </td>
                      
                      <td className="p-4 font-medium text-gray-800">
                        {item.asset_name || '-'}
                      </td>
                      
                      <td className="p-4">
                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 border border-gray-200">
                            {item.sn_or_barcode}
                        </span>
                      </td>

                      <td className="p-4 text-gray-600 text-center">
                        {item.production_year || '-'}
                      </td>
                      
                      <td className="p-4 text-gray-600">
                        {item.unit_name || '-'}
                      </td>
                      
                      <td className="p-4 text-gray-600">
                        {item.owner || '-'}
                      </td>
                      
                      <td className="p-4 text-red-600 font-medium max-w-xs truncate" title={item.issue_description}>
                        {item.issue_description}
                      </td>
                      
                      <td className="p-4 text-gray-600">
                        {item.vendor}
                      </td>
                      
                      <td className="p-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                          (item.status.includes('Clear') || item.status.includes('Selesai')) ? 'bg-green-100 text-green-700 border-green-200' :
                          (item.status.includes('Progress') || item.status.includes('Sedang')) ? 'bg-blue-100 text-blue-700 border-blue-200' :
                          item.status.includes('GARANSI') ? 'bg-purple-100 text-purple-700 border-purple-200' :
                          'bg-yellow-100 text-yellow-700 border-yellow-200' // Default fallback (MEMO / Lainnya)
                        }`}>
                          {item.status}
                      </span>
                      </td>

                      <td className="p-3 text-center sticky right-0 bg-white group-hover:bg-blue-50 shadow-l border-l border-gray-100 transition-colors">
                        <Link to={`/service-history/edit/${item.id}`}>
                            <button 
                                className="bg-yellow-50 text-yellow-700 hover:bg-yellow-500 hover:text-white border border-yellow-200 px-3 py-1.5 rounded-lg transition-all shadow-sm flex items-center text-xs font-bold"
                                title="Edit Service"
                            >
                                <Pencil size={14} className="mr-1.5" /> Edit
                            </button>
                        </Link>
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

export default ServiceHistory;