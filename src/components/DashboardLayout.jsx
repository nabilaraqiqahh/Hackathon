import React from 'react';
import Sidebar from './Sidebar';
import { Bell } from 'lucide-react';

export const Header = () => {
  return (
    <header className="top-header">
      <div className="header-breadcrumbs">
        <h3 style={{ margin: 0 }}>Reporting Module</h3>
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
