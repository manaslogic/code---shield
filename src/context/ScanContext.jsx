import React, { createContext, useContext, useState, useEffect } from 'react';
import { parseImageMetadata } from '../utils/metadataParser';
import { analyzeImageIntegrity } from '../utils/elaForensics';
import { runOCRIntelligence } from '../utils/ocrService';
import { calculateExplainableRisk } from '../utils/riskEngine';

const ScanContext = createContext(null);

const STORAGE_KEY = 'upi_shield_scan_history';
const ANALYSES_STORAGE_KEY = 'upi_shield_analyses_cache';

export const ScanProvider = ({ children, initialScan = null, initialScans = null }) => {
  // Currently uploaded screenshot (held in memory for privacy)
  const [currentScan, setCurrentScan] = useState(initialScan);

  // Active analysis result for the current scan
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState({ status: '', progress: 0 });

  // Historical scans list (persisted in LocalStorage)
  const [scans, setScans] = useState(() => {
    if (initialScans) return initialScans;
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
      }
      return [];
    } catch (err) {
      console.warn('Failed to read scan history from LocalStorage:', err);
      return [];
    }
  });

  // Cached analyses (without raw image blobs)
  const [analysesCache, setAnalysesCache] = useState(() => {
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem(ANALYSES_STORAGE_KEY);
        return stored ? JSON.parse(stored) : {};
      }
      return {};
    } catch {
      return {};
    }
  });

  // Sync scan history changes to LocalStorage
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(scans));
      }
    } catch (err) {
      console.warn('Failed to save scan history to LocalStorage:', err);
    }
  }, [scans]);

  // Sync analyses cache to LocalStorage
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.setItem(ANALYSES_STORAGE_KEY, JSON.stringify(analysesCache));
      }
    } catch (err) {
      console.warn('Failed to save analyses cache to LocalStorage:', err);
    }
  }, [analysesCache]);

  // Clean up Object URL when currentScan changes or unmounts
  useEffect(() => {
    return () => {
      if (currentScan && currentScan.previewUrl && currentScan.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(currentScan.previewUrl);
      }
    };
  }, [currentScan]);

  const updateCurrentScan = (fileData) => {
    if (currentScan && currentScan.previewUrl && currentScan.previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(currentScan.previewUrl);
    }
    setCurrentScan(fileData);
    setCurrentAnalysis(null);
  };

  const clearCurrentScan = () => {
    if (currentScan && currentScan.previewUrl && currentScan.previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(currentScan.previewUrl);
    }
    setCurrentScan(null);
    setCurrentAnalysis(null);
  };

  const addScanRecord = (record) => {
    const newRecord = {
      id: 'SCN-' + Date.now().toString(36).toUpperCase(),
      scanDate: new Date().toISOString(),
      ...record
    };
    setScans(prev => [newRecord, ...prev]);
    return newRecord;
  };

  const updateScanRecord = (id, updates) => {
    setScans(prev => prev.map(s => (s.id === id ? { ...s, ...updates } : s)));
  };

  const deleteScanRecord = (id) => {
    setScans(prev => prev.filter(item => item.id !== id));
    setAnalysesCache(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const clearScanHistory = () => {
    setScans([]);
    setAnalysesCache({});
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(ANALYSES_STORAGE_KEY);
      }
    } catch (err) {
      console.warn('Failed to clear LocalStorage:', err);
    }
  };

  /**
   * Executes the full 5-Layer Forensic Analysis Pipeline
   */
  const executeForensicPipeline = async (scanData, scanRecordId) => {
    if (!scanData) return null;

    setIsAnalyzing(true);
    setAnalysisProgress({ status: 'Starting multi-layer examination...', progress: 5 });

    try {
      // 1. Layer 2: Metadata Examination
      setAnalysisProgress({ status: 'Layer 2: Examining EXIF container & headers...', progress: 20 });
      const metadataResult = await parseImageMetadata(scanData.file);

      // 2. Layer 3: Error Level Analysis & Canvas Forensics
      setAnalysisProgress({ status: 'Layer 3: Computing Error Level Analysis (ELA)...', progress: 40 });
      const integrityResult = await analyzeImageIntegrity(scanData.previewUrl || scanData.file);

      // 3. Layer 1: OCR Intelligence
      setAnalysisProgress({ status: 'Layer 1: Processing OCR Intelligence...', progress: 60 });
      const ocrResult = await runOCRIntelligence(
        scanData.previewUrl || scanData.file,
        (progressUpdate) => setAnalysisProgress(progressUpdate)
      );

      // 4. Layer 4: Transaction Consistency
      setAnalysisProgress({ status: 'Layer 4: Validating UPI banking consistency...', progress: 85 });
      const upiResult = ocrResult.parsedUPI;

      // 5. Layer 5: Explainable Risk Assessment
      setAnalysisProgress({ status: 'Layer 5: Generating explainable risk score...', progress: 95 });
      const riskAssessment = calculateExplainableRisk({
        ocrResult,
        metadataResult,
        integrityResult,
        upiResult
      });

      const fullAnalysis = {
        scanId: scanRecordId,
        completedAt: new Date().toISOString(),
        ocrResult,
        metadataResult,
        integrityResult,
        upiResult,
        riskAssessment
      };

      setCurrentAnalysis(fullAnalysis);

      // Cache lightweight analysis results (without heavy raw image strings)
      if (scanRecordId) {
        const lightweightToCache = {
          ...fullAnalysis,
          integrityResult: {
            ...fullAnalysis.integrityResult,
            elaImageUrl: null // omit data URI from permanent localStorage
          }
        };
        setAnalysesCache(prev => ({ ...prev, [scanRecordId]: lightweightToCache }));

        // Update Scan Record in history
        updateScanRecord(scanRecordId, {
          amount: upiResult.amount || null,
          riskLevel: riskAssessment.riskLevel,
          status: 'Completed',
          suspicionScore: riskAssessment.score
        });
      }

      setAnalysisProgress({ status: 'Analysis Complete', progress: 100 });
      setIsAnalyzing(false);
      return fullAnalysis;
    } catch (err) {
      console.error('Forensic pipeline error:', err);
      setIsAnalyzing(false);
      setAnalysisProgress({ status: 'Analysis Error', progress: 100 });
      return null;
    }
  };

  // Derive metrics strictly from real records
  const stats = {
    total: scans.length,
    high: scans.filter(s => s.riskLevel === 'high').length,
    medium: scans.filter(s => s.riskLevel === 'medium').length,
    low: scans.filter(s => s.riskLevel === 'low').length,
  };

  const value = {
    currentScan,
    setCurrentScan: updateCurrentScan,
    clearCurrentScan,
    currentAnalysis,
    setCurrentAnalysis,
    isAnalyzing,
    analysisProgress,
    executeForensicPipeline,
    scans,
    analysesCache,
    addScanRecord,
    updateScanRecord,
    deleteScanRecord,
    clearScanHistory,
    stats
  };

  return <ScanContext.Provider value={value}>{children}</ScanContext.Provider>;
};

export const useScan = () => {
  const context = useContext(ScanContext);
  if (!context) {
    throw new Error('useScan must be used within a ScanProvider');
  }
  return context;
};
