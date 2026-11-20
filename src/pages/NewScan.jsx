import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ShieldAlert, Sparkles, CheckCircle, AlertTriangle } from 'lucide-react';
import { useScan } from '../context/ScanContext';
import { UploadZone } from '../components/upload/UploadZone';
import { ImagePreview } from '../components/upload/ImagePreview';
import { Button } from '../components/common/Button';
import { createSampleScreenshot } from '../utils/sampleGenerator';

export const NewScan = () => {
  const navigate = useNavigate();
  const { currentScan, setCurrentScan, clearCurrentScan, addScanRecord } = useScan();
  const [error, setError] = useState(null);
  const [isGeneratingSample, setIsGeneratingSample] = useState(false);

  const handleFileSelected = (fileData) => {
    setCurrentScan(fileData);
    setError(null);
  };

  const handleRemove = () => {
    clearCurrentScan();
    setError(null);
  };

  const handleReplace = (file) => {
    if (!file) return;
    const allowed = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!allowed.includes(file.type)) {
      setError('Invalid file type. Only PNG, JPG, and JPEG images are supported.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10 MB limit.');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setCurrentScan({
        file,
        previewUrl,
        name: file.name,
        size: formatBytes(file.size),
        rawSize: file.size,
        type: file.type,
        dimensions: {
          width: img.naturalWidth,
          height: img.naturalHeight
        },
        uploadedAt: new Date().toISOString()
      });
      setError(null);
    };
    img.onerror = () => {
      setError('Unable to load image file.');
    };
    img.src = previewUrl;
  };

  const handleLoadSample = async (sampleType) => {
    setIsGeneratingSample(true);
    try {
      const sample = await createSampleScreenshot(sampleType);
      setCurrentScan(sample);
      setError(null);
    } catch (err) {
      setError('Failed to generate sample image.');
    } finally {
      setIsGeneratingSample(false);
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleAnalyze = () => {
    if (!currentScan) return;

    // Create a new scan history record
    const newRecord = addScanRecord({
      fileName: currentScan.name,
      fileSize: currentScan.size,
      amount: null,
      riskLevel: 'pending',
      status: 'Analyzing...'
    });

    // Navigate to Forensic Analysis with retained currentScan and new record id
    navigate(`/forensic-analysis?recordId=${newRecord.id}&autoStart=true`);
  };

  return (
    <div className="upload-container">
      {/* Upload Zone or Preview */}
      {!currentScan ? (
        <>
          <UploadZone 
            onFileSelected={handleFileSelected} 
            error={error} 
            setError={setError} 
          />

          {/* Quick Prototype Test Samples */}
          <div style={{
            background: 'var(--color-card-bg)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-card)',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={15} color="var(--color-primary-accent)" />
                Don't have a payment screenshot handy?
              </div>
              <div className="text-secondary" style={{ fontSize: '12px' }}>
                Load a verified test sample to examine the five forensic layers immediately.
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button
                variant="secondary"
                size="sm"
                icon={CheckCircle}
                disabled={isGeneratingSample}
                onClick={() => handleLoadSample('authentic')}
              >
                Sample: Authentic GPay
              </Button>
              <Button
                variant="secondary"
                size="sm"
                icon={AlertTriangle}
                disabled={isGeneratingSample}
                onClick={() => handleLoadSample('manipulated')}
              >
                Sample: Spliced Receipt
              </Button>
            </div>
          </div>
        </>
      ) : (
        <ImagePreview 
          imageInfo={currentScan} 
          onRemove={handleRemove} 
          onReplace={handleReplace} 
        />
      )}

      {/* Privacy Notice */}
      <div className="security-notice-banner" style={{ marginTop: 0 }}>
        <ShieldAlert size={18} />
        <div style={{ fontSize: '13px' }}>
          <strong>Privacy Notice:</strong> Your screenshot is processed locally in this prototype. Avoid uploading real customer payment information during testing.
        </div>
      </div>

      {/* Primary Action Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
        <Button
          variant="primary"
          size="lg"
          icon={Search}
          disabled={!currentScan || isGeneratingSample}
          onClick={handleAnalyze}
        >
          Analyze Screenshot
        </Button>
      </div>
    </div>
  );
};
