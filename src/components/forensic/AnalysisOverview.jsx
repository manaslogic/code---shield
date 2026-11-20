import React, { useState } from 'react';
import { Badge } from '../common/Badge';
import { Eye, ShieldAlert, Sparkles } from 'lucide-react';
import { Button } from '../common/Button';

export const AnalysisOverview = ({ imageInfo, analysis, isAnalyzing }) => {
  const [showElaView, setShowElaView] = useState(false);

  if (!imageInfo) return null;

  const hasElaImage = analysis?.integrityResult?.elaImageUrl;

  const getStatusBadge = () => {
    if (isAnalyzing) {
      return <Badge variant="medium">Analysis in Progress</Badge>;
    }
    if (analysis?.riskAssessment) {
      const level = analysis.riskAssessment.riskLevel;
      return (
        <Badge variant={level}>
          {analysis.riskAssessment.categoryLabel} ({analysis.riskAssessment.score}/100)
        </Badge>
      );
    }
    return <Badge variant="neutral">Pipeline Standby</Badge>;
  };

  return (
    <div className="forensic-overview-card">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div className="forensic-image-holder">
          {showElaView && hasElaImage ? (
            <img 
              src={analysis.integrityResult.elaImageUrl} 
              alt="Forensic ELA heat-map visualization" 
            />
          ) : imageInfo.previewUrl ? (
            <img 
              src={imageInfo.previewUrl} 
              alt="Analyzed payment screenshot" 
            />
          ) : (
            <div className="text-secondary" style={{ fontSize: '12px' }}>No preview available</div>
          )}
        </div>

        {hasElaImage && (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Button
              variant={showElaView ? 'primary' : 'secondary'}
              size="sm"
              icon={Eye}
              onClick={() => setShowElaView(!showElaView)}
            >
              {showElaView ? 'Show Original Screenshot' : 'View Forensic ELA Map'}
            </Button>
          </div>
        )}
      </div>

      <div className="forensic-meta-table">
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '4px' }}>
            Screenshot Evidence Record
          </h2>
          <p className="text-secondary" style={{ fontSize: '13px' }}>
            Primary image attributes and pipeline verification status
          </p>
        </div>

        <div className="forensic-meta-item">
          <span className="forensic-meta-label">File Name</span>
          <span className="forensic-meta-value">{imageInfo.name}</span>
        </div>

        <div className="forensic-meta-item">
          <span className="forensic-meta-label">File Size</span>
          <span className="forensic-meta-value">{imageInfo.size}</span>
        </div>

        <div className="forensic-meta-item">
          <span className="forensic-meta-label">Image Dimensions</span>
          <span className="forensic-meta-value">
            {imageInfo.dimensions 
              ? `${imageInfo.dimensions.width} × ${imageInfo.dimensions.height} px` 
              : 'Auto-detecting...'}
          </span>
        </div>

        <div className="forensic-meta-item">
          <span className="forensic-meta-label">MIME Type</span>
          <span className="forensic-meta-value">{imageInfo.type || 'image/png'}</span>
        </div>

        <div className="forensic-meta-item">
          <span className="forensic-meta-label">Analysis Status</span>
          <span className="forensic-meta-value">
            {getStatusBadge()}
          </span>
        </div>
      </div>
    </div>
  );
};
