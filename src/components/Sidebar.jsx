import React, { useState, useEffect, useRef } from 'react';
import { LayoutDashboard, Map, Zap, Calendar, CreditCard, User, LogOut, ChevronUp, UserCircle, Car, MessageSquare, Wrench } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';

import { useData } from '../context/DataContext';

const Sidebar = () => {
  const { currentUser, logout } = useData();
  const isAdmin = currentUser?.type === 'Admin';
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const adminLinks = [
    { title: 'Overview', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
    { title: 'Map Explorer', icon: <Map size={20} />, path: '/map' },
    { title: 'Stations Tracker', icon: <Zap size={20} />, path: '/stations' },
    { title: 'User Management', icon: <User size={20} />, path: '/users' },
    { title: 'Feedback Reports', icon: <MessageSquare size={20} />, path: '/feedback-reports' },
    { title: 'Maintenance', icon: <Wrench size={20} />, path: '/maintenance' },
    { title: 'Analytics Report', icon: <LayoutDashboard size={20} />, path: '/report' },
  ];

  const driverLinks = [
    { title: 'Map Explorer', icon: <Map size={20} />, path: '/map' },
    { title: 'My Reservations', icon: <Calendar size={20} />, path: '/reservations' },
    { title: 'Payment History', icon: <CreditCard size={20} />, path: '/payment' },
  ];

  const links = isAdmin ? adminLinks : driverLinks;

  const handleMenuNavigate = (path) => {
    setIsMenuOpen(false);
    navigate(path);
  };

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

      <div className="sidebar-profile" style={{ position: 'relative', marginTop: 'auto', background: '#EFE8DA', padding: '16px', borderRadius: 'var(--radius-md)' }} ref={menuRef}>
        {isMenuOpen && (
          <div style={{
            position: 'absolute',
            bottom: '100%',
            left: '0',
            width: '100%',
            marginBottom: '12px',
            background: 'var(--color-surface)',
            borderRadius: '12px',
            boxShadow: '0 -4px 20px rgba(0,0,0,0.15)',
            border: '1px solid rgba(0,0,0,0.05)',
            overflow: 'hidden',
            zIndex: 100
          }}>
            <div style={{ padding: '16px 16px 8px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Account</div>
            <div 
              style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', transition: 'background 0.2s', fontSize: '0.9rem', fontWeight: 500 }}
              onClick={() => handleMenuNavigate('/profile')}
              onMouseOver={e => e.currentTarget.style.background = 'rgba(0,0,0,0.02)'}
              onMouseOut={e => e.currentTarget.style.background = 'transparent'}
            >
              <UserCircle size={18} color="var(--color-primary)" />
              Personal Information
            </div>
          </div>
        )}

        <div style={{ flexDirection: 'column', alignItems: 'stretch', gap: '16px', display: 'flex' }}>
          <div 
            style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px', borderRadius: '8px', cursor: 'pointer', transition: 'background-color 0.2s', background: isMenuOpen ? 'rgba(0,0,0,0.05)' : 'transparent', margin: '-8px' }}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <div className="avatar">{currentUser?.name?.charAt(0) || 'U'}</div>
            <div className="profile-info" style={{ flex: 1, minWidth: 0 }}>
              <h4 style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentUser?.name || 'Guest'}</h4>
              <p>{currentUser?.type || 'User'}</p>
            </div>
            <ChevronUp size={20} style={{ color: 'var(--color-text-muted)', transform: isMenuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} />
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
            transition: 'all 0.2s',
            marginTop: '8px'
          }}>
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
