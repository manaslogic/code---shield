import React from 'react';

export const Badge = ({
  children,
  variant = 'neutral', // 'high', 'medium', 'low', 'neutral'
  showDot = true,
  className = '',
  ...props
}) => {
  const variantClass = `badge-${variant}`;

  return (
    <span className={`badge ${variantClass} ${className}`.trim()} {...props}>
      {showDot && <span className="badge-dot" />}
      {children}
    </span>
  );
};
