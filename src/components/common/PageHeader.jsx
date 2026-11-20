import React from 'react';

export const PageHeader = ({ title, subtitle, action, className = '' }) => {
  return (
    <div className={`page-header ${className}`.trim()} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <h1 className="page-header-title">{title}</h1>
        {subtitle && <p className="page-header-subtitle">{subtitle}</p>}
      </div>
      {action && <div className="page-header-action">{action}</div>}
    </div>
  );
};
