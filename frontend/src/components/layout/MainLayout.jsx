import React, { useState } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const MainLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-penabur-light">
      <Sidebar isOpen={isSidebarOpen} />
      <div className={`${isSidebarOpen ? 'md:ml-64' : 'ml-0'} min-h-screen flex flex-col transition-all duration-300`}>
        <TopBar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

        <main className="flex-1 p-6 mt-16 overflow-x-hidden">
          {children}
        </main>
        
        <footer className="p-4 text-center text-xs text-gray-400 font-bold">
          IT Asset Management v1.0 &copy; BPK PENABUR
        </footer>
      </div>
    </div>
  );
};

export default MainLayout;