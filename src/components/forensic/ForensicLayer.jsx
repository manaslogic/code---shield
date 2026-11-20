import React from 'react';
import { Badge } from '../common/Badge';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export const ForensicLayer = ({
  layerNumber,
  title,
  fields = [],
  statusText = 'Awaiting integration',
  statusVariant = 'neutral',
  notice,
  findings = [],
  className = ''
}) => {
  return (
    <div className={`forensic-layer-card ${className}`.trim()}>
      <div className="forensic-layer-header">
        <div className="layer-title-group">
          <span className="layer-number-badge">Layer {layerNumber}</span>
          <h3 className="layer-title">{title}</h3>
        </div>
        <Badge variant={statusVariant}>{statusText}</Badge>
      </div>

      <div className="forensic-layer-body">
        <div className="forensic-field-grid">
          {fields.map((field, idx) => (
            <div key={idx} className="forensic-field-box">
              <div className="forensic-field-name">{field.label}</div>
              <div 
                className="forensic-field-status" 
                style={{ 
                  color: field.highlight ? 'var(--color-primary-accent)' : field.isAnomalous ? 'var(--color-risk-high)' : 'var(--color-primary-text)',
                  fontWeight: field.value && field.value !== 'Awaiting integration' ? 600 : 500
                }}
              >
                {field.value || 'Not detected'}
              </div>
            </div>
          ))}
        </div>

        {findings && findings.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: notice ? '12px' : '0' }}>
            {findings.map((f, i) => (
              <div 
                key={i} 
                style={{ 
                  fontSize: '12px', 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  gap: '8px',
                  color: 'var(--color-secondary-text)' 
                }}
              >
                <CheckCircle2 size={14} color="var(--color-primary-accent)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{f}</span>
              </div>
            ))}
          </div>
        )}

        {notice && (
          <div className="layer-notice">
            <strong>Note:</strong> {notice}
          </div>
        )}
      </div>
    </div>
  );
};
