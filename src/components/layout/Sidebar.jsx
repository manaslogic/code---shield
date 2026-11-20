import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  ShieldCheck, 
  LayoutDashboard, 
  ScanLine, 
  SearchCode, 
  History, 
  BarChart2, 
  Settings,
  X
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/new-scan', label: 'New Scan', icon: ScanLine },
    { to: '/forensic-analysis', label: 'Forensic Analysis', icon: SearchCode },
    { to: '/scan-history', label: 'Scan History', icon: History },
    { to: '/threat-analytics', label: 'Threat Analytics', icon: BarChart2 },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      <div 
        className={`sidebar-backdrop ${isOpen ? 'mobile-open' : ''}`} 
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className={`app-sidebar ${isOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div className="brand-wrapper">
              <div className="brand-icon-box">
                <ShieldCheck size={22} />
              </div>
              <div className="brand-text">
                <h1>UPI Shield</h1>
                <span className="brand-subtitle">Transaction Intelligence</span>
              </div>
            </div>
            {isOpen && (
              <button 
                onClick={onClose} 
                className="btn-ghost" 
                style={{ color: '#9FB3C8', padding: '4px', display: 'flex', border: 'none', background: 'transparent' }}
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                onClick={onClose}
              >
                <Icon className="sidebar-link-icon" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <span>UPI Shield Platform</span>
          <span className="sidebar-version-badge">Prototype v1.0</span>
        </div>
      </aside>
    </>
  );
};
