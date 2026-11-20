/**
 * UPI Transaction Consistency & Specification Validation Engine
 * Validates parsed screenshot text against NPCI specifications and Indian banking standards.
 */

const KNOWN_UPI_HANDLES = new Set([
  'okaxis', 'okhdfcbank', 'oksbi', 'okicici', 'paytm', 'ybl', 'ibl', 'axl',
  'barodampay', 'federal', 'upi', 'apl', 'ptaxis', 'ptyes', 'ptsbi', 'pthdfc',
  'postbank', 'idfcbank', 'indus', 'kotak', 'airtel', 'slice', 'jupiteraxis',
  'fam', 'kmbl', 'superyes', 'rbl', 'citi', 'hsbc', 'pnb', 'aubank', 'unionbank'
]);

// Explicit demo, spoof, prank, or fake APK watermark patterns
const SPOOF_WATERMARK_PATTERNS = [
  /\bDEMO\s*[-—–:]*\s*NOT\s+A\s+REAL\s+TRANSACTION\b/i,
  /\bNOT\s+A\s+REAL\s+TRANSACTION\b/i,
  /\bFOR\s+(?:ENTERTAINMENT|TESTING|FUN)\s+(?:PURPOSES?\s+)?ONLY\b/i,
  /\b(?:PRANK|SPOOF|FAKEPAY|FAKESS|DUMMY\s+PAYMENT|MOCK\s+TRANSACTION)\b/i,
  /\bFUN\s+WALLET\b/i
];

