import React from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, Shield } from 'lucide-react';

const PAGE_METADATA = {
  '/': {
    title: 'Security Overview',
    subtitle: 'Monitor screenshot analysis and potential transaction risks.'
  },
  '/new-scan': {
    title: 'New Screenshot Analysis',
    subtitle: 'Upload a UPI payment screenshot for multi-layer security examination.'
  },
  '/forensic-analysis': {
    title: 'Forensic Analysis',
    subtitle: 'Multi-layer examination of uploaded payment screenshots.'
  },
  '/scan-history': {
    title: 'Scan History',
    subtitle: 'Review previously analyzed payment screenshots.'
  },
  '/threat-analytics': {
    title: 'Threat Analytics',
    subtitle: 'Understand suspicious patterns identified by screenshot analysis.'
  },
  '/settings': {
    title: 'Settings',
    subtitle: 'Manage your application preferences and privacy.'
  }
};

export const Header = ({ onOpenSidebar }) => {
  const location = useLocation();
  const currentMeta = PAGE_METADATA[location.pathname] || {
    title: 'UPI Shield',
    subtitle: 'Transaction Intelligence'
  };

  return (
    <header className="app-header">
      <div className="header-left">
        <button 
          className="mobile-menu-toggle"
          onClick={onOpenSidebar}
          aria-label="Open navigation menu"
        >
          <Menu size={20} />
        </button>
        <div className="header-titles">
          <div className="header-page-title">{currentMeta.title}</div>
          <div className="header-page-subtitle">{currentMeta.subtitle}</div>
        </div>
      </div>

      <div className="header-right">
        <div className="header-user-badge">
          <div className="user-avatar-placeholder" title="System Operator">
            <Shield size={14} />
          </div>
          <span className="user-role-label">Terminal Mode</span>
        </div>
      </div>
    </header>
  );
};
