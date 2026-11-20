import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { History, Search, Trash2, Eye, Filter, Calendar } from 'lucide-react';
import { useScan } from '../context/ScanContext';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { ConfirmDialog } from '../components/common/ConfirmDialog';

export const ScanHistory = () => {
  const navigate = useNavigate();
  const { scans, deleteScanRecord, clearScanHistory } = useScan();
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [recordToDelete, setRecordToDelete] = useState(null);

  // Filter logic
  const filteredScans = useMemo(() => {
    return scans.filter((scan) => {
      // Search filter
      const matchesSearch = scan.fileName
        .toLowerCase()
        .includes(searchQuery.toLowerCase().trim());

      // Risk filter
      const matchesRisk = 
        riskFilter === 'all' || 
        scan.riskLevel === riskFilter;

      // Date filter
      let matchesDate = true;
      if (dateFilter !== 'all') {
        const scanTime = new Date(scan.scanDate).getTime();
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;

        if (dateFilter === 'today') {
          matchesDate = now - scanTime <= oneDay;
        } else if (dateFilter === '7days') {
          matchesDate = now - scanTime <= 7 * oneDay;
        } else if (dateFilter === '30days') {
          matchesDate = now - scanTime <= 30 * oneDay;
        }
      }

      return matchesSearch && matchesRisk && matchesDate;
    });
  }, [scans, searchQuery, riskFilter, dateFilter]);

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

  const handleDeleteConfirm = () => {
    if (recordToDelete) {
      deleteScanRecord(recordToDelete);
      setRecordToDelete(null);
    }
  };

  return (
    <div>
      {/* Filter and Search Bar */}
      <div className="filter-bar">
        <div className="search-input-wrapper">
          <Search size={16} />
          <input
            type="text"
            className="form-input"
            placeholder="Search by file name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <select
          className="form-select"
          value={riskFilter}
          onChange={(e) => setRiskFilter(e.target.value)}
          aria-label="Filter by suspicion level"
        >
          <option value="all">All Suspicion Levels</option>
          <option value="high">High Suspicion</option>
          <option value="medium">Medium Suspicion</option>
          <option value="low">Low Suspicion</option>
          <option value="pending">Pending</option>
        </select>

        <select
          className="form-select"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          aria-label="Filter by date range"
        >
          <option value="all">All Dates</option>
          <option value="today">Today</option>
          <option value="7days">Past 7 Days</option>
          <option value="30days">Past 30 Days</option>
        </select>

        {(searchQuery || riskFilter !== 'all' || dateFilter !== 'all') && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchQuery('');
              setRiskFilter('all');
              setDateFilter('all');
            }}
          >
            Reset Filters
          </Button>
        )}
      </div>

      {/* Main Table or Empty State */}
      {scans.length === 0 ? (
        <div className="fintech-card">
          <EmptyState
            icon={History}
            title="No scan history available"
            description="Your analyzed screenshots will appear here."
            actionLabel="Start New Scan"
            onAction={() => navigate('/new-scan')}
          />
        </div>
      ) : filteredScans.length === 0 ? (
        <div className="fintech-card">
          <EmptyState
            icon={Search}
            title="No Matching Records"
            description="Try adjusting your search criteria or clear the filters to view all records."
          />
        </div>
      ) : (
        <div className="fintech-table-container">
          <table className="fintech-table">
            <thead>
              <tr>
                <th>File Name</th>
                <th>File Size</th>
                <th>Amount</th>
                <th>Risk Level</th>
                <th>Scan Date</th>
                <th>Analysis Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredScans.map((scan) => (
                <tr key={scan.id}>
                  <td style={{ fontWeight: 600 }}>{scan.fileName}</td>
                  <td className="text-secondary">{scan.fileSize || '—'}</td>
                  <td>{scan.amount ? `₹${scan.amount}` : '—'}</td>
                  <td>{getRiskBadge(scan.riskLevel)}</td>
                  <td>{new Date(scan.scanDate).toLocaleString()}</td>
                  <td>
                    <Badge variant="neutral" showDot={false}>
                      {scan.status || 'Completed'}
                    </Badge>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={Eye}
                        onClick={() => navigate(`/forensic-analysis?recordId=${scan.id}`)}
                        title="View Analysis"
                      >
                        View
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={Trash2}
                        onClick={() => setRecordToDelete(scan.id)}
                        title="Delete record"
                        style={{ color: 'var(--color-risk-high)' }}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirmation Dialog for single record deletion */}
      <ConfirmDialog
        isOpen={!!recordToDelete}
        title="Delete Scan Record"
        message="Are you sure you want to remove this record from your history? This action cannot be undone."
        confirmLabel="Delete"
        isDestructive={true}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setRecordToDelete(null)}
      />
    </div>
  );
};
