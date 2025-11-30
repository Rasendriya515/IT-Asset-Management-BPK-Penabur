import React, { useState, useEffect } from 'react';
import { LogOut, User, ChevronRight, Home, Menu } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { useBreadcrumb } from '../../context/BreadcrumbContext';

const BASE_URL = 'http://localhost:8000';

const TopBar = ({ isSidebarOpen, toggleSidebar }) => {
  const { crumbs } = useBreadcrumb();
  const [user, setUser] = useState({ full_name: 'Admin', avatar: null });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/users/me');
        setUser(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className={`
      bg-white h-16 fixed top-0 right-0 z-10 border-b border-gray-200 shadow-sm transition-all duration-300
      ${isSidebarOpen ? 'left-0 md:left-64' : 'left-0'}
    `}>
      
      <div className="flex items-center justify-between h-full px-6">

        <div className="flex items-center">
            
            <button 
              onClick={toggleSidebar} 
              className="mr-4 text-gray-500 hover:text-penabur-blue p-1 rounded-md hover:bg-gray-100 transition-colors"
              title="Toggle Sidebar"
            >
              <Menu size={24} />
            </button>

            <div className="flex items-center text-sm font-medium text-gray-500 overflow-hidden whitespace-nowrap mr-4">
                <span className="flex items-center hover:text-penabur-blue transition-colors cursor-default">
                    <Home size={14} className="mr-2 mb-0.5" />
                    IT Asset Management
                </span>

                {crumbs && crumbs.map((crumb, index) => (
                    <React.Fragment key={index}>
                        <ChevronRight size={14} className="mx-2 text-gray-400" />
                        <span className={`${index === crumbs.length - 1 ? 'text-gray-800 font-bold' : 'text-gray-500'}`}>
                            {crumb}
                        </span>
                    </React.Fragment>
                ))}
            </div>
        </div>

        <div className="flex items-center space-x-4 flex-shrink-0">
            <Link to="/profile" className="flex items-center space-x-3 hover:bg-gray-50 py-1 px-2 rounded-lg transition-colors cursor-pointer">
                <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold text-gray-700">{user.full_name || 'Admin'}</p>
                    <p className="text-xs text-green-600 font-medium">Online</p>
                </div>
            
                <div className="bg-gray-200 p-1 rounded-full overflow-hidden w-9 h-9 flex items-center justify-center border border-gray-300">
                    {user.avatar ? (
                        <img src={`${BASE_URL}${user.avatar}`} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                    ) : (
                        <User className="text-gray-500" size={20} />
                    )}
                </div>
            </Link>

            <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>

            <button 
                onClick={handleLogout}
                className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-all duration-200 hover:shadow-md active:scale-95 flex items-center gap-2 font-bold text-xs border border-red-500"
                title="Logout"
            >
                <LogOut size={16} />
                <span className="hidden sm:inline">Sign Out</span>
            </button>
        </div>

      </div>
    </div>
  );
};

export default TopBar;