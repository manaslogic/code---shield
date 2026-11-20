/**
 * Error Level Analysis (ELA) and Image Integrity Forensics Engine
 * Performs client-side image forensics using HTML5 Canvas.
 */

export const analyzeImageIntegrity = async (imageSource, quality = 0.85) => {
  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        try {
          const width = img.naturalWidth || img.width;
          const height = img.naturalHeight || img.height;

          // Limit processing dimensions for responsive client performance (max 1600px width/height)
          let renderWidth = width;
          let renderHeight = height;
          const maxDim = 1200;
          if (renderWidth > maxDim || renderHeight > maxDim) {
            const ratio = Math.min(maxDim / renderWidth, maxDim / renderHeight);
            renderWidth = Math.round(renderWidth * ratio);
            renderHeight = Math.round(renderHeight * ratio);
          }

          // 1. Draw original onto canvas A
          const canvasA = document.createElement('canvas');
          canvasA.width = renderWidth;
          canvasA.height = renderHeight;
          const ctxA = canvasA.getContext('2d', { willReadFrequently: true });
          ctxA.drawImage(img, 0, 0, renderWidth, renderHeight);

          const origImageData = ctxA.getImageData(0, 0, renderWidth, renderHeight);
          const origData = origImageData.data;

          // 2. Export as JPEG at specific compression quality
          const jpegDataUrl = canvasA.toDataURL('image/jpeg', quality);

          // 3. Load compressed JPEG onto canvas B
          const compressedImg = new Image();
          compressedImg.onload = () => {
            try {
              const canvasB = document.createElement('canvas');
              canvasB.width = renderWidth;
              canvasB.height = renderHeight;
              const ctxB = canvasB.getContext('2d', { willReadFrequently: true });
              ctxB.drawImage(compressedImg, 0, 0, renderWidth, renderHeight);

              const compImageData = ctxB.getImageData(0, 0, renderWidth, renderHeight);
              const compData = compImageData.data;

              // 4. Compute ELA difference map
              const canvasDiff = document.createElement('canvas');
              canvasDiff.width = renderWidth;
              canvasDiff.height = renderHeight;
              const ctxDiff = canvasDiff.getContext('2d');
              const diffImageData = ctxDiff.createImageData(renderWidth, renderHeight);
              const diffData = diffImageData.data;

              let totalDiff = 0;
              let maxPixelDiff = 0;
              let highDiffPixelCount = 0;
              const multiplier = 18; // ELA amplification scale factor

              for (let i = 0; i < origData.length; i += 4) {
                const diffR = Math.abs(origData[i] - compData[i]);
                const diffG = Math.abs(origData[i + 1] - compData[i + 1]);
                const diffB = Math.abs(origData[i + 2] - compData[i + 2]);

                const pixelDiff = (diffR + diffG + diffB) / 3;
                totalDiff += pixelDiff;
                if (pixelDiff > maxPixelDiff) maxPixelDiff = pixelDiff;
                if (pixelDiff > 12) highDiffPixelCount++;

                // Map difference onto amplified RGB
                diffData[i] = Math.min(255, diffR * multiplier);
                diffData[i + 1] = Math.min(255, diffG * multiplier);
                diffData[i + 2] = Math.min(255, diffB * multiplier);
                diffData[i + 3] = 255; // Alpha
              }

              ctxDiff.putImageData(diffImageData, 0, 0);
              const elaImageUrl = canvasDiff.toDataURL('image/png');

              const totalPixels = renderWidth * renderHeight;
              const avgDiff = totalDiff / totalPixels;
              const anomalyRatio = highDiffPixelCount / totalPixels;

              // Anomaly metrics
              // Authentic screenshots typically have uniform ELA difference around 2-6.
              // Spliced or digitally overlayed text produces localized spikes > 15-25.
              let integrityScore = 0;
              const findings = [];

              if (anomalyRatio > 0.08) {
                integrityScore += 45;
                findings.push('Substantial error level variance detected across image regions.');
              } else if (anomalyRatio > 0.03) {
                integrityScore += 20;
                findings.push('Moderate compression discrepancies identified in localized zones.');
              } else {
                findings.push('Error level distribution is relatively uniform across the image.');
              }

              if (maxPixelDiff > 45) {
                integrityScore += 25;
                findings.push('High-frequency pixel delta observed (potential re-compression or overlay).');
              }

              resolve({
                success: true,
                elaImageUrl,
                avgDifference: parseFloat(avgDiff.toFixed(2)),
                maxDifference: maxPixelDiff,
                anomalyRatio: parseFloat((anomalyRatio * 100).toFixed(1)),
                integrityRiskScore: Math.min(100, integrityScore),
                findings,
                compressionCharacteristics: avgDiff > 8 ? 'High compression / Multi-pass' : 'Standard single-pass compression',
                potentiallyAlteredRegions: anomalyRatio > 0.04 ? 'Localized variations flagged' : 'No major regional spikes detected',
                visualInconsistencies: integrityScore > 40 ? 'Possible text or background alteration' : 'Visual attributes consistent'
              });
            } catch (err) {
              resolve(getFallbackIntegrityResult(err));
            }
          };

          compressedImg.onerror = (e) => resolve(getFallbackIntegrityResult(e));
          compressedImg.src = jpegDataUrl;
        } catch (err) {
          resolve(getFallbackIntegrityResult(err));
        }
      };

      img.onerror = (e) => resolve(getFallbackIntegrityResult(e));

      if (typeof imageSource === 'string') {
        img.src = imageSource;
      } else if (imageSource instanceof Blob || imageSource instanceof File) {
        const objectUrl = URL.createObjectURL(imageSource);
        img.src = objectUrl;
      }
    } catch (err) {
      resolve(getFallbackIntegrityResult(err));
    }
  });
};

const getFallbackIntegrityResult = (err) => ({
  success: false,
  error: err?.message || 'Integrity analysis failed',
  elaImageUrl: null,
  avgDifference: 0,
  maxDifference: 0,
  anomalyRatio: 0,
  integrityRiskScore: 0,
  findings: ['Client-side forensic execution bypassed; contextual review suggested.'],
  compressionCharacteristics: 'Unknown',
  potentiallyAlteredRegions: 'Inconclusive',
  visualInconsistencies: 'Unable to evaluate'
});
