import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Map, History, FileClock, LogOut, ChevronDown, ChevronRight } from 'lucide-react';
import api from '../../services/api';
import logoBpk from '../../assets/images/logo-bpk.png';

const Sidebar = ({ isOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [isAreaOpen, setIsAreaOpen] = useState(false);
  const [areas, setAreas] = useState([]);

  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const response = await api.get('/areas');
        setAreas(response.data);
      } catch (error) {
        console.error("Gagal mengambil data area:", error);
      }
    };
    fetchAreas();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className={`
      fixed left-0 top-0 h-screen w-64 bg-penabur-dark text-white shadow-2xl z-20 flex flex-col 
      transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      
      <div className="h-24 flex items-center px-6 border-b border-gray-700">
        <img 
          src={logoBpk} 
          alt="Logo" 
          className="h-10 w-auto mr-3 object-contain hover:scale-105 transition-transform"
        />
        <div>
          <h1 className="font-bold text-sm leading-tight text-white">IT Asset Management</h1>
          <p className="text-xs text-gray-400 font-medium">BPK Penabur</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-6 space-y-2 px-3">
        <Link 
          to="/dashboard" 
          className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
            isActive('/dashboard') ? 'bg-penabur-blue text-white shadow-lg' : 'text-blue-100 hover:bg-white/10'
          }`}
        >
          <LayoutDashboard size={20} className="mr-3" />
          <span className="font-medium text-sm">Dashboard</span>
        </Link>

        <div>
          <button 
            onClick={() => setIsAreaOpen(!isAreaOpen)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${
              isAreaOpen ? 'bg-white/10 text-white' : 'text-blue-100 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center">
              <Map size={20} className="mr-3" />
              <span className="font-medium text-sm">Area Penabur</span>
            </div>
            {isAreaOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>

          {isAreaOpen && (
            <div className="mt-1 ml-4 space-y-1 border-l-2 border-white/20 pl-2">
              {areas.map((area) => (
                <Link
                  key={area.id}
                  to={`/area/${area.id}`}
                  className="block px-4 py-2 text-sm text-blue-200 hover:text-white hover:translate-x-1 transition-all rounded-md"
                >
                  Area {area.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        <Link 
          to="/service-history" 
          className="flex items-center px-4 py-3 text-blue-100 hover:bg-white/10 rounded-lg transition-all"
        >
          <History size={20} className="mr-3" />
          <span className="font-medium text-sm">Service History</span>
        </Link>

        <Link 
          to="/update-history" 
          className="flex items-center px-4 py-3 text-blue-100 hover:bg-white/10 rounded-lg transition-all"
        >
          <FileClock size={20} className="mr-3" />
          <span className="font-medium text-sm">Update History</span>
        </Link>

      </div>

      <div className="p-4 border-t border-white/10 bg-black/20">
        <button 
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-2 text-red-300 hover:bg-red-500/20 hover:text-red-100 rounded-lg transition-all"
        >
          <LogOut size={20} className="mr-3" />
          <span className="font-medium text-sm">Sign Out</span>
        </button>
      </div>

    </div>
  );
};

export default Sidebar;