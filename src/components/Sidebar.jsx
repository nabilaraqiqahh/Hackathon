import React from 'react';
import { LayoutDashboard, Map, Zap, Calendar, CreditCard, User, LogOut } from 'lucide-react';
import { NavLink } from 'react-router-dom';

import { useData } from '../context/DataContext';

const Sidebar = () => {
  const { currentUser, logout } = useData();
  const isAdmin = currentUser?.type === 'Admin';

  const adminLinks = [
    { title: 'Overview', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
    { title: 'Map Explorer', icon: <Map size={20} />, path: '/map' },
    { title: 'Stations Tracker', icon: <Zap size={20} />, path: '/stations' },
    { title: 'User Management', icon: <User size={20} />, path: '/users' },
    { title: 'Analytics Report', icon: <LayoutDashboard size={20} />, path: '/report' },
  ];

  const driverLinks = [
    { title: 'Map Explorer', icon: <Map size={20} />, path: '/map' },
    { title: 'My Reservations', icon: <Calendar size={20} />, path: '/reservations' },
    { title: 'Payment History', icon: <CreditCard size={20} />, path: '/payment' },
  ];

  const links = isAdmin ? adminLinks : driverLinks;

  return (
    <aside className="sidebar">
      <div className="sidebar-brand" style={{ padding: '24px 0', display: 'flex', justifyContent: 'center' }}>
        <img src="/logo.png" alt="Volt-Park Logo" style={{ width: '130px', height: 'auto', objectFit: 'contain' }} />
      </div>

      <nav className="sidebar-nav">
        {links.map((link) => (
          <NavLink key={link.path} to={link.path} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            {link.icon}
            {link.title}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-profile" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="avatar">{currentUser?.name?.charAt(0) || 'U'}</div>
          <div className="profile-info">
            <h4>{currentUser?.name || 'Guest'}</h4>
            <p>{currentUser?.type || 'User'}</p>
          </div>
        </div>
        <button onClick={logout} style={{ 
          background: 'rgba(211, 47, 47, 0.1)', 
          border: 'none', 
          borderRadius: '8px',
          color: 'var(--color-danger)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          gap: '8px', 
          padding: '10px', 
          width: '100%',
          cursor: 'pointer',
          fontWeight: 600,
          transition: 'all 0.2s'
        }}>
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
