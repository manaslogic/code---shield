import React, { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  FileSearch, 
  ArrowLeft, 
  Play, 
  RotateCw, 
  CheckCircle, 
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { useScan } from '../context/ScanContext';
import { EmptyState } from '../components/common/EmptyState';
import { Button } from '../components/common/Button';
import { AnalysisOverview } from '../components/forensic/AnalysisOverview';
import { ForensicLayer } from '../components/forensic/ForensicLayer';
import { RiskAssessment } from '../components/forensic/RiskAssessment';
import { MerchantTool } from '../components/forensic/MerchantTool';

export const ForensicAnalysis = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const recordId = searchParams.get('recordId');
  const autoStart = searchParams.get('autoStart') === 'true';
  const expectedUpi = searchParams.get('expectedUpi') || '';

  const { 
    currentScan, 
    setCurrentScan,
    currentAnalysis, 
    setCurrentAnalysis,
    analysesCache,
    scans,
    isAnalyzing, 
    analysisProgress, 
    executeForensicPipeline,
    merchantUpiId
  } = useScan();

  const hasAutoStartedRef = useRef(false);

  useEffect(() => {
    if (recordId && analysesCache && analysesCache[recordId] && !currentAnalysis) {
      setCurrentAnalysis(analysesCache[recordId]);
      if (!currentScan) {
        const matchingScan = scans.find(s => s.id === recordId);
        if (matchingScan) {
          setCurrentScan({
            name: matchingScan.fileName,
            size: matchingScan.fileSize,
            type: 'image/png',
            previewUrl: null,
            dimensions: null
          });
        }
      }
    }
  }, [recordId, analysesCache, currentAnalysis, currentScan, scans, setCurrentAnalysis, setCurrentScan]);

  useEffect(() => {
    if (autoStart && currentScan && !currentAnalysis && !isAnalyzing && !hasAutoStartedRef.current) {
      hasAutoStartedRef.current = true;
      executeForensicPipeline(currentScan, recordId, expectedUpi);
    }
  }, [autoStart, currentScan, currentAnalysis, isAnalyzing, recordId, expectedUpi, executeForensicPipeline]);

  if (!currentScan) {
    return (
      <div className="fintech-card">
        <EmptyState
          icon={FileSearch}
          title="No Screenshot Selected"
          description="Upload a UPI payment screenshot to initiate multi-layer forensic examination."
          actionLabel="Start New Scan"
          onAction={() => navigate('/new-scan')}
        />
      </div>
    );
  }

  const handleStartAnalysis = () => {
    executeForensicPipeline(currentScan, recordId, expectedUpi);
  };

  // Layer 1: OCR Intelligence data
  const ocrData = currentAnalysis?.ocrResult;
  const upiData = currentAnalysis?.upiResult;
  const ocrFields = [
    { 
      label: 'Transaction Amount', 
      value: upiData?.amount ? `₹${upiData.amount}` : (currentAnalysis ? 'Unverified / Not found' : 'Awaiting OCR integration'),
      highlight: !!upiData?.amount,
      isAnomalous: currentAnalysis && !upiData?.amount
    },
    { 
      label: 'UPI ID (VPA)', 
      value: upiData?.upiId || (currentAnalysis ? 'Not visible' : 'Awaiting OCR integration'),
      highlight: !!upiData?.upiId
    },
    { 
      label: 'Banking UTR (12 Digits)', 
      value: upiData?.utrId 
        ? `${upiData.utrId} (${upiData.utrId.length} digits ${upiData.isUtrLengthInvalid ? '— INVALID' : '— Standard'})`
        : (currentAnalysis ? 'Missing / Not found' : 'Awaiting OCR integration'),
      highlight: upiData?.fieldIntegrity?.utrValid,
      isAnomalous: currentAnalysis && (upiData?.isUtrLengthInvalid || !upiData?.utrId)
    },
    { 
      label: 'Transaction Reference', 
      value: upiData?.transactionId 
        ? (upiData.isClientUuidTxn ? `${upiData.transactionId} (App UUID)` : upiData.transactionId)
        : (currentAnalysis ? 'Not detected' : 'Awaiting OCR integration'),
      isAnomalous: upiData?.isClientUuidTxn
    },
    { 
      label: 'Date & Time', 
      value: (upiData?.date && upiData?.time) 
        ? `${upiData.date}, ${upiData.time}` 
        : (upiData?.date || upiData?.time || (currentAnalysis ? 'Not visible' : 'Awaiting OCR integration')) 
    },
    { 
      label: 'Payment Status', 
      value: upiData?.paymentStatus || (currentAnalysis ? 'Unconfirmed' : 'Awaiting OCR integration'),
      highlight: upiData?.paymentStatus === 'Payment Successful',
      isAnomalous: upiData?.paymentStatus === 'Payment Failed' || upiData?.paymentStatus === 'Unconfirmed'
    },
    { 
      label: 'OCR Confidence', 
      value: ocrData ? `${ocrData.confidence}% (${ocrData.engine})` : 'Awaiting OCR integration' 
    }
  ];

  // Layer 2: Metadata Examination data
  const metaData = currentAnalysis?.metadataResult;
  const metadataFields = [
    { 
      label: 'File Type', 
      value: currentScan.type || 'image/png' 
    },
    { 
      label: 'Image Dimensions', 
      value: currentScan.dimensions 
        ? `${currentScan.dimensions.width} × ${currentScan.dimensions.height} px` 
        : (metaData?.dimensions || 'Auto-detecting...') 
    },
    { 
      label: 'Software / Creator Tool', 
      value: metaData ? metaData.software : 'Awaiting metadata integration',
      isAnomalous: metaData?.isEditingSoftwareDetected
    },
    { 
      label: 'Device Signature', 
      value: metaData ? metaData.device : 'Awaiting metadata integration' 
    },
    { 
      label: 'Color Profile', 
      value: metaData ? metaData.colorSpace : 'Awaiting metadata integration' 
    },
    { 
      label: 'Embedded Tags Found', 
      value: metaData ? `${metaData.rawTagCount} EXIF tags` : 'Awaiting metadata integration' 
    }
  ];

  // Layer 3: Image Integrity Forensics data
  const integrityData = currentAnalysis?.integrityResult;
  const imageIntegrityFields = [
    { 
      label: 'ELA Compression Profile', 
      value: integrityData ? integrityData.compressionCharacteristics : 'Awaiting image forensics integration' 
    },
    { 
      label: 'Average Error Delta', 
      value: integrityData ? `${integrityData.avgDifference} px` : 'Awaiting image forensics integration' 
    },
    { 
      label: 'Regional Anomaly Ratio', 
      value: integrityData ? `${integrityData.anomalyRatio}%` : 'Awaiting image forensics integration',
      isAnomalous: integrityData && integrityData.anomalyRatio > 4
    },
    { 
      label: 'Visual Consistency', 
      value: integrityData ? integrityData.visualInconsistencies : 'Awaiting image forensics integration' 
    }
  ];

  // Layer 4: Transaction Consistency data
  const transactionConsistencyFields = [
    { 
      label: 'NPCI UTR Standard (12 Digits)', 
      value: upiData?.fieldIntegrity?.utrValid 
        ? 'Verified 12-digit numeric format' 
        : (upiData?.isUtrLengthInvalid 
            ? `INVALID LENGTH: ${upiData.utrId?.length} digits (Standard: 12)` 
            : (currentAnalysis ? 'Missing or undetected UTR' : 'Awaiting transaction validation')),
      highlight: upiData?.fieldIntegrity?.utrValid,
      isAnomalous: currentAnalysis && (!upiData?.fieldIntegrity?.utrValid || upiData?.isUtrLengthInvalid)
    },
    { 
      label: 'Merchant Beneficiary Match', 
      value: upiData?.beneficiaryCheck?.tested 
        ? (upiData.beneficiaryCheck.isMatch 
            ? `Verified Match: ${upiData.beneficiaryCheck.expectedUpiId}` 
            : (upiData.beneficiaryCheck.isMismatch 
                ? `CRITICAL MISMATCH: Sent to "${upiData.beneficiaryCheck.extractedUpiId || upiData.upiId}" (Expected: "${upiData.beneficiaryCheck.expectedUpiId}")` 
                : `Beneficiary unverified in image (Expected: "${upiData.beneficiaryCheck.expectedUpiId}")`))
        : (currentAnalysis ? 'Not configured (Optional cross-check)' : 'Awaiting transaction validation'),
      highlight: upiData?.beneficiaryCheck?.tested && upiData?.beneficiaryCheck?.isMatch,
      isAnomalous: upiData?.beneficiaryCheck?.tested && (upiData?.beneficiaryCheck?.isMismatch || upiData?.beneficiaryCheck?.isMissing)
    },
    { 
      label: 'Amount Verification', 
      value: upiData?.fieldIntegrity?.amountValid 
        ? `Verified: ₹${upiData.amount}` 
        : (currentAnalysis ? 'CRITICAL: Amount unverified' : 'Awaiting transaction validation'),
      highlight: upiData?.fieldIntegrity?.amountValid,
      isAnomalous: currentAnalysis && !upiData?.fieldIntegrity?.amountValid
    },
    { 
      label: 'Spoof / Demo Watermark Check', 
      value: upiData?.isDemoOrSpoof 
        ? `CRITICAL: "${upiData.demoMarker}"` 
        : (currentAnalysis ? 'Clean: No spoof disclaimers' : 'Awaiting transaction validation'),
      highlight: currentAnalysis && !upiData?.isDemoOrSpoof,
      isAnomalous: upiData?.isDemoOrSpoof
    },
    { 
      label: 'Transaction ID Structure', 
      value: upiData?.isClientUuidTxn 
        ? 'Non-standard client software UUID' 
        : (upiData?.transactionId ? 'Standard reference format' : (currentAnalysis ? 'Missing transaction ID' : 'Awaiting transaction validation')),
      isAnomalous: upiData?.isClientUuidTxn || (currentAnalysis && !upiData?.transactionId)
    },
    { 
      label: 'Payment Status Confirmation', 
      value: upiData?.fieldIntegrity?.statusValid 
        ? `Verified: ${upiData.paymentStatus}` 
        : (currentAnalysis ? 'Unconfirmed payment state' : 'Awaiting transaction validation'),
      highlight: upiData?.fieldIntegrity?.statusValid,
      isAnomalous: currentAnalysis && !upiData?.fieldIntegrity?.statusValid
    }
  ];

  return (
    <div className="forensic-layout">
      {/* Top Action & Status Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <Button
          variant="secondary"
          size="sm"
          icon={ArrowLeft}
          onClick={() => navigate('/new-scan')}
        >
          Change Screenshot
        </Button>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Button
            variant="primary"
            size="sm"
            icon={isAnalyzing ? Loader2 : (currentAnalysis ? RotateCw : Play)}
            disabled={isAnalyzing}
            onClick={handleStartAnalysis}
          >
            {isAnalyzing ? 'Analyzing Screenshot...' : currentAnalysis ? 'Re-run Analysis' : 'Run 5-Layer Forensic Examination'}
          </Button>
        </div>
      </div>

      {/* Progress Notification Bar during active pipeline */}
      {isAnalyzing && (
        <div style={{
          background: 'var(--color-card-bg)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-card)',
          padding: '18px 24px',
          boxShadow: 'var(--shadow-card)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>
            <span style={{ color: 'var(--color-primary-text)' }}>{analysisProgress.status}</span>
            <span style={{ color: 'var(--color-primary-accent)' }}>{analysisProgress.progress}%</span>
          </div>
          <div style={{ height: '8px', background: '#F0F4F8', borderRadius: '4px', overflow: 'hidden' }}>
            <div 
              style={{ 
                height: '100%', 
                background: 'var(--color-primary-accent)', 
                width: `${analysisProgress.progress}%`,
                transition: 'width 0.3s ease-in-out'
              }} 
            />
          </div>
        </div>
      )}

      {/* Screenshot Overview with ELA map switch */}
      <AnalysisOverview 
        imageInfo={currentScan} 
        analysis={currentAnalysis}
        isAnalyzing={isAnalyzing}
      />

      {/* Five Forensic Layers */}
      <div className="forensic-layers-list">
        {/* Layer 1: OCR Intelligence */}
        <ForensicLayer
          layerNumber={1}
          title="OCR Intelligence"
          fields={ocrFields}
          statusText={currentAnalysis ? 'OCR Completed' : 'Awaiting OCR integration'}
          statusVariant={currentAnalysis ? 'low' : 'neutral'}
          findings={upiData?.findings?.filter(f => f.includes('recognized') || f.includes('identified')) || []}
        />

        {/* Layer 2: Metadata Examination */}
        <ForensicLayer
          layerNumber={2}
          title="Metadata Examination"
          fields={metadataFields}
          statusText={currentAnalysis ? (metaData?.hasMetadata ? 'Metadata Verified' : 'Stripped / Clean') : 'Awaiting metadata integration'}
          statusVariant={metaData?.isEditingSoftwareDetected ? 'high' : (currentAnalysis ? 'low' : 'neutral')}
          findings={metaData?.findings || []}
          notice="Missing metadata alone is not evidence of manipulation."
        />

        {/* Layer 3: Image Integrity Analysis */}
        <ForensicLayer
          layerNumber={3}
          title="Image Integrity Analysis (ELA & Compression)"
          fields={imageIntegrityFields}
          statusText={currentAnalysis ? (integrityData?.anomalyRatio > 4 ? 'Anomalies Flagged' : 'Uniform Compression') : 'Awaiting image forensics integration'}
          statusVariant={integrityData?.anomalyRatio > 4 ? 'high' : (currentAnalysis ? 'low' : 'neutral')}
          findings={integrityData?.findings || []}
          notice="Image compression and editing artifacts can produce false positives. Findings require contextual interpretation."
        />

        {/* Layer 4: Transaction Consistency */}
        <ForensicLayer
          layerNumber={4}
          title="Transaction Consistency & UPI Specification"
          fields={transactionConsistencyFields}
          statusText={currentAnalysis ? (upiData?.consistencyRiskScore > 30 ? 'Discrepancies Flagged' : 'Format Consistent') : 'Awaiting transaction validation'}
          statusVariant={upiData?.consistencyRiskScore > 30 ? 'high' : (currentAnalysis ? 'low' : 'neutral')}
          findings={upiData?.findings || []}
        />

        {/* Layer 5: Explainable Risk Assessment */}
        <RiskAssessment 
          analysis={currentAnalysis} 
          isAnalyzing={isAnalyzing} 
        />

        {/* Interactive Merchant Cross-Check Assistant & Decoded UTR Breakdown */}
        {currentAnalysis && (
          <MerchantTool 
            analysis={currentAnalysis} 
            scanId={recordId} 
          />
        )}
      </div>
    </div>
  );
};
