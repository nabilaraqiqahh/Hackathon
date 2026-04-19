import React, { useState } from 'react';
import { Bell, AlertCircle } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useData } from '../context/DataContext';
import Sidebar from './Sidebar';

export const Header = () => {
  const location = useLocation();
  const { stations } = useData();
  const [showDropdown, setShowDropdown] = useState(false);

  // Notifications logic from member 2
  const maintenanceStations = stations?.filter(s => s.status === 'Maintenance') || [];

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
      <div className="header-actions" style={{ position: 'relative' }}>
        <button 
          style={{ background: 'transparent', color: 'var(--color-primary)', position: 'relative', cursor: 'pointer', border: 'none' }}
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <Bell size={24} />
          {maintenanceStations.length > 0 && (
            <div style={{
              position: 'absolute', top: '-4px', right: '-4px', 
              background: 'var(--color-danger)', color: 'white', fontSize: '10px', 
              borderRadius: '50%', width: '16px', height: '16px', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 'bold', border: '2px solid white'
            }}>
              {maintenanceStations.length}
            </div>
          )}
        </button>

        {showDropdown && (
          <div style={{
            position: 'absolute', top: '40px', right: '0', 
            background: 'white', border: '1px solid #ddd', borderRadius: '12px', 
            boxShadow: '0 8px 30px rgba(0,0,0,0.12)', width: '320px', zIndex: 1000,
            textAlign: 'left', overflow: 'hidden'
          }}>
            <div style={{ padding: '16px', borderBottom: '1px solid #eee', fontWeight: 600, background: '#fcfcfc', color: 'var(--color-text-main)' }}>
              Live Network Alerts
            </div>
            <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
              {maintenanceStations.length === 0 ? (
                <div style={{ padding: '24px 16px', textAlign: 'center', color: '#888', fontSize: '0.85rem' }}>
                  No active issues reported.
                </div>
              ) : (
                maintenanceStations.map(stn => (
                  <div key={stn.id} style={{ padding: '14px 16px', borderBottom: '1px solid #eee', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{ padding: '6px', background: 'rgba(211, 47, 47, 0.1)', borderRadius: '8px', color: 'var(--color-danger)' }}>
                      <AlertCircle size={16} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{stn.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '2px' }}>Station status changed to Maintenance. Requires inspection.</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
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
