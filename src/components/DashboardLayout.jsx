import React, { useState } from 'react';
import { Bell, AlertCircle } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useData } from '../context/DataContext';
import Sidebar from './Sidebar';

export const Header = () => {
  const location = useLocation();
  const { stations, currentUser, reservations } = useData();
  const [showDropdown, setShowDropdown] = useState(false);

  const isAdmin = currentUser?.type === 'Admin';
  const adminNotifications = stations?.filter(s => s.status === 'Maintenance') || [];
  const driverNotifications = reservations?.filter(r => r.user === currentUser?.name && r.status === 'Confirmed') || [];
  
  const notificationsCount = isAdmin ? adminNotifications.length : driverNotifications.length;

  // Removed getPageTitle since we are removing the top wording
  return (
    <header className="top-header">
      <div className="header-breadcrumbs">
        {/* Intentionally left blank to remove duplicate page titles */}
      </div>
      <div className="header-actions" style={{ position: 'relative' }}>
        <button 
          style={{ background: 'transparent', color: 'var(--color-primary)', position: 'relative', cursor: 'pointer', border: 'none' }}
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <Bell size={24} />
          {notificationsCount > 0 && (
            <div style={{
              position: 'absolute', top: '-4px', right: '-4px', 
              background: isAdmin ? 'var(--color-danger)' : 'var(--color-success)', 
              color: 'white', fontSize: '10px', 
              borderRadius: '50%', width: '16px', height: '16px', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 'bold', border: '2px solid white'
            }}>
              {notificationsCount}
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
              {isAdmin ? 'Live Network Alerts' : 'Your Notifications'}
            </div>
            <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
              {notificationsCount === 0 ? (
                <div style={{ padding: '24px 16px', textAlign: 'center', color: '#888', fontSize: '0.85rem' }}>
                  {isAdmin ? 'No active issues reported.' : 'You have no new notifications.'}
                </div>
              ) : (
                isAdmin ? (
                  adminNotifications.map(stn => (
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
                ) : (
                  driverNotifications.map(res => (
                    <div key={res.id} style={{ padding: '14px 16px', borderBottom: '1px solid #eee', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <div style={{ padding: '6px', background: 'rgba(45, 138, 39, 0.1)', borderRadius: '8px', color: 'var(--color-success)' }}>
                        <Bell size={16} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>Reservation Confirmed</div>
                        <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '2px' }}>Your slot at {res.station} on {res.date} at {res.time} is ready.</div>
                      </div>
                    </div>
                  ))
                )
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
