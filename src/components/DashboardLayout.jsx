import React from 'react';
import Sidebar from './Sidebar';
import { Bell } from 'lucide-react';

import { useLocation } from 'react-router-dom';

export const Header = () => {
  const location = useLocation();
  const getPageTitle = (path) => {
    const titles = {
      '/dashboard': 'System Overview',
      '/map': 'Map Explorer',
      '/stations': 'Station Tracker',
      '/users': 'User Management',
      '/reservations': 'My Reservations',
      '/payment': 'Payment History',
      '/report': 'Analytics & Reporting'
    };
    return titles[path] || 'Volt-Park Dashboard';
  };

  return (
    <header className="top-header">
      <div className="header-breadcrumbs">
        <h3 style={{ margin: 0 }}>{getPageTitle(location.pathname)}</h3>
      </div>
      <div className="header-actions">
        <button style={{ background: 'transparent', color: 'var(--color-primary)' }}>
          <Bell size={24} />
        </button>
      </div>
    </header>
  );
};

const DashboardLayout = ({ children }) => {
  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-wrapper">
        <Header />
        <div className="content-area">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
