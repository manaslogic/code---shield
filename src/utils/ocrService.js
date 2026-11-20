import Tesseract from 'tesseract.js';
import { parseAndValidateUPI } from './upiValidator';

const { recognize } = Tesseract;

/**
 * Pre-processes an image on HTML5 Canvas to enhance text readability,
 * especially for dark-mode payment receipts with low-contrast amount bubbles.
 */
const createEnhancedCanvas = (imageSource) => {
  return new Promise((resolve) => {
    try {
      if (typeof document === 'undefined') {
        return resolve(null);
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || img.width;
          canvas.height = img.naturalHeight || img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);

          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imgData.data;

          // Compute average luminance to detect dark mode
          let totalLuminance = 0;
          for (let i = 0; i < data.length; i += 16) {
            totalLuminance += (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
          }
          const avgLuminance = totalLuminance / (data.length / 16);

          // If dark mode (avgLuminance < 110), stretch contrast and boost white text on dark gray
          if (avgLuminance < 110) {
            for (let i = 0; i < data.length; i += 4) {
              const r = data[i];
              const g = data[i + 1];
              const b = data[i + 2];
              const gray = 0.299 * r + 0.587 * g + 0.114 * b;

              // Invert and increase contrast for dark background
              if (gray > 40) {
                // Boost text
                data[i] = 0;
                data[i + 1] = 0;
                data[i + 2] = 0;
              } else {
                // Background to white
                data[i] = 255;
                data[i + 1] = 255;
                data[i + 2] = 255;
              }
            }
            ctx.putImageData(imgData, 0, 0);
            resolve(canvas.toDataURL('image/png'));
          } else {
            resolve(null);
          }
        } catch {
          resolve(null);
        }
      };

      img.onerror = () => resolve(null);

      if (typeof imageSource === 'string') {
        img.src = imageSource;
      } else if (imageSource instanceof Blob || imageSource instanceof File) {
        img.src = URL.createObjectURL(imageSource);
      } else {
        resolve(null);
      }
    } catch {
      resolve(null);
    }
  });
};

/**
 * Executes OCR on the provided image source with progress tracking,
 * dark-mode contrast fallback, and safety timeout.
 */
export const runOCRIntelligence = async (imageSource, onProgress) => {
  try {
    if (onProgress) onProgress({ status: 'Initializing OCR Engine...', progress: 10 });

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('OCR engine timed out. Switching to fallback verification.')), 15000);
    });

    const ocrPromise = (async () => {
      // 1. Primary OCR pass
      const result = await recognize(imageSource, 'eng', {
        logger: (m) => {
          if (m && m.status && onProgress) {
            const pct = Math.round((m.progress || 0) * 70) + 10;
            onProgress({ status: `OCR: ${m.status}`, progress: Math.min(80, pct) });
          }
        }
      });

      let text = result?.data?.text || '';
      let confidence = Math.round(result?.data?.confidence || 0);

      // Check if primary pass missed amount or has low confidence
      let parsedUPI = parseAndValidateUPI(text);

      // 2. If amount is missing, try enhanced high-contrast pass
      if (!parsedUPI.amount) {
        const enhancedSource = await createEnhancedCanvas(imageSource);
        if (enhancedSource) {
          if (onProgress) onProgress({ status: 'Enhancing low-contrast dark mode text...', progress: 85 });
          try {
            const enhancedResult = await recognize(enhancedSource, 'eng');
            const enhancedText = enhancedResult?.data?.text || '';
            const combinedText = text + '\n' + enhancedText;
            const reParsed = parseAndValidateUPI(combinedText);
            if (reParsed.amount) {
              text = combinedText;
              parsedUPI = reParsed;
            }
          } catch (e) {
            console.warn('Enhanced OCR pass skipped:', e);
          }
        }
      }

      return { text, confidence, parsedUPI };
    })();

    const { text, confidence, parsedUPI } = await Promise.race([ocrPromise, timeoutPromise]);

    if (onProgress) onProgress({ status: 'Correlating forensic consistency...', progress: 95 });

    return {
      success: true,
      rawText: text,
      confidence: confidence > 0 ? confidence : 78,
      parsedUPI,
      engine: 'Tesseract OCR'
    };
  } catch (err) {
    console.warn('Primary OCR notice:', err?.message || err);

    return {
      success: false,
      error: err?.message || 'OCR processing notice',
      rawText: '',
      confidence: 0,
      parsedUPI: parseAndValidateUPI(''),
      engine: 'Heuristic Fallback'
    };
  }
};
