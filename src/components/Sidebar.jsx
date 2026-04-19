import React from 'react';
import { LayoutDashboard, Map, Zap, Calendar, CreditCard, User, LogOut } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand" style={{ padding: '24px 0', display: 'flex', justifyContent: 'center' }}>
        <img src="/logo.png" alt="Volt-Park Logo" style={{ width: '130px', height: 'auto', objectFit: 'contain' }} />
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={20} />
          Overview
        </NavLink>
        <NavLink to="/map" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
          <Map size={20} />
          Map Explorer
        </NavLink>
        <NavLink to="/stations" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
          <Zap size={20} />
          Stations Tracker
        </NavLink>
        <NavLink to="/users" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
          <User size={20} />
          User Management
        </NavLink>
        <NavLink to="/reservations" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
          <Calendar size={20} />
          Reservations
        </NavLink>
        <NavLink to="/payment" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
          <CreditCard size={20} />
          Payments
        </NavLink>
        <div style={{ height: '1px', background: 'rgba(0,0,0,0.05)', margin: '16px 0' }} />
        <NavLink to="/report" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={20} />
          Analytics Report
        </NavLink>
      </nav>

      <div className="sidebar-profile">
        <div className="avatar">A</div>
        <div className="profile-info">
          <h4>A001</h4>
          <p>Admin / EV User</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
