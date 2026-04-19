import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/DashboardLayout';
import DashboardOverview from './pages/DashboardOverview';
import MapExplorer from './pages/MapExplorer';
import StationManagement from './pages/StationManagement';
import UserManagement from './pages/UserManagement';
import { BookingHistory, PaymentHistory } from './pages/SupportPages';
import ReportingDashboard from './pages/ReportingDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardLayout><DashboardOverview /></DashboardLayout>} />
        <Route path="/map" element={<DashboardLayout><MapExplorer /></DashboardLayout>} />
        <Route path="/stations" element={<DashboardLayout><StationManagement /></DashboardLayout>} />
        <Route path="/users" element={<DashboardLayout><UserManagement /></DashboardLayout>} />
        <Route path="/reservations" element={<DashboardLayout><BookingHistory /></DashboardLayout>} />
        <Route path="/payment" element={<DashboardLayout><PaymentHistory /></DashboardLayout>} />
        <Route path="/report" element={<DashboardLayout><ReportingDashboard /></DashboardLayout>} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
