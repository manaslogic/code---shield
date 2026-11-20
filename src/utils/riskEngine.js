/**
 * Explainable Risk Assessment Engine (Layer 5)
 * Synthesizes signals across OCR, Metadata, ELA Forensics, and Transaction Consistency.
 */

export const calculateExplainableRisk = ({
  ocrResult = {},
  metadataResult = {},
  integrityResult = {},
  upiResult = {}
}) => {
  const evidenceFactors = [];
  let rawScore = 0;

  // 1. EXPLICIT SPOOF / DEMO WATERMARK (OVERRIDE)
  if (upiResult.isDemoOrSpoof) {
    const points = 95;
    rawScore += points;
    evidenceFactors.push({
      layer: 'Layer 4: Transaction Consistency',
      severity: 'high',
      title: 'Explicit Fake / Demo Watermark Detected',
      description: `Screenshot explicitly displays simulated transaction text ("${upiResult.demoMarker}"). This is not an authentic banking receipt.`,
      points
    });
  }

  // 2. UTR & TRANSACTION CONSISTENCY CHECKS
  if (upiResult.isUtrLengthInvalid) {
    const points = 45;
    rawScore += points;
    evidenceFactors.push({
      layer: 'Layer 4: Transaction Consistency',
      severity: 'high',
      title: `Anomalous UTR Length (${upiResult.utrId?.length || 'Invalid'} Digits)`,
      description: `Captured UTR "${upiResult.utrId}" is ${upiResult.utrId?.length} digits long. Standard NPCI UPI UTRs are strictly 12 digits. Length mismatch is a known signature of fake payment generator APKs.`,
      points
    });
  } else if (upiResult.fieldIntegrity?.utrValid) {
    evidenceFactors.push({
      layer: 'Layer 4: Transaction Consistency',
      severity: 'low',
      title: 'Valid 12-Digit Numeric UTR',
      description: `Reference identifier "${upiResult.utrId}" matches the authentic 12-digit NPCI specification.`,
      points: 0
    });
  }

  if (upiResult.isClientUuidTxn) {
    const points = 25;
    rawScore += points;
    evidenceFactors.push({
      layer: 'Layer 4: Transaction Consistency',
      severity: 'medium',
      title: 'Client-Side Software UUID Format',
      description: `Transaction ID "${upiResult.transactionId}" is formatted as an internal application UUID rather than an authorized banking clearing reference.`,
      points
    });
  }

  // Check missing critical fields
  if (!upiResult.amount) {
    const points = 30;
    rawScore += points;
    evidenceFactors.push({
      layer: 'Layer 4: Transaction Consistency',
      severity: 'high',
      title: 'Transaction Amount Unverified / Missing',
      description: 'The screenshot does not contain a verifiable payment amount or the amount is illegible. A receipt without a verified amount cannot substantiate payment.',
      points
    });
  } else if (upiResult.fieldIntegrity?.amountValid) {
    evidenceFactors.push({
      layer: 'Layer 4: Transaction Consistency',
      severity: 'low',
      title: 'Valid Currency & Amount Format',
      description: `Amount "₹${upiResult.amount}" is properly formatted with recognized currency notation.`,
      points: 0
    });
  }

  if (!upiResult.transactionId && !upiResult.utrId) {
    const points = 35;
    rawScore += points;
    evidenceFactors.push({
      layer: 'Layer 4: Transaction Consistency',
      severity: 'high',
      title: 'Missing Banking UTR / Reference ID',
      description: 'The screenshot lacks any verifiable 12-digit UTR or banking reference ID. Without a reference number, the merchant has zero audit trail to track funds.',
      points
    });
  }

  // Payment Status Checks
  if (upiResult.paymentStatus === 'Payment Failed') {
    const points = 50;
    rawScore += points;
    evidenceFactors.push({
      layer: 'Layer 4: Transaction Consistency',
      severity: 'high',
      title: 'Transaction Explicitly Marked Failed',
      description: 'Extracted payment status indicates the transaction was declined or failed.',
      points
    });
  } else if (upiResult.paymentStatus === 'Processing / Pending') {
    const points = 25;
    rawScore += points;
    evidenceFactors.push({
      layer: 'Layer 4: Transaction Consistency',
      severity: 'medium',
      title: 'Transaction In-Progress / Pending',
      description: 'The payment is still processing and has not been confirmed as settled into your account.',
      points
    });
  } else if (upiResult.paymentStatus === 'Unconfirmed') {
    const points = 20;
    rawScore += points;
    evidenceFactors.push({
      layer: 'Layer 4: Transaction Consistency',
      severity: 'medium',
      title: 'Payment Confirmation Unverified',
      description: 'The image lacks an explicit "Payment Successful" confirmation marker.',
      points
    });
  }

  // 3. FORENSIC INTEGRITY SIGNALS (ELA Forensics)
  if (integrityResult.anomalyRatio > 8.0) {
    const points = 35;
    rawScore += points;
    evidenceFactors.push({
      layer: 'Layer 3: Image Integrity',
      severity: 'high',
      title: 'High Error Level Variance (ELA)',
      description: `Elevated pixel error divergence (${integrityResult.anomalyRatio}%) indicates localized compression differences, commonly seen when text or amounts are edited over a pre-existing screenshot.`,
      points
    });
  } else if (integrityResult.anomalyRatio > 3.0) {
    const points = 18;
    rawScore += points;
    evidenceFactors.push({
      layer: 'Layer 3: Image Integrity',
      severity: 'medium',
      title: 'Moderate Compression Inconsistency',
      description: `Localized compression artifacts observed (${integrityResult.anomalyRatio}% anomaly ratio). May result from re-saving or multi-generation compression.`,
      points
    });
  } else if (integrityResult.success) {
    evidenceFactors.push({
      layer: 'Layer 3: Image Integrity',
      severity: 'low',
      title: 'Uniform Compression Profile',
      description: `Error level distribution across the image canvas is consistent (${integrityResult.anomalyRatio || 0}% variance), typical of an unmanipulated screen capture.`,
      points: 0
    });
  }

  // 4. METADATA SIGNALS
  if (metadataResult.isEditingSoftwareDetected) {
    const points = 40;
    rawScore += points;
    evidenceFactors.push({
      layer: 'Layer 2: Metadata Examination',
      severity: 'high',
      title: 'Photo Manipulation Software Signature',
      description: `Image metadata explicitly includes creator tool signature: "${metadataResult.software}". Authentic payment screenshots are generated by the mobile OS, not desktop/mobile editing software.`,
      points
    });
  } else if (metadataResult.hasMetadata) {
    evidenceFactors.push({
      layer: 'Layer 2: Metadata Examination',
      severity: 'low',
      title: 'Operating System Container Verified',
      description: `Metadata contains ${metadataResult.rawTagCount} standard container tags without editing application markers.`,
      points: 0
    });
  } else {
    // Missing metadata alone must NOT add high risk
    evidenceFactors.push({
      layer: 'Layer 2: Metadata Examination',
      severity: 'neutral',
      title: 'Metadata Stripped / Absent',
      description: 'Standard metadata was not present. Note: Messaging platforms (WhatsApp, Telegram) routinely strip EXIF metadata.',
      points: 0
    });
  }

  // 5. OCR CONFIDENCE & FIELD READABILITY
  if (ocrResult.success && ocrResult.confidence > 70) {
    evidenceFactors.push({
      layer: 'Layer 1: OCR Intelligence',
      severity: 'low',
      title: 'High Text Extraction Confidence',
      description: `Optical character recognition completed with ${ocrResult.confidence}% confidence across visual tokens.`,
      points: 0
    });
  } else if (ocrResult.success && ocrResult.confidence < 45 && ocrResult.confidence > 0) {
    const points = 15;
    rawScore += points;
    evidenceFactors.push({
      layer: 'Layer 1: OCR Intelligence',
      severity: 'medium',
      title: 'Low Text Readability / Compression Blur',
      description: `Low OCR confidence (${ocrResult.confidence}%). Severe compression, blurring, or intentional noise can interfere with verification.`,
      points
    });
  }

  // Cap score between 0 and 100
  const finalScore = Math.min(100, Math.max(0, Math.round(rawScore)));

  // Categorization
  let riskLevel = 'low';
  let categoryLabel = 'Low Suspicion';
  if (finalScore >= 60) {
    riskLevel = 'high';
    categoryLabel = 'High Suspicion';
  } else if (finalScore >= 30) {
    riskLevel = 'medium';
    categoryLabel = 'Medium Suspicion';
  }

  // Actionable Recommendations
  const recommendations = [];
  if (riskLevel === 'high') {
    recommendations.push('CRITICAL: Do NOT release goods or services based on this screenshot.');
    recommendations.push('Do NOT trust customer-presented screenshots. Open your merchant soundbox or payment portal directly.');
    if (upiResult.utrId || upiResult.transactionId) {
      recommendations.push(`Search for reference number "${upiResult.utrId || upiResult.transactionId}" in your official bank passbook or merchant settlement app.`);
    } else {
      recommendations.push('No verifiable UTR found. Demand official bank SMS confirmation or QR settlement notification.');
    }
  } else if (riskLevel === 'medium') {
    recommendations.push('Hold transaction settlement pending verification in your bank portal.');
    recommendations.push('Request the buyer to show the live transaction screen in their payment app.');
  } else {
    recommendations.push('Image characteristics appear standard; however, always confirm fund credit in your merchant account before releasing goods.');
  }

  return {
    score: finalScore,
    riskLevel,
    categoryLabel,
    evidenceFactors,
    recommendations,
    disclaimer: 'Suspicion score represents anomalous image characteristics and does not constitute absolute proof of fraud or payment confirmation.'
  };
};
