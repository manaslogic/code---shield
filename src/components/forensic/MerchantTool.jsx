import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  ExternalLink, 
  ShieldCheck, 
  AlertTriangle, 
  Calendar, 
  Search, 
  CreditCard,
  Building,
  Smartphone
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

export const MerchantTool = ({ analysis, scanId }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('gpay');
  const [bankSettled, setBankSettled] = useState(null); // true, false, or null

  const upi = analysis?.upiResult;
  const utr = upi?.utrId || upi?.transactionId;
  const decoded = upi?.utrDecoded;

  const handleCopy = () => {
    if (!utr) return;
    navigator.clipboard.writeText(utr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fintech-card" style={{ marginTop: '24px', borderTop: '4px solid var(--color-primary-accent)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
        <div>
          <h3 style={{ fontSize: '17px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={20} color="var(--color-primary-accent)" />
            Interactive Merchant Verification Assistant
          </h3>
          <p className="text-secondary" style={{ fontSize: '13px' }}>
            Algorithmic UTR breakdown and official merchant settlement cross-check guide
          </p>
        </div>

        {utr && (
          <Button
            variant={copied ? 'secondary' : 'primary'}
            size="sm"
            icon={copied ? Check : Copy}
            onClick={handleCopy}
          >
            {copied ? 'Copied UTR to Clipboard!' : `Copy UTR (${utr})`}
          </Button>
        )}
      </div>

      {/* 0. Beneficiary Shop UPI ID Match Alert */}
      {upi?.beneficiaryCheck?.tested && (
        <div style={{
          padding: '14px 18px',
          borderRadius: '6px',
          marginBottom: '20px',
          border: upi.beneficiaryCheck.isMismatch
            ? '1px solid var(--color-risk-high-border)'
            : upi.beneficiaryCheck.isMatch
              ? '1px solid var(--color-risk-low-border)'
              : '1px solid var(--color-border)',
          background: upi.beneficiaryCheck.isMismatch
            ? 'var(--color-risk-high-bg)'
            : upi.beneficiaryCheck.isMatch
              ? 'var(--color-risk-low-bg)'
              : '#F8FAFC'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {upi.beneficiaryCheck.isMismatch ? (
                <AlertTriangle size={20} color="var(--color-risk-high)" />
              ) : upi.beneficiaryCheck.isMatch ? (
                <ShieldCheck size={20} color="var(--color-risk-low)" />
              ) : (
                <AlertTriangle size={20} color="var(--color-risk-medium)" />
              )}
              <div>
                <strong style={{
                  fontSize: '14px',
                  color: upi.beneficiaryCheck.isMismatch
                    ? 'var(--color-risk-high)'
                    : upi.beneficiaryCheck.isMatch
                      ? 'var(--color-risk-low)'
                      : 'var(--color-primary-text)'
                }}>
                  {upi.beneficiaryCheck.isMismatch
                    ? 'CRITICAL BENEFICIARY MISMATCH DETECTED'
                    : upi.beneficiaryCheck.isMatch
                      ? 'SHOP BENEFICIARY MATCH CONFIRMED'
                      : 'BENEFICIARY UNVERIFIED IN SCREENSHOT'}
                </strong>
                <div style={{ fontSize: '13px', marginTop: '2px', color: 'var(--color-primary-text)' }}>
                  {upi.beneficiaryCheck.isMismatch && (
                    <span>Customer paid to <code>{upi.beneficiaryCheck.extractedUpiId || upi.upiId}</code>, but your shop UPI ID is <code>{upi.beneficiaryCheck.expectedUpiId}</code>. This payment went to a different account!</span>
                  )}
                  {upi.beneficiaryCheck.isMatch && (
                    <span>Payment beneficiary handle <code>{upi.beneficiaryCheck.extractedUpiId || upi.upiId}</code> matches your registered shop account (<code>{upi.beneficiaryCheck.expectedUpiId}</code>).</span>
                  )}
                  {upi.beneficiaryCheck.isMissing && (
                    <span>Screenshot does not visibly disclose the receiving UPI ID to compare against your expected account (<code>{upi.beneficiaryCheck.expectedUpiId}</code>).</span>
                  )}
                </div>
              </div>
            </div>
            <Badge variant={upi.beneficiaryCheck.isMismatch ? 'high' : upi.beneficiaryCheck.isMatch ? 'low' : 'medium'}>
              {upi.beneficiaryCheck.isMismatch ? '+65 Risk Penalty' : upi.beneficiaryCheck.isMatch ? 'Verified Account' : 'Needs Verification'}
            </Badge>
          </div>
        </div>
      )}

      {/* 1. NPCI UTR Julian Breakdown Visualizer */}
      <div style={{
        background: '#F8FAFC',
        border: '1px solid var(--color-border)',
        borderRadius: '6px',
        padding: '16px 20px',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-primary-text)' }}>
            NPCI 12-Digit Algorithmic Structure:
          </span>
          {decoded?.isTemporalMatch && (
            <Badge variant="low">Temporal Match Verified</Badge>
          )}
          {decoded?.isTemporalMismatch && (
            <Badge variant="high">Temporal Mismatch Flagged</Badge>
          )}
          {decoded?.isImpossibleJulianDay && (
            <Badge variant="high">Impossible Julian Day</Badge>
          )}
        </div>

        {decoded?.isValidFormat ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{
                background: '#FFFFFF',
                border: '1px solid var(--color-border)',
                borderRadius: '6px',
                padding: '8px 12px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '11px', color: 'var(--color-secondary-text)', textTransform: 'uppercase' }}>Year Digit</div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-primary-accent)' }}>{decoded.yearDigit}</div>
                <div style={{ fontSize: '11px', color: 'var(--color-primary-text)' }}>Year {decoded.decodedYear}</div>
              </div>

              <div style={{ fontSize: '18px', fontWeight: 300, color: '#9FB3C8' }}>+</div>

              <div style={{
                background: '#FFFFFF',
                border: '1px solid var(--color-border)',
                borderRadius: '6px',
                padding: '8px 12px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '11px', color: 'var(--color-secondary-text)', textTransform: 'uppercase' }}>Julian Day</div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: decoded.isImpossibleJulianDay ? 'var(--color-risk-high)' : 'var(--color-primary-accent)' }}>
                  {decoded.julianDay}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--color-primary-text)' }}>
                  {decoded.formattedDecodedDate}
                </div>
              </div>

              <div style={{ fontSize: '18px', fontWeight: 300, color: '#9FB3C8' }}>+</div>

              <div style={{
                background: '#FFFFFF',
                border: '1px solid var(--color-border)',
                borderRadius: '6px',
                padding: '8px 12px',
                textAlign: 'center',
                flex: 1,
                minWidth: '140px'
              }}>
                <div style={{ fontSize: '11px', color: 'var(--color-secondary-text)', textTransform: 'uppercase' }}>Sequence ID</div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-primary-text)', letterSpacing: '0.05em' }}>
                  {decoded.sequenceNum}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--color-secondary-text)' }}>Clearing Reference</div>
              </div>
            </div>

            <div style={{ fontSize: '12px', color: 'var(--color-secondary-text)', borderTop: '1px solid #E2E8F0', paddingTop: '8px' }}>
              <strong>Algorithmic Meaning:</strong> A UTR starting with <code>{decoded.yearDigit}{String(decoded.julianDay).padStart(3, '0')}</code> corresponds to banking clearing date <strong>{decoded.formattedDecodedDate}</strong>.
              {decoded.receiptDateStr && (
                <span> Receipt states <strong>{decoded.receiptDateStr}</strong> ({decoded.isTemporalMismatch ? `⚠️ differs by ${decoded.temporalDifferenceDays} days` : '✓ matches precisely'}).</span>
              )}
            </div>
          </div>
        ) : (
          <div style={{ fontSize: '13px', color: 'var(--color-secondary-text)' }}>
            {upi?.isUtrLengthInvalid ? (
              <span style={{ color: 'var(--color-risk-high)', fontWeight: 600 }}>
                ⚠️ Anomalous UTR: Captured identifier has {upi.utrId?.length} digits ("{upi.utrId}"). Authentic Indian NPCI UPI UTRs must be exactly 12 digits.
              </span>
            ) : (
              'Upload a payment screenshot containing a 12-digit UTR to view the algorithmic year and Julian calendar breakdown.'
            )}
          </div>
        )}
      </div>

      {/* 2. Merchant App Verification Guides */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '10px', color: 'var(--color-primary-text)' }}>
          How to verify this payment in your merchant apps:
        </h4>

        {/* Tab buttons */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
          <button
            className={`btn btn-sm ${activeTab === 'gpay' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('gpay')}
          >
            Google Pay for Business
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'phonepe' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('phonepe')}
          >
            PhonePe Business
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'paytm' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('paytm')}
          >
            Paytm for Business / Soundbox
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'bank' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('bank')}
          >
            Bank SMS & NetBanking
          </button>
        </div>

        {/* Tab Content */}
        <div style={{ background: '#F8FAFC', padding: '14px 18px', borderRadius: '6px', fontSize: '13px', lineHeight: 1.6, color: 'var(--color-primary-text)' }}>
          {activeTab === 'gpay' && (
            <div>
              <strong>In Google Pay for Business:</strong>
              <ol style={{ paddingLeft: '18px', marginTop: '6px' }}>
                <li>Open your <strong>Google Pay for Business</strong> app.</li>
                <li>Tap on <strong>Transactions</strong> or <strong>Payment History</strong>.</li>
                <li>Tap the <strong>Search icon (🔍)</strong> at the top right.</li>
                <li>Paste the copied UTR <code>{utr || '(copy from above)'}</code>.</li>
                <li>If the transaction is genuine, the green payment card with customer name will appear immediately.</li>
              </ol>
            </div>
          )}

          {activeTab === 'phonepe' && (
            <div>
              <strong>In PhonePe Business:</strong>
              <ol style={{ paddingLeft: '18px', marginTop: '6px' }}>
                <li>Open your <strong>PhonePe Business</strong> app.</li>
                <li>Tap the <strong>History</strong> tab at the bottom.</li>
                <li>Tap <strong>Filters</strong> ➡️ select <strong>Search by UTR / Reference ID</strong>.</li>
                <li>Paste <code>{utr || '(copy from above)'}</code> and hit Search.</li>
                <li>Only release goods if PhonePe displays <strong>"Payment Received"</strong>.</li>
              </ol>
            </div>
          )}

          {activeTab === 'paytm' && (
            <div>
              <strong>In Paytm for Business & Paytm Soundbox:</strong>
              <ol style={{ paddingLeft: '18px', marginTop: '6px' }}>
                <li>Listen to your <strong>Paytm Soundbox</strong> voice announcement. If it did not speak, funds did NOT clear.</li>
                <li>Open <strong>Paytm for Business</strong> app ➡️ go to <strong>Settlements / Payments</strong>.</li>
                <li>Look for payment amount <strong>₹{upi?.amount || '...'}</strong> in today's real-time list.</li>
                <li>Cross-check the 12-digit UPI Reference Number against <code>{utr || '...'}</code>.</li>
              </ol>
            </div>
          )}

          {activeTab === 'bank' && (
            <div>
              <strong>In Bank SMS / Mobile NetBanking:</strong>
              <ol style={{ paddingLeft: '18px', marginTop: '6px' }}>
                <li>Search your phone's SMS inbox for sender ID (e.g., <code>HDFCBK</code>, <code>SBINB</code>, <code>ICICIB</code>, <code>AXISBK</code>).</li>
                <li>Search for: <code>credited by UPI/{utr || '...'}</code>.</li>
                <li>Or open your official Bank App (YONO, iMobile, HDFC) and check <strong>Recent Transactions</strong>.</li>
              </ol>
            </div>
          )}
        </div>
      </div>

      {/* 3. "Mark Settlement Status" Toggle */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        padding: '14px 18px',
        background: bankSettled === true ? 'var(--color-risk-low-bg)' : bankSettled === false ? 'var(--color-risk-high-bg)' : '#FFFFFF',
        border: `1px solid ${bankSettled === true ? 'var(--color-risk-low-border)' : bankSettled === false ? 'var(--color-risk-high-border)' : 'var(--color-border)'}`,
        borderRadius: '6px'
      }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: '13px' }}>Merchant Settlement Check Outcome:</div>
          <div className="text-secondary" style={{ fontSize: '12px' }}>
            {bankSettled === true && '✓ You confirmed funds are credited in your bank account. Safe to release goods.'}
            {bankSettled === false && '⚠️ Funds NOT received in bank. Hold goods immediately and ask buyer for cash/card.'}
            {bankSettled === null && 'Record whether money actually appeared in your merchant settlement account.'}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <Button
            variant={bankSettled === true ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setBankSettled(true)}
          >
            ✓ Funds Credited in Bank
          </Button>
          <Button
            variant={bankSettled === false ? 'danger' : 'secondary'}
            size="sm"
            onClick={() => setBankSettled(false)}
          >
            ✗ Not Received in Bank
          </Button>
        </div>
      </div>
    </div>
  );
};
