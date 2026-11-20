import React from 'react';

export const SummaryCard = ({ label, value = 0, icon: Icon, type = 'total', description }) => {
  return (
    <div className="summary-card">
      <div className="summary-card-header">
        <span className="summary-card-label">{label}</span>
        {Icon && (
          <div className={`summary-card-icon ${type}`}>
            <Icon size={18} />
          </div>
        )}
      </div>
      <div className="summary-card-value">{value}</div>
      {description && <div className="summary-card-footer">{description}</div>}
    </div>
  );
};
