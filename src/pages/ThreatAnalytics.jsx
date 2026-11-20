import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart2, 
  ShieldAlert, 
  AlertOctagon, 
  AlertTriangle, 
  CheckCircle, 
  Activity,
  Layers,
  FileCheck
} from 'lucide-react';
import { useScan } from '../context/ScanContext';
import { SummaryCard } from '../components/dashboard/SummaryCard';
import { EmptyState } from '../components/common/EmptyState';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';

export const ThreatAnalytics = () => {
  const navigate = useNavigate();
  const { scans, stats } = useScan();
  const hasData = scans && scans.length > 0;

  return (
    <div>
      {/* 4 Summary Cards based on actual data */}
      <div className="summary-cards-grid">
        <SummaryCard
          label="Total Screenshots Analyzed"
          value={stats.total}
          icon={Activity}
          type="total"
          description="Local inspection volume"
        />
        <SummaryCard
          label="High Suspicion Findings"
          value={stats.high}
          icon={AlertOctagon}
          type="high"
          description="Critical risk flags"
        />
        <SummaryCard
          label="Medium Suspicion Findings"
          value={stats.medium}
          icon={AlertTriangle}
          type="medium"
          description="Inconclusive patterns"
        />
        <SummaryCard
          label="Low Suspicion Findings"
          value={stats.low}
          icon={CheckCircle}
          type="low"
          description="Standard characteristics"
        />
      </div>

      {!hasData ? (
        <div className="fintech-card" style={{ marginTop: '24px' }}>
          <EmptyState
            icon={BarChart2}
            title="No Threat Analytics Data"
            description="Statistical trends and pattern metrics require analyzed screenshots. Upload payment screenshots to compute risk distribution, common warning indicators, and OCR performance."
            actionLabel="Start New Scan"
            onAction={() => navigate('/new-scan')}
          />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Suspicion Distribution & Performance */}
          <div className="dashboard-grid-two-col">
            <Card>
              <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>
                Suspicion Distribution
              </h2>
              <p className="text-secondary" style={{ fontSize: '13px', marginBottom: '20px' }}>
                Distribution derived from {stats.total} analyzed screenshot{stats.total > 1 ? 's' : ''}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px' }}>
                    <span style={{ color: 'var(--color-risk-high)', fontWeight: 600 }}>High Suspicion</span>
                    <span style={{ fontWeight: 600 }}>{stats.high} ({Math.round((stats.high / stats.total) * 100)}%)</span>
                  </div>
                  <div style={{ height: '8px', background: '#F0F4F8', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: 'var(--color-risk-high)', width: `${(stats.high / stats.total) * 100}%` }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px' }}>
                    <span style={{ color: 'var(--color-risk-medium)', fontWeight: 600 }}>Medium Suspicion</span>
                    <span style={{ fontWeight: 600 }}>{stats.medium} ({Math.round((stats.medium / stats.total) * 100)}%)</span>
                  </div>
                  <div style={{ height: '8px', background: '#F0F4F8', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: 'var(--color-risk-medium)', width: `${(stats.medium / stats.total) * 100}%` }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px' }}>
                    <span style={{ color: 'var(--color-risk-low)', fontWeight: 600 }}>Low Suspicion</span>
                    <span style={{ fontWeight: 600 }}>{stats.low} ({Math.round((stats.low / stats.total) * 100)}%)</span>
                  </div>
                  <div style={{ height: '8px', background: '#F0F4F8', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: 'var(--color-risk-low)', width: `${(stats.low / stats.total) * 100}%` }} />
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>
                Analysis Performance
              </h2>
              <p className="text-secondary" style={{ fontSize: '13px', marginBottom: '16px' }}>
                Pipeline execution metrics
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px', fontSize: '13px' }}>
                  <span className="text-secondary">OCR Success Rate</span>
                  <span style={{ fontWeight: 600 }}>Awaiting OCR</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px', fontSize: '13px' }}>
                  <span className="text-secondary">Avg Pipeline Time</span>
                  <span style={{ fontWeight: 600 }}>Local &lt; 100ms</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span className="text-secondary">Threat Database Sync</span>
                  <span style={{ fontWeight: 600, color: 'var(--color-secondary-text)' }}>Local Offline Mode</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Common Warning Indicators */}
          <Card>
            <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>
              Common Warning Indicators
            </h2>
            <p className="text-secondary" style={{ fontSize: '13px', marginBottom: '16px' }}>
              Observed risk signals across processed screenshots
            </p>

            <div style={{ padding: '16px', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '13px', color: 'var(--color-secondary-text)' }}>
              No common warning anomalies recorded yet. As additional screenshots are evaluated through the 5 forensic layers, recurring anomaly patterns (e.g. font substitution, compression borders, date mismatches) will be tabulated here.
            </div>
          </Card>
        </div>
      )}

      {/* Institutional Fintech Notice */}
      <div className="security-notice-banner" style={{ marginTop: '24px' }}>
        <ShieldAlert size={18} />
        <div style={{ fontSize: '13px' }}>
          <strong>Analytical Integrity:</strong> Threat analytics are computed exclusively from records analyzed in your local session. This prototype does not query external fraud repositories or transmit screenshot telemetry.
        </div>
      </div>
    </div>
  );
};
