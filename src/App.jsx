import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/DashboardLayout';
import DashboardOverview from './pages/DashboardOverview';
import MapExplorer from './pages/MapExplorer';
import StationManagement from './pages/StationManagement';
import UserManagement from './pages/UserManagement';
import { BookingHistory, PaymentHistory } from './pages/SupportPages';
import ReportingDashboard from './pages/ReportingDashboard';

import { useData } from './context/DataContext';
import LoginPage from './pages/LoginPage';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { currentUser } = useData();
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.type)) {
    return <Navigate to="/map" replace />;
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <DashboardLayout><DashboardOverview /></DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/map" element={
          <ProtectedRoute>
            <DashboardLayout><MapExplorer /></DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/stations" element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <DashboardLayout><StationManagement /></DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/users" element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <DashboardLayout><UserManagement /></DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/reservations" element={
          <ProtectedRoute>
            <DashboardLayout><BookingHistory /></DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/payment" element={
          <ProtectedRoute>
            <DashboardLayout><PaymentHistory /></DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/report" element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <DashboardLayout><ReportingDashboard /></DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