export const parseAndValidateUPI = (rawText = '') => {
  const text = rawText || '';

  const result = {
    amount: null,
    upiId: null,
    transactionId: null,
    utrId: null,
    date: null,
    time: null,
    paymentStatus: null,
    isDemoOrSpoof: false,
    demoMarker: null,
    isUtrLengthInvalid: false,
    isClientUuidTxn: false,
    findings: [],
    consistencyRiskScore: 0,
    fieldIntegrity: {
      amountValid: false,
      upiIdValid: false,
      transactionIdValid: false,
      utrValid: false,
      dateTimeValid: false,
      statusValid: false
    }
  };

  // 1. EXPLICIT SPOOF / DEMO WATERMARK DETECTION
  for (const pattern of SPOOF_WATERMARK_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      result.isDemoOrSpoof = true;
      result.demoMarker = match[0];
      result.consistencyRiskScore += 90;
      result.findings.push(`CRITICAL: Explicit fake/demo watermark identified: "${match[0]}". This is a simulated screenshot.`);
      break;
    }
  }

  // 2. EXTRACT UPI ID (VPA)
  // e.g. kunalverma@fam, riteshkr@fam, merchant@okaxis
  const vpaRegex = /\b([a-zA-Z0-9.\-_]{2,64}@[a-zA-Z]{2,32})\b/g;
  const vpaMatches = [...text.matchAll(vpaRegex)];
  if (vpaMatches.length > 0) {
    for (const m of vpaMatches) {
      const handle = m[1].toLowerCase();
      const parts = handle.split('@');
      if (parts.length === 2) {
        result.upiId = m[1];
        const bankDomain = parts[1];
        if (KNOWN_UPI_HANDLES.has(bankDomain)) {
          result.fieldIntegrity.upiIdValid = true;
          result.findings.push(`Valid banking handle recognized: "@${bankDomain}".`);
        } else {
          result.findings.push(`Uncommon or custom UPI PSP handle detected: "@${bankDomain}".`);
        }
        break;
      }
    }
  }

  // 3. EXTRACT UTR / UPI REF NO (Strict NPCI standard: exactly 12 numeric digits)
  // Supports "UTR ID", "UTR", "UPI Ref No", "Ref No" across newlines or colons
  const utrMultiLinePattern = /(?:UTR(?:\s*ID|\s*No)?|UPI\s*Ref(?:\s*(?:No|ID|Num))?|Ref\s*(?:No|ID)?)[:\s#=-]*\n*\s*([0-9]{8,22})/i;
  const utrMatch = text.match(utrMultiLinePattern);

  if (utrMatch && utrMatch[1]) {
    const rawUtr = utrMatch[1].trim();
    result.utrId = rawUtr;

    if (rawUtr.length === 12) {
      result.fieldIntegrity.utrValid = true;
      result.findings.push(`Standard 12-digit numeric NPCI UTR confirmed: ${rawUtr}.`);
    } else {
      result.isUtrLengthInvalid = true;
      result.consistencyRiskScore += 45;
      result.findings.push(`ANOMALOUS UTR LENGTH (${rawUtr.length} digits: "${rawUtr}"): Genuine NPCI UPI UTRs must be strictly 12 digits. Length mismatch is a primary signature of fake payment APKs.`);
    }
  } else {
    // Standalone 12-digit number search
    const standalone12 = text.match(/\b([0-9]{12})\b/);
    if (standalone12) {
      result.utrId = standalone12[1];
      result.fieldIntegrity.utrValid = true;
      result.findings.push(`Identified 12-digit candidate UTR: ${standalone12[1]}.`);
    }
  }

  // 4. EXTRACT TRANSACTION ID (Can be UUID or application string)
  const txnPattern = /(?:Transaction\s*ID|Txn\s*ID)[:\s#=a-z]*\n*\s*([0-9A-Za-z_-]{8,45})/i;
  const txnMatch = text.match(txnPattern);
  if (txnMatch && txnMatch[1]) {
    const rawTxn = txnMatch[1].trim();
    result.transactionId = rawTxn;

    // Check if it's formatted as a client-side UUID (e.g. 7b1e8c0a-4f2b-4d91-9c3a-df02e8a6c7ab)
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rawTxn)) {
      result.isClientUuidTxn = true;
      result.consistencyRiskScore += 25;
      result.findings.push(`Transaction ID is a client-side software UUID ("${rawTxn}"), typical of wallet app simulations rather than NPCI clearing references.`);
    } else {
      result.fieldIntegrity.transactionIdValid = true;
      result.findings.push(`Application transaction reference detected: "${rawTxn}".`);
    }
  }

  // Consolidate primary reference ID
  if (!result.transactionId && result.utrId) {
    result.transactionId = result.utrId;
  }
  if (result.utrId && !result.fieldIntegrity.utrValid) {
    result.fieldIntegrity.transactionIdValid = false;
  }

  // 5. EXTRACT AMOUNT
  // Avoid picking up fragments of transaction IDs or UUIDs (require word boundary and no trailing letters)
  const amountPatterns = [
    /(?:₹|Rs\.?|INR)\s*([0-9]{1,3}(?:,[0-9]{2,3})*(?:\.[0-9]{2})?)(?![a-zA-Z0-9_-])/i,
    /(?:^|\s)₹\s*([0-9,]+(?:\.[0-9]{2})?)(?![a-zA-Z0-9_-])/,
    /(?:Paid|Payment of|Transferred|Sent)\s+(?:₹|Rs\.?|INR)?\s*([0-9]{1,3}(?:,[0-9]{2,3})*(?:\.[0-9]{2})?)(?![a-zA-Z0-9_-])/i,
    /(?:^|\n)\s*(?:₹|Rs\.?|INR)\s*([0-9]{1,6}(?:\.[0-9]{2})?)\s*(?=\n|$)/i,
    /(?:^|\n)\s*([0-9]{2,6}(?:\.[0-9]{2})?)\s*(?=\n|$)/
  ];

  for (const pattern of amountPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const cleanNumStr = match[1].replace(/,/g, '');
      const parsedNum = parseFloat(cleanNumStr);
      // Ensure it's not a year or a phone number fragment
      if (!isNaN(parsedNum) && parsedNum > 0 && parsedNum !== 2024 && parsedNum !== 2025 && parsedNum !== 2026 && parsedNum < 5000000) {
        result.amount = match[1];
        result.fieldIntegrity.amountValid = true;
        break;
      }
    }
  }

  // 6. EXTRACT DATE & TIME
  const datePatterns = [
    /\b([0-9]{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+[0-9]{4})\b/i,
    /\b([0-9]{1,2}[/-][0-9]{1,2}[/-][0-9]{2,4})\b/,
    /\b((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+[0-9]{1,2},?\s+[0-9]{4})\b/i
  ];

  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      result.date = match[1];
      result.fieldIntegrity.dateTimeValid = true;
      break;
    }
  }

  const timePatterns = [
    /\b([0-1]?[0-9]:[0-5][0-9](?::[0-5][0-9])?\s*(?:AM|PM|am|pm))\b/,
    /\b([0-2][0-9]:[0-5][0-9](?::[0-5][0-9])?)\b/
  ];

  for (const pattern of timePatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      result.time = match[1];
      break;
    }
  }

  // 7. EXTRACT PAYMENT STATUS
  const successKeywords = [
    'payment successful',
    'paid successfully',
    'paid securely',
    'payment completed',
    'paid to',
    'paid ',
    'transferred successfully',
    'successful',
    'completed',
    'money transferred',
    'transaction successful'
  ];

  const pendingKeywords = [
    'payment pending',
    'processing',
    'awaiting confirmation',
    'in progress'
  ];

  const failedKeywords = [
    'payment failed',
    'declined',
    'transaction failed'
  ];

  const lowerText = text.toLowerCase();

  if (failedKeywords.some(k => lowerText.includes(k))) {
    result.paymentStatus = 'Payment Failed';
    result.consistencyRiskScore += 70;
    result.findings.push('Payment status explicitly indicates failed or declined transaction.');
  } else if (pendingKeywords.some(k => lowerText.includes(k))) {
    result.paymentStatus = 'Processing / Pending';
    result.consistencyRiskScore += 35;
    result.findings.push('Payment status indicates transaction is still processing.');
  } else if (successKeywords.some(k => lowerText.includes(k))) {
    result.paymentStatus = 'Payment Successful';
    result.fieldIntegrity.statusValid = true;
    result.findings.push('Payment completion markers identified.');
  } else {
    result.paymentStatus = 'Unconfirmed';
    result.consistencyRiskScore += 25;
    result.findings.push('No verifiable payment success declaration identified in extracted text.');
  }

  // 8. STRICT PENALTIES FOR MISSING CORE EVIDENCE
  if (!result.amount) {
    result.consistencyRiskScore += 30;
    result.findings.push('CRITICAL: Transaction amount could not be verified on screenshot.');
  }
  if (!result.utrId && !result.transactionId) {
    result.consistencyRiskScore += 35;
    result.findings.push('CRITICAL: No banking UTR or reference ID was detected. Image lacks essential audit trail.');
  }

  return {
    ...result,
    consistencyRiskScore: Math.min(100, result.consistencyRiskScore)
  };
};
