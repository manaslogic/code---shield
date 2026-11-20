import React, { useRef } from 'react';
import { Trash2, RefreshCw, FileText } from 'lucide-react';
import { Button } from '../common/Button';

export const ImagePreview = ({ imageInfo, onRemove, onReplace }) => {
  const replaceInputRef = useRef(null);

  if (!imageInfo) return null;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onReplace(e.target.files[0]);
    }
  };

  const handleTriggerReplace = () => {
    if (replaceInputRef.current) {
      replaceInputRef.current.value = '';
      replaceInputRef.current.click();
    }
  };

  return (
    <div className="image-preview-card">
      <input
        ref={replaceInputRef}
        type="file"
        accept=".png,.jpg,.jpeg,image/png,image/jpeg"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <div className="image-preview-thumbnail">
        {imageInfo.previewUrl ? (
          <img src={imageInfo.previewUrl} alt="Uploaded screenshot preview" />
        ) : (
          <FileText size={32} color="#9FB3C8" />
        )}
      </div>

      <div className="image-preview-details">
        <div className="image-meta-row">
          <span className="text-metadata" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Selected File
          </span>
          <div className="image-filename">{imageInfo.name}</div>
          <div className="image-filesize">
            Size: {imageInfo.size}
            {imageInfo.dimensions && (
              <span> • Dimensions: {imageInfo.dimensions.width} × {imageInfo.dimensions.height}px</span>
            )}
          </div>
          <div className="text-metadata" style={{ marginTop: '4px' }}>
            Type: {imageInfo.type || 'Image'} • Ready for analysis
          </div>
        </div>

        <div className="image-preview-actions">
          <Button
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            onClick={handleTriggerReplace}
          >
            Replace Image
          </Button>
          <Button
            variant="danger"
            size="sm"
            icon={Trash2}
            onClick={onRemove}
          >
            Remove
          </Button>
        </div>
      </div>
    </div>
  );
};
