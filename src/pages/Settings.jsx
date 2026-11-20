import React, { useState } from 'react';
import { 
  Shield, 
  Sliders, 
  Scale, 
  Database, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle,
  Info,
  Store,
  Save,
  Check
} from 'lucide-react';
import { useScan } from '../context/ScanContext';
import { Button } from '../components/common/Button';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Badge } from '../components/common/Badge';

export const Settings = () => {
  const { scans, clearScanHistory, merchantUpiId, setMerchantUpiId } = useScan();
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [clearedNotice, setClearedNotice] = useState(false);
  const [shopUpiInput, setShopUpiInput] = useState(merchantUpiId || '');
  const [saveUpiNotice, setSaveUpiNotice] = useState(false);

  const handleSaveUpi = (e) => {
    e.preventDefault();
    setMerchantUpiId(shopUpiInput.trim());
    setSaveUpiNotice(true);
    setTimeout(() => setSaveUpiNotice(false), 3000);
  };

  const handleClearHistory = () => {
    clearScanHistory();
    setIsClearModalOpen(false);
    setClearedNotice(true);
    setTimeout(() => setClearedNotice(false), 4000);
  };

  return (
    <div className="settings-container">
      {clearedNotice && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 16px',
          backgroundColor: 'var(--color-risk-low-bg)',
          border: '1px solid var(--color-risk-low-border)',
          borderRadius: 'var(--radius-button)',
          color: 'var(--color-risk-low)',
          fontSize: '13px',
          fontWeight: 500
        }}>
          <CheckCircle2 size={16} />
          <span>Local scan history and cached records have been successfully deleted.</span>
        </div>
      )}

      {/* Section 0: Merchant Profile & Expected UPI ID */}
      <div className="settings-card" style={{ borderLeft: '4px solid var(--color-primary-accent)' }}>
        <div className="settings-card-header">
          <h2>
            <Store size={20} color="var(--color-primary-accent)" />
            Merchant Profile & Shop UPI ID
          </h2>
          <p>Configure your business UPI VPA for automated cross-checking against scanned payment screenshots</p>
        </div>

        <form onSubmit={handleSaveUpi} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
              Your Registered Shop / Counter UPI ID
            </label>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="e.g. yourshop@okhdfcbank or merchant@paytm"
                value={shopUpiInput}
                onChange={(e) => setShopUpiInput(e.target.value)}
                style={{
                  flex: 1,
                  minWidth: '240px',
                  padding: '9px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--color-border)',
                  fontSize: '14px',
                  fontFamily: 'monospace',
                  background: '#FFFFFF'
                }}
              />
              <Button
                type="submit"
                variant="primary"
                size="md"
                icon={saveUpiNotice ? Check : Save}
              >
                {saveUpiNotice ? 'Saved!' : 'Save Shop UPI'}
              </Button>
            </div>
          </div>

          <div className="text-secondary" style={{ fontSize: '12px', lineHeight: 1.5 }}>
            💡 <strong>Why configure this?</strong> Scammers frequently show real or edited screenshots of payments made to someone else or a mule account. When you set your UPI ID here, every scan automatically runs an extra cross-check: if the beneficiary in the screenshot doesn't match your shop ID, a severe suspicion alert (+65 risk score) is triggered instantly.
          </div>

          {merchantUpiId && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              background: '#F0F9FF',
              border: '1px solid #BAE6FD',
              borderRadius: '6px',
              fontSize: '12px',
              color: '#0369A1'
            }}>
              <CheckCircle2 size={14} color="#0284C7" />
              <span>Active verification target: <strong>{merchantUpiId}</strong></span>
            </div>
          )}
        </form>
      </div>

      {/* Section A: Privacy */}
      <div className="settings-card">
        <div className="settings-card-header">
          <h2>
            <Shield size={20} color="var(--color-primary-accent)" />
            Privacy & Architecture
          </h2>
          <p>Local processing model and client-side data boundaries</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '14px', color: 'var(--color-primary-text)' }}>
          <div>
            <h4 style={{ fontWeight: 600, marginBottom: '4px' }}>Local-First Execution</h4>
            <p className="text-secondary" style={{ fontSize: '13px' }}>
              In this prototype environment, all image manipulation, inspection routines, and validation logic run entirely within your local browser sandbox. Uploaded screenshots are held in temporary browser memory and are never transmitted to third-party endpoints or external cloud servers.
            </p>
          </div>

          <div>
            <h4 style={{ fontWeight: 600, marginBottom: '4px' }}>Data Storage Boundaries</h4>
            <p className="text-secondary" style={{ fontSize: '13px' }}>
              Only lightweight transactional metadata (such as timestamps, file names, and suspicion classifications) is retained in the browser's LocalStorage. Raw image pixel data and sensitive buyer credentials are intentionally excluded from permanent client storage.
            </p>
          </div>

          <div className="layer-notice" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Info size={16} style={{ flexShrink: 0 }} />
            <span>
              <strong>Testing Advisory:</strong> Avoid uploading real customer payment information during prototype testing.
            </span>
          </div>
        </div>
      </div>

      {/* Section B: Scan Preferences */}
      <div className="settings-card">
        <div className="settings-card-header">
          <h2>
            <Sliders size={20} color="var(--color-primary-accent)" />
            Scan Preferences
          </h2>
          <p>Configured verification boundaries and intake parameters</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '14px' }}>Maximum File Size</div>
              <div className="text-secondary" style={{ fontSize: '12px' }}>Screenshots exceeding this limit are rejected at intake</div>
            </div>
            <span style={{ fontWeight: 600, fontSize: '14px' }}>10 MB</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '14px' }}>Supported Image Formats</div>
              <div className="text-secondary" style={{ fontSize: '12px' }}>Standard raster payment screenshot formats</div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <Badge variant="neutral">PNG</Badge>
              <Badge variant="neutral">JPG</Badge>
              <Badge variant="neutral">JPEG</Badge>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '14px' }}>Default Analysis Mode</div>
              <div className="text-secondary" style={{ fontSize: '12px' }}>Execution depth across verification layers</div>
            </div>
            <Badge variant="low">Full 5-Layer Pipeline</Badge>
          </div>
        </div>
      </div>

      {/* Section C: Risk Methodology */}
      <div className="settings-card">
        <div className="settings-card-header">
          <h2>
            <Scale size={20} color="var(--color-primary-accent)" />
            Risk Methodology & Calibration
          </h2>
          <p>Mathematical scoring parameters utilized in prototype classifications</p>
        </div>

        <div style={{ fontSize: '13px', color: 'var(--color-secondary-text)', lineHeight: 1.5 }}>
          The UPI Shield risk engine computes a composite suspicion score ranging from 0 to 100 based on weighted signals across OCR, metadata, visual integrity, and transaction consistency.
        </div>

        <table className="threshold-table">
          <thead>
            <tr>
              <th>Suspicion Score</th>
              <th>Classification</th>
              <th>Operational Meaning</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ fontWeight: 600 }}>0 – 29</td>
              <td><Badge variant="low">Low Suspicion</Badge></td>
              <td>Image structure aligns with standard payment receipt layouts.</td>
            </tr>
            <tr>
              <td style={{ fontWeight: 600 }}>30 – 59</td>
              <td><Badge variant="medium">Medium Suspicion</Badge></td>
              <td>Minor font or compression anomalies detected; manual scrutiny suggested.</td>
            </tr>
            <tr>
              <td style={{ fontWeight: 600 }}>60 – 100</td>
              <td><Badge variant="high">High Suspicion</Badge></td>
              <td>Critical inconsistencies observed (e.g. edited text boxes, invalid Txn format).</td>
            </tr>
          </tbody>
        </table>

        <div className="layer-notice" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={16} color="var(--color-risk-medium)" style={{ flexShrink: 0 }} />
          <span>
            <strong>Calibration Disclaimer:</strong> These score thresholds are prototype standards established for initial testing. They are subject to continuous algorithmic calibration and empirical validation.
          </span>
        </div>
      </div>

      {/* Section D: Data Management */}
      <div className="settings-card">
        <div className="settings-card-header">
          <h2>
            <Database size={20} color="var(--color-primary-accent)" />
            Data Management
          </h2>
          <p>Inspect local state storage and manage historical records</p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: '14px' }}>Clear Scan History</div>
            <div className="text-secondary" style={{ fontSize: '13px' }}>
              Currently storing {scans.length} scan record{scans.length === 1 ? '' : 's'} in LocalStorage.
            </div>
          </div>
          <Button
            variant="danger"
            size="sm"
            icon={Trash2}
            disabled={scans.length === 0}
            onClick={() => setIsClearModalOpen(true)}
          >
            Clear History
          </Button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isClearModalOpen}
        title="Clear All Scan History?"
        message="This will permanently delete all stored scan records and metrics from your local browser storage. This action cannot be reversed."
        confirmLabel="Clear All Records"
        cancelLabel="Cancel"
        isDestructive={true}
        onConfirm={handleClearHistory}
        onCancel={() => setIsClearModalOpen(false)}
      />
    </div>
  );
};
