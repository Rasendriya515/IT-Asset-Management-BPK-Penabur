import React, { useEffect, useState } from 'react';
import MainLayout from '../../components/layout/MainLayout';
import { Monitor, Database, TrendingUp, AlertCircle, Calendar, Loader2 } from 'lucide-react';
import api from '../../services/api';
import { Link } from 'react-router-dom';
import { useBreadcrumb } from '../../context/BreadcrumbContext';

const StatCard = ({ title, count, icon, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-sm font-medium">{title}</p>
        <h3 className="text-2xl font-bold text-gray-800 mt-1">{count}</h3>
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        {icon}
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { setCrumbs } = useBreadcrumb();

  useEffect(() => {
    setCrumbs(['Dashboard']);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard/stats');
        setStats(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
        <MainLayout>
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="animate-spin text-penabur-blue mr-2" /> Memuat Data Dashboard...
            </div>
        </MainLayout>
    );
  }

  const chartValues = stats ? Object.values(stats.chart_data) : [];
  const maxChartValue = Math.max(...chartValues, 1);

  return (
    <MainLayout>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">IT Asset Management - BPK Penabur</h2>
          <div className="text-sm text-gray-500 flex items-center bg-white px-3 py-1 rounded-lg border border-gray-200">
            <Calendar size={14} className="mr-2"/> 
            Data Realtime
          </div>
        </div>

        {/* 1. Baris Statistik */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Aset" 
            count={stats.total_assets} 
            icon={<Database size={24} className="text-blue-600"/>} 
            color="bg-blue-100" 
          />
          <StatCard 
            title="Aset Hardware" 
            count={stats.total_hardware} 
            icon={<Monitor size={24} className="text-purple-600"/>} 
            color="bg-purple-100" 
          />
          <StatCard 
            title="Perlu Perhatian" 
            count={stats.need_attention} 
            icon={<AlertCircle size={24} className="text-red-600"/>} 
            color="bg-red-100" 
          />
          <StatCard 
            title="Aset Baru (Bln Ini)" 
            count={chartValues[new Date().getMonth()] || 0} 
            icon={<TrendingUp size={24} className="text-green-600"/>} 
            color="bg-green-100" 
          />
        </div>

        {/* 2. Baris Chart & Recent History */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Chart Pengadaan Per Bulan */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-4">Statistik Pengadaan Aset (Berdasarkan Bulan)</h3>
            <div className="h-64 bg-gray-50 rounded-lg flex items-end justify-around p-4 border border-dashed border-gray-300">
              
              {["01","02","03","04","05","06","07","08","09","10","11","12"].map((monthKey, index) => {
                const count = stats.chart_data[monthKey] || 0;
                const numCount = parseInt(count); 
                
                let heightPercent = 0;
                if (numCount > 0) {
                    heightPercent = (numCount / maxChartValue) * 80 + 5;
                } else {
                    heightPercent = 5; 
                }

                const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
                
                return (
                  <div key={monthKey} className="group relative w-full mx-1 flex flex-col justify-end items-center h-full">
                    <div className="absolute bottom-full mb-2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      {numCount} Unit
                    </div>
                    <div 
                        className={`w-full max-w-[40px] rounded-t-md transition-all duration-500 ${numCount > 0 ? 'bg-blue-600 hover:bg-blue-800' : 'bg-gray-200'}`}
                        style={{ height: `${heightPercent}%` }}
                    ></div>
                    <span className="text-[10px] text-gray-500 mt-2 font-medium">{monthNames[index]}</span>
                  </div>
                );
              })}

            </div>
          </div>

          {/* Recent Updates (Dengan Detail Area & Sekolah) */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-full">
            <h3 className="font-bold text-gray-800 mb-4">Aset Terbaru Ditambahkan</h3>
            <div className="space-y-4 flex-1 overflow-y-auto pr-2 max-h-[300px]">
              {stats.recent_assets.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">Belum ada aktivitas.</p>
              ) : (
                stats.recent_assets.map((asset) => (
                    <div key={asset.id} className="flex items-start space-x-3 pb-3 border-b border-gray-50 last:border-0">
                    <div className="bg-green-100 text-green-600 p-2 rounded-full mt-1 flex-shrink-0">
                        <TrendingUp size={14} />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-800">Input Aset Baru</p>
                        
                        <p className="text-xs text-gray-600 font-bold mt-0.5">
                            {asset.brand} - {asset.model_series || asset.barcode}
                        </p>

                        {/* INFO AREA & SEKOLAH */}
                        <p className="text-[11px] text-penabur-blue mt-0.5 truncate font-medium">
                            {asset.school?.area?.name ? `Area ${asset.school.area.name}` : 'Area -'} 
                            <span className="mx-1 text-gray-400">•</span> 
                            {asset.school?.name || 'Sekolah -'}
                        </p>

                        <p className="text-[10px] text-gray-400 mt-1">
                            {new Date(asset.created_at).toLocaleDateString('id-ID', {
                                day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                            })}
                        </p>
                    </div>
                    </div>
                ))
              )}
            </div>
            
            <div className="mt-auto pt-4 border-t border-gray-100 text-center">
                <Link 
                  to="/update-history" 
                  className="text-xs text-penabur-blue font-medium hover:underline cursor-pointer block w-full"
                >
                  Lihat Semua History
                </Link>
            </div>
          </div>

        </div>

      </div>
    </MainLayout>
  );
};

export default Dashboard;