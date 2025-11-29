import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, ArrowRight, Building2, ArrowLeft, LayoutGrid, List } from 'lucide-react'; 
import MainLayout from '../../components/layout/MainLayout';
import api from '../../services/api';
import { useBreadcrumb } from '../../context/BreadcrumbContext';

const AreaDetail = () => {
  const { id } = useParams();
  const [schools, setSchools] = useState([]);
  const [areaInfo, setAreaInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); 

  const { setCrumbs } = useBreadcrumb();

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const areaRes = await api.get(`/areas/${id}`);
        setAreaInfo(areaRes.data);
        
        setCrumbs([areaRes.data.name]); 

        const schoolRes = await api.get(`/areas/${id}/schools`);
        setSchools(schoolRes.data);

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [id]);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
            <Link 
              to="/dashboard" 
              className="inline-flex items-center px-3 py-1.5 bg-white border border-gray-300 rounded-md text-gray-600 hover:text-penabur-blue hover:border-penabur-blue transition-all shadow-sm text-sm font-medium"
            >
              <ArrowLeft size={16} className="mr-2"/> Kembali ke Dashboard
            </Link>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between w-full gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <MapPin className="text-penabur-blue mr-3" />
              Area {areaInfo ? areaInfo.name : 'Loading...'}
            </h2>
            <p className="text-gray-500 text-lg mt-1">
              Daftar Sekolah & Unit Kerja di wilayah ini
            </p>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
                <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white text-penabur-blue shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                    title="Tampilan Grid (Kartu)"
                >
                    <LayoutGrid size={20} />
                </button>
                <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white text-penabur-blue shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                    title="Tampilan List (Detail)"
                >
                    <List size={20} />
                </button>
             </div>

             <div className="bg-blue-50 text-penabur-blue px-4 py-2 rounded-lg font-bold text-xl">
                {schools.length} <span className="text-sm font-normal text-gray-600">Sekolah</span>
             </div>
          </div>
        </div>
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-penabur-blue"></div>
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {schools.map((school) => (
                    <Link 
                        key={school.id} 
                        to={`/school/${school.id}`}
                        className="group bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-penabur-blue transition-all duration-300 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-16 h-16 bg-blue-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-150 group-hover:bg-blue-100"></div>

                        <div className="relative z-10">
                        <div className="bg-blue-50 w-12 h-12 rounded-lg flex items-center justify-center text-penabur-blue mb-4 group-hover:bg-penabur-blue group-hover:text-white transition-colors">
                            <Building2 size={24} />
                        </div>
                        
                        <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-penabur-blue transition-colors line-clamp-2 h-14">
                            {school.name}
                        </h3>
                        
                        <div className="flex items-center text-sm text-gray-400 mt-4 group-hover:text-penabur-dark font-medium">
                            Lihat Aset <ArrowRight size={16} className="ml-2 transform group-hover:translate-x-1 transition-transform" />
                        </div>
                        </div>
                    </Link>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="divide-y divide-gray-100">
                        {schools.map((school) => (
                            <Link 
                                key={school.id} 
                                to={`/school/${school.id}`}
                                className="flex items-center p-4 hover:bg-blue-50 transition-colors group"
                            >
                                <div className="bg-blue-50 text-penabur-blue p-3 rounded-lg mr-4 group-hover:bg-penabur-blue group-hover:text-white transition-colors">
                                    <Building2 size={20} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-base font-bold text-gray-800 group-hover:text-penabur-blue transition-colors">
                                        {school.name}
                                    </h3>
                                    <p className="text-xs text-gray-400">Unit ID: {school.id}</p>
                                </div>
                                <div className="text-gray-400 group-hover:text-penabur-blue transition-colors flex items-center text-sm font-medium">
                                    Lihat Aset <ArrowRight size={18} className="ml-2"/>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default AreaDetail;