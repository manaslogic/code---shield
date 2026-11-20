import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ScanLine, ArrowRight } from 'lucide-react';
import { Button } from '../common/Button';

export const QuickScan = () => {
  const navigate = useNavigate();

  return (
    <div className="quick-scan-card">
      <div className="quick-scan-content">
        <h2>Analyze a Payment Screenshot</h2>
        <p>Examine transaction screenshots for suspicious characteristics using multiple layers of analysis.</p>
      </div>
      <div>
        <Button 
          variant="primary" 
          icon={ScanLine} 
          onClick={() => navigate('/new-scan')}
        >
          Start New Scan
        </Button>
      </div>
    </div>
  );
};
