import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { BreadcrumbProvider } from './context/BreadcrumbContext';
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import AreaDetail from './pages/area/AreaDetail';
import SchoolDetail from './pages/school/SchoolDetail';
import AddAsset from './pages/forms/AddAsset';
import EditAsset from './pages/forms/EditAsset';
import ServiceHistory from './pages/service/ServiceHistory';
import AddService from './pages/service/AddService';
import EditService from './pages/service/EditService';
import UpdateHistory from './pages/service/UpdateHistory';
import Profile from './pages/profile/Profile';
import UserHome from './pages/user/UserHome';
import ScanQR from './pages/user/ScanQR';
import UserAssetDetail from './pages/user/UserAssetDetail';
import UserProfile from './pages/user/UserProfile';
import UserAssetList from './pages/user/UserAssetList';
import TransferAset from './pages/asset/TransferAset';
import MasterData from './pages/admin/MasterData';
import OperatorDashboard from './pages/operator/OperatorDashboard';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    if (role === 'user') return <Navigate to="/user/home" replace />;
    if (role === 'operator') return <Navigate to="/operator/dashboard" replace />;
    if (role === 'admin') return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <BreadcrumbProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><Dashboard /></ProtectedRoute>} />
          <Route path="/area/:id" element={<ProtectedRoute allowedRoles={['admin']}><AreaDetail /></ProtectedRoute>} />
          <Route path="/school/:id" element={<ProtectedRoute allowedRoles={['admin']}><SchoolDetail /></ProtectedRoute>} />
          <Route path="/school/:id/add" element={<ProtectedRoute allowedRoles={['admin']}><AddAsset /></ProtectedRoute>} />
          <Route path="/school/:schoolId/asset/:assetId/edit" element={<ProtectedRoute allowedRoles={['admin', 'operator']}><EditAsset /></ProtectedRoute>} />
          <Route path="/service-history" element={<ProtectedRoute allowedRoles={['admin']}><ServiceHistory /></ProtectedRoute>} />
          <Route path="/service-history/add" element={<ProtectedRoute allowedRoles={['admin']}><AddService /></ProtectedRoute>} />
          <Route path="/service-history/edit/:id" element={<ProtectedRoute allowedRoles={['admin']}><EditService /></ProtectedRoute>} />
          
          <Route path="/update-history" element={<ProtectedRoute allowedRoles={['admin']}><UpdateHistory /></ProtectedRoute>} />
    
          <Route path="/transfer-asset" element={<ProtectedRoute allowedRoles={['admin']}><TransferAset /></ProtectedRoute>} />
          <Route path="/master-data" element={<ProtectedRoute allowedRoles={['admin']}><MasterData /></ProtectedRoute>} />
          <Route path="/operator/dashboard" element={<ProtectedRoute allowedRoles={['operator']}><OperatorDashboard /></ProtectedRoute>} />
          
          <Route path="/user/assets" element={<ProtectedRoute allowedRoles={['user', 'operator']}><UserAssetList /></ProtectedRoute>} />
          <Route path="/user/scan" element={<ProtectedRoute allowedRoles={['user', 'operator']}><ScanQR /></ProtectedRoute>} />
          <Route path="/user/asset/:id" element={<ProtectedRoute allowedRoles={['user', 'operator']}><UserAssetDetail /></ProtectedRoute>} />
          
          <Route path="/profile" element={<ProtectedRoute allowedRoles={['admin', 'operator']}><Profile /></ProtectedRoute>} />
          <Route path="/user/profile" element={<ProtectedRoute allowedRoles={['user']}><UserProfile /></ProtectedRoute>} />
          
          <Route path="/user/home" element={<ProtectedRoute allowedRoles={['user']}><UserHome /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </BreadcrumbProvider>
  );
}

export default App;