import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import AreaDetail from './pages/area/AreaDetail';
import SchoolDetail from './pages/school/SchoolDetail';
import AddAsset from './pages/forms/AddAsset';
import EditAsset from './pages/forms/EditAsset';
import ServiceHistory from './pages/service/ServiceHistory';
import AddService from './pages/service/AddService';
import UpdateHistory from './pages/service/UpdateHistory';
import Profile from './pages/profile/Profile';
import EditService from './pages/service/EditService';
import { BreadcrumbProvider } from './context/BreadcrumbContext';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/" replace />;
  return children;
};

const App = () => {
  return (
  <BreadcrumbProvider>
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/area/:id" 
          element={
            <ProtectedRoute>
              <AreaDetail />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/school/:id" 
          element={
            <ProtectedRoute>
              <SchoolDetail />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/school/:id/add" 
          element={
            <ProtectedRoute>
              <AddAsset />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/school/:schoolId/asset/:assetId/edit" 
          element={
            <ProtectedRoute>
              <EditAsset />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/service-history" 
          element={
            <ProtectedRoute>
              <ServiceHistory />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/service-history/add" 
          element={
            <ProtectedRoute>
              <AddService />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/update-history" 
          element={
            <ProtectedRoute>
              <UpdateHistory />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/service-history/edit/:id" 
          element={
          <ProtectedRoute>
            <EditService />
            </ProtectedRoute>
          } 
        />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  </BreadcrumbProvider>
  );
};

export default App;