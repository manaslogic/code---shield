import React from 'react';
import { ShieldCheck, AlertOctagon, AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';
import { useScan } from '../context/ScanContext';
import { SummaryCard } from '../components/dashboard/SummaryCard';
import { QuickScan } from '../components/dashboard/QuickScan';
import { RecentScans } from '../components/dashboard/RecentScans';
import { RiskDistribution } from '../components/dashboard/RiskDistribution';

export const Dashboard = () => {
  const { scans, stats } = useScan();

  return (
    <div>
      {/* 4 Summary Cards */}
      <div className="summary-cards-grid">
        <SummaryCard
          label="Total Scans"
          value={stats.total}
          icon={ShieldCheck}
          type="total"
          description="Analyzed payment records"
        />
        <SummaryCard
          label="High Suspicion"
          value={stats.high}
          icon={AlertOctagon}
          type="high"
          description="Significant anomalies detected"
        />
        <SummaryCard
          label="Medium Suspicion"
          value={stats.medium}
          icon={AlertTriangle}
          type="medium"
          description="Moderate inconsistencies"
        />
        <SummaryCard
          label="Low Suspicion"
          value={stats.low}
          icon={CheckCircle}
          type="low"
          description="Consistent visual attributes"
        />
      </div>

      {/* Quick Scan Section */}
      <div className="dashboard-action-row">
        <QuickScan />
      </div>

      {/* Grid: Recent Scans + Risk Distribution */}
      <div className="dashboard-grid-two-col">
        <RecentScans scans={scans} />
        <RiskDistribution stats={stats} />
      </div>

      {/* Mandatory Security Notice */}
      <div className="security-notice-banner">
        <ShieldAlert size={20} />
        <div>
          <strong>Security Notice:</strong> UPI Shield analyzes screenshot characteristics. Always verify actual payment receipt through your bank or authorized payment provider.
        </div>
      </div>
    </div>
  );
};
