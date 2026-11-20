import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ScanProvider } from './context/ScanContext';
import { MainLayout } from './components/layout/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { NewScan } from './pages/NewScan';
import { ForensicAnalysis } from './pages/ForensicAnalysis';
import { ScanHistory } from './pages/ScanHistory';
import { ThreatAnalytics } from './pages/ThreatAnalytics';
import { Settings } from './pages/Settings';

export default function App() {
  return (
    <ScanProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="new-scan" element={<NewScan />} />
            <Route path="forensic-analysis" element={<ForensicAnalysis />} />
            <Route path="scan-history" element={<ScanHistory />} />
            <Route path="threat-analytics" element={<ThreatAnalytics />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ScanProvider>
  );
}
