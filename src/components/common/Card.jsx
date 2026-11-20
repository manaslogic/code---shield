import React from 'react';

export const Card = ({ children, className = '', ...props }) => {
  return (
    <div className={`fintech-card ${className}`.trim()} {...props}>
      {children}
    </div>
  );
};
