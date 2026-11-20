import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, FileText } from 'lucide-react';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { EmptyState } from '../common/EmptyState';

export const RecentScans = ({ scans = [] }) => {
  const navigate = useNavigate();

  if (!scans || scans.length === 0) {
    return (
      <div className="fintech-card" style={{ padding: '0px' }}>
        <div style={{ padding: '20px 20px 0 20px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600 }}>Recent Scan Activity</h2>
        </div>
        <EmptyState
          icon={FileText}
          title="No scans yet"
          description="Upload your first payment screenshot to begin analysis."
          actionLabel="Start New Scan"
          onAction={() => navigate('/new-scan')}
        />
      </div>
    );
  }

  const getRiskBadge = (level) => {
    switch (level) {
      case 'high':
        return <Badge variant="high">High Suspicion</Badge>;
      case 'medium':
        return <Badge variant="medium">Medium Suspicion</Badge>;
      case 'low':
        return <Badge variant="low">Low Suspicion</Badge>;
      default:
        return <Badge variant="neutral">Pending</Badge>;
    }
  };

  return (
    <div className="fintech-card" style={{ padding: '0px' }}>
      <div style={{ padding: '20px 20px 14px 20px', borderBottom: '1px solid var(--color-border)' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 600 }}>Recent Scan Activity</h2>
      </div>
      <div className="fintech-table-container" style={{ border: 'none', borderRadius: 0 }}>
        <table className="fintech-table">
          <thead>
            <tr>
              <th>File Name</th>
              <th>Amount</th>
              <th>Risk Level</th>
              <th>Scan Date</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {scans.slice(0, 5).map((scan) => (
              <tr key={scan.id}>
                <td style={{ fontWeight: 500 }}>{scan.fileName}</td>
                <td>{scan.amount ? `₹${scan.amount}` : '—'}</td>
                <td>{getRiskBadge(scan.riskLevel)}</td>
                <td>{new Date(scan.scanDate).toLocaleDateString()}</td>
                <td>
                  <Badge variant="neutral" showDot={false}>
                    {scan.status || 'Completed'}
                  </Badge>
                </td>
                <td style={{ textAlign: 'right' }}>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      icon={Eye}
                      onClick={() => navigate(`/forensic-analysis?recordId=${scan.id}`)}
                  >
                    View
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
