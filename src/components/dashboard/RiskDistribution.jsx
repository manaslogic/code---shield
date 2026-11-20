import React from 'react';
import { PieChart } from 'lucide-react';
import { EmptyState } from '../common/EmptyState';

export const RiskDistribution = ({ stats }) => {
  const hasData = stats && stats.total > 0;

  return (
    <div className="fintech-card" style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '16px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 600 }}>Risk Distribution</h2>
        <span className="text-metadata">Proportion of flagged anomalies</span>
      </div>

      {!hasData ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <EmptyState
            icon={PieChart}
            title="No Risk Data"
            description="Distribution metrics will generate automatically as screenshots are examined."
          />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '10px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px' }}>
              <span style={{ color: 'var(--color-risk-high)', fontWeight: 600 }}>High Suspicion</span>
              <span style={{ fontWeight: 600 }}>{stats.high} ({Math.round((stats.high / stats.total) * 100)}%)</span>
            </div>
            <div style={{ height: '8px', background: '#F0F4F8', borderRadius: '4px', overflow: 'hidden' }}>
              <div 
                style={{ 
                  height: '100%', 
                  background: 'var(--color-risk-high)', 
                  width: `${(stats.high / stats.total) * 100}%` 
                }} 
              />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px' }}>
              <span style={{ color: 'var(--color-risk-medium)', fontWeight: 600 }}>Medium Suspicion</span>
              <span style={{ fontWeight: 600 }}>{stats.medium} ({Math.round((stats.medium / stats.total) * 100)}%)</span>
            </div>
            <div style={{ height: '8px', background: '#F0F4F8', borderRadius: '4px', overflow: 'hidden' }}>
              <div 
                style={{ 
                  height: '100%', 
                  background: 'var(--color-risk-medium)', 
                  width: `${(stats.medium / stats.total) * 100}%` 
                }} 
              />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px' }}>
              <span style={{ color: 'var(--color-risk-low)', fontWeight: 600 }}>Low Suspicion</span>
              <span style={{ fontWeight: 600 }}>{stats.low} ({Math.round((stats.low / stats.total) * 100)}%)</span>
            </div>
            <div style={{ height: '8px', background: '#F0F4F8', borderRadius: '4px', overflow: 'hidden' }}>
              <div 
                style={{ 
                  height: '100%', 
                  background: 'var(--color-risk-low)', 
                  width: `${(stats.low / stats.total) * 100}%` 
                }} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
