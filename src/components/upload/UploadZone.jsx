import React, { useState, useRef } from 'react';
import { UploadCloud, AlertCircle } from 'lucide-react';
import { Button } from '../common/Button';

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export const UploadZone = ({ onFileSelected, error, setError }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const validateAndProcessFile = (file) => {
    setError(null);

    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Invalid file type. Only PNG, JPG, and JPEG images are supported.');
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError('File size exceeds 10 MB limit. Please select a smaller screenshot.');
      return;
    }

    // Read file dimensions and create preview
    const previewUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      onFileSelected({
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
    };
    img.onerror = () => {
      setError('Unable to load image file. The file may be corrupt.');
    };
    img.src = previewUrl;
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      validateAndProcessFile(droppedFile);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      validateAndProcessFile(selectedFile);
    }
  };

  const handleTriggerBrowse = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div
        className={`upload-zone ${isDragging ? 'dragging' : ''} ${error ? 'error' : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleTriggerBrowse}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleTriggerBrowse();
          }
        }}
        aria-label="Upload payment screenshot"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".png,.jpg,.jpeg,image/png,image/jpeg"
          style={{ display: 'none' }}
          onChange={handleFileInputChange}
        />
        <div className="upload-icon-box">
          <UploadCloud size={28} />
        </div>
        <h3>Drop your payment screenshot here</h3>
        <p>or browse files from your device</p>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleTriggerBrowse();
          }}
        >
          Browse Files
        </Button>
        <div className="upload-zone-specs">
          Supported formats: PNG, JPG, JPEG • Maximum file size: 10 MB
        </div>
      </div>

      {error && (
        <div className="upload-error-alert" role="alert">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
