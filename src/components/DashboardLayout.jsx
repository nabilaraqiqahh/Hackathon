import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Bell, AlertCircle } from 'lucide-react';
import { useData } from '../context/DataContext';

export const Header = () => {
  const { stations } = useData();
  const [showDropdown, setShowDropdown] = useState(false);

  const maintenanceStations = stations?.filter(s => s.status === 'Maintenance') || [];

  return (
    <header className="top-header">
      <div className="header-breadcrumbs">
        <h3 style={{ margin: 0 }}>Reporting Module</h3>
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
              background: 'red', color: 'white', fontSize: '10px', 
              borderRadius: '50%', width: '16px', height: '16px', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 'bold'
            }}>
              {maintenanceStations.length}
            </div>
          )}
        </button>

        {showDropdown && (
          <div style={{
            position: 'absolute', top: '40px', right: '0', 
            background: 'white', border: '1px solid #ddd', borderRadius: '8px', 
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '280px', zIndex: 1000,
            textAlign: 'left'
          }}>
            <div style={{ padding: '12px', borderBottom: '1px solid #eee', fontWeight: 'bold' }}>
              Alerts & Notifications
            </div>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {maintenanceStations.length === 0 ? (
                <div style={{ padding: '16px', textAlign: 'center', color: '#888', fontSize: '0.85rem' }}>
                  No active issues reported.
                </div>
              ) : (
                maintenanceStations.map(stn => (
                  <div key={stn.id} style={{ padding: '12px', borderBottom: '1px solid #eee', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                    <AlertCircle size={16} color="red" style={{ marginTop: '2px', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{stn.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#666' }}>Requires immediate maintenance check.</div>
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
