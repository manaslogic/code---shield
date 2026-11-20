import React from 'react';
import { ShieldAlert, AlertTriangle, Info, CheckCircle2, AlertOctagon } from 'lucide-react';
import { Badge } from '../common/Badge';

export const RiskAssessment = ({ analysis, isAnalyzing }) => {
  const risk = analysis?.riskAssessment;

  if (isAnalyzing) {
    return (
      <div className="risk-assessment-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="layer-number-badge">Layer 5</span>
            <h3 style={{ margin: 0 }}>Explainable Risk Assessment</h3>
          </div>
          <Badge variant="medium">Evaluating Evidence...</Badge>
        </div>
        <p className="text-secondary" style={{ fontSize: '14px' }}>
          Correlating signals across OCR, Metadata, ELA Forensics, and Transaction Consistency...
        </p>
      </div>
    );
  }

  if (!risk) {
    return (
      <div className="risk-assessment-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="layer-number-badge">Layer 5</span>
            <h3 style={{ margin: 0 }}>Explainable Risk Assessment</h3>
          </div>
          <Badge variant="neutral">Engine Standby</Badge>
        </div>

        <div className="risk-score-display">
          <div className="risk-score-badge">
            <span className="score-val">—</span>
            <span className="score-label">Pending</span>
          </div>
          <div className="risk-score-info">
            <h4 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-primary-text)', marginBottom: '4px' }}>
              Risk assessment pending.
            </h4>
            <p>
              Initiate the forensic examination pipeline above to compute the composite suspicion score, forensic factors, and operational recommendations.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '16px 0' }}>
          <div className="layer-notice" style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <Info size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>
              <strong>Methodology Notice:</strong> Suspicion score does not equate to fraud probability. Missing image metadata or unfamiliar UI formatting alone does not automatically designate high risk.
            </span>
          </div>
        </div>

        <div className="final-recommendation-box">
          <AlertTriangle size={20} />
          <div>
            <div style={{ fontWeight: 600, marginBottom: '2px' }}>Final Operational Recommendation</div>
            <p>
              Do not release goods based solely on a payment screenshot. Confirm that funds have been credited to your account.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Active risk assessment result
  const getBadgeVariant = (level) => {
    if (level === 'high') return 'high';
    if (level === 'medium') return 'medium';
    return 'low';
  };

  const scoreBorderColor = 
    risk.riskLevel === 'high' ? 'var(--color-risk-high)' :
    risk.riskLevel === 'medium' ? 'var(--color-risk-medium)' :
    'var(--color-risk-low)';

  const scoreBgColor = 
    risk.riskLevel === 'high' ? 'var(--color-risk-high-bg)' :
    risk.riskLevel === 'medium' ? 'var(--color-risk-medium-bg)' :
    'var(--color-risk-low-bg)';

  return (
    <div className="risk-assessment-card" style={{ borderTopColor: scoreBorderColor }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="layer-number-badge">Layer 5</span>
          <h3 style={{ margin: 0 }}>Explainable Risk Assessment</h3>
        </div>
        <Badge variant={getBadgeVariant(risk.riskLevel)}>
          {risk.categoryLabel}
        </Badge>
      </div>

      <div className="risk-score-display">
        <div 
          className="risk-score-badge" 
          style={{ 
            backgroundColor: scoreBgColor, 
            borderColor: scoreBorderColor,
            color: scoreBorderColor,
            borderStyle: 'solid'
          }}
        >
          <span className="score-val">{risk.score}</span>
          <span className="score-label">/ 100</span>
        </div>
        <div className="risk-score-info">
          <h4 style={{ fontSize: '18px', fontWeight: 700, color: scoreBorderColor, marginBottom: '4px' }}>
            {risk.categoryLabel} ({risk.score} / 100)
          </h4>
          <p>
            {risk.score < 30 ? (
              'Screen capture exhibits visual, metadata, and structural consistency with genuine UPI payment receipts.'
            ) : risk.score < 60 ? (
              'Moderate anomalies or compression variances identified. Manual confirmation through banking records is required.'
            ) : (
              'Critical forensic anomalies or formatting discrepancies detected. Heightened probability of image manipulation.'
            )}
          </p>
        </div>
      </div>

      {/* Itemized Evidence Factors Table */}
      <div style={{ marginTop: '20px', marginBottom: '20px' }}>
        <h4 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '12px', color: 'var(--color-primary-text)' }}>
          Itemized Evidence & Signal Breakdown
        </h4>

        <div className="fintech-table-container" style={{ border: '1px solid var(--color-border)', borderRadius: '6px' }}>
          <table className="fintech-table">
            <thead>
              <tr>
                <th>Origin Layer</th>
                <th>Observation</th>
                <th>Detailed Explanation</th>
                <th style={{ textAlign: 'right' }}>Score Impact</th>
              </tr>
            </thead>
            <tbody>
              {risk.evidenceFactors.map((item, idx) => (
                <tr key={idx}>
                  <td style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-secondary-text)', whiteSpace: 'nowrap' }}>
                    {item.layer}
                  </td>
                  <td>
                    <Badge variant={item.severity === 'high' ? 'high' : item.severity === 'medium' ? 'medium' : item.severity === 'low' ? 'low' : 'neutral'}>
                      {item.title}
                    </Badge>
                  </td>
                  <td style={{ fontSize: '13px' }}>
                    {item.description}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 600, color: item.points > 0 ? 'var(--color-risk-high)' : 'var(--color-risk-low)', whiteSpace: 'nowrap' }}>
                    {item.points > 0 ? `+${item.points} pts` : '0 pts'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Actionable Next Steps */}
      {risk.recommendations && risk.recommendations.length > 0 && (
        <div style={{ marginBottom: '20px', padding: '16px', background: '#F8FAFC', borderRadius: '6px', border: '1px solid var(--color-border)' }}>
          <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '10px', color: 'var(--color-primary-text)' }}>
            Recommended Next Verification Actions:
          </h4>
          <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: 'var(--color-secondary-text)' }}>
            {risk.recommendations.map((rec, i) => (
              <li key={i}>{rec}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Important Principles Notice */}
      <div className="layer-notice" style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
        <Info size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
        <span>
          <strong>Methodology Note:</strong> {risk.disclaimer} Missing metadata alone is not treated as evidence of manipulation.
        </span>
      </div>

      {/* Final Recommendation */}
      <div className="final-recommendation-box">
        <AlertTriangle size={20} />
        <div>
          <div style={{ fontWeight: 600, marginBottom: '2px' }}>Final Operational Recommendation</div>
          <p>
            Do not release goods based solely on a payment screenshot. Confirm that funds have been credited to your account.
          </p>
        </div>
      </div>
    </div>
  );
};
