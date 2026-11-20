/**
 * NPCI UPI UTR Decoder & Temporal Consistency Engine
 * Decodes the 12-digit Indian Banking UTR:
 * Format: Y DDD SSSSSSSS
 * Y = Last digit of the year (e.g., 6 for 2026, 5 for 2025)
 * DDD = Julian Day of the year (001 to 365/366)
 * SSSSSSSS = Sequential transaction clearing number
 */

export const decodeJulianUtr = (utrString, receiptDateStr = null) => {
  if (!utrString || typeof utrString !== 'string') {
    return {
      isValidFormat: false,
      reason: 'No UTR provided'
    };
  }

  const cleanUtr = utrString.trim();

  if (cleanUtr.length !== 12 || !/^[0-9]{12}$/.test(cleanUtr)) {
    return {
      isValidFormat: false,
      utr: cleanUtr,
      length: cleanUtr.length,
      reason: cleanUtr.length !== 12 
        ? `Invalid UTR length (${cleanUtr.length} digits). NPCI standard requires exactly 12 digits.`
        : 'UTR contains non-numeric characters.'
    };
  }

  // 1. Extract Components
  const yearDigit = parseInt(cleanUtr[0], 10);
  const julianDay = parseInt(cleanUtr.substring(1, 4), 10);
  const sequenceNum = cleanUtr.substring(4);

  // Map year digit to 4-digit year (relative to 2020-2029 decade)
  const currentYear = new Date().getFullYear();
  const currentDecadeBase = Math.floor(currentYear / 10) * 10;
  let decodedYear = currentDecadeBase + yearDigit;
  if (decodedYear > currentYear + 1) {
    decodedYear -= 10;
  }

  // 2. Validate Julian Day bounds (1 to 365, or 366 in leap years)
  const isLeapYear = (decodedYear % 4 === 0 && decodedYear % 100 !== 0) || (decodedYear % 400 === 0);
  const maxDays = isLeapYear ? 366 : 365;

  if (julianDay < 1 || julianDay > maxDays) {
    return {
      isValidFormat: true,
      utr: cleanUtr,
      yearDigit,
      decodedYear,
      julianDay,
      sequenceNum,
      isImpossibleJulianDay: true,
      reason: `Mathematically impossible Julian day (${julianDay}). Days must range between 001 and ${maxDays}.`
    };
  }

  // 3. Compute Decoded Calendar Date
  const decodedDate = new Date(decodedYear, 0, julianDay);
  const formattedDecodedDate = decodedDate.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  // 4. Compare with Receipt Date if present
  let isTemporalMismatch = false;
  let temporalDifferenceDays = 0;
  let receiptParsedDate = null;

  if (receiptDateStr) {
    const parsed = Date.parse(receiptDateStr);
    if (!isNaN(parsed)) {
      receiptParsedDate = new Date(parsed);
      const diffMs = Math.abs(receiptParsedDate.setHours(0,0,0,0) - decodedDate.setHours(0,0,0,0));
      temporalDifferenceDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

      // Mismatch if decoded UTR date differs from receipt date by more than 1 day
      if (temporalDifferenceDays > 1) {
        isTemporalMismatch = true;
      }
    }
  }

  return {
    isValidFormat: true,
    utr: cleanUtr,
    yearDigit,
    decodedYear,
    julianDay,
    sequenceNum,
    isImpossibleJulianDay: false,
    decodedDate,
    formattedDecodedDate,
    receiptDateStr,
    isTemporalMismatch,
    temporalDifferenceDays,
    isTemporalMatch: !isTemporalMismatch && receiptParsedDate !== null
  };
};

/**
 * Detects dummy, repetitive, or algorithmic sequences in UTR strings
 */
export const isDummySequence = (numberStr) => {
  if (!numberStr || typeof numberStr !== 'string') return null;
  const s = numberStr.trim();
  if (s.length < 8) return null;

  // 1. All identical digits (e.g. 111111111111, 000000000000)
  if (/^(\d)\1+$/.test(s)) {
    return { isDummy: true, type: 'Repeated Digits', pattern: `${s[0]} repeated ${s.length} times` };
  }

  // 2. Sequential ascending (e.g. 123456789012, 012345678901)
  const ascendingCheck = '01234567890123456789';
  if (ascendingCheck.includes(s) || ascendingCheck.includes(s.substring(0, 10))) {
    return { isDummy: true, type: 'Sequential Ascending', pattern: 'Ascending number sequence' };
  }

  // 3. Sequential descending (e.g. 987654321098)
  const descendingCheck = '98765432109876543210';
  if (descendingCheck.includes(s) || descendingCheck.includes(s.substring(0, 10))) {
    return { isDummy: true, type: 'Sequential Descending', pattern: 'Descending number sequence' };
  }

  // 4. Alternating 2-digit pairs (e.g. 121212121212, 101010101010)
  if (/^(\d{2})\1+$/.test(s)) {
    return { isDummy: true, type: 'Alternating Pattern', pattern: `Repeated sequence (${s.substring(0, 2)})` };
  }

  // 5. Symmetric mirror (e.g. 123456654321)
  const half = Math.floor(s.length / 2);
  const firstHalf = s.substring(0, half);
  const secondHalfReversed = s.substring(s.length - half).split('').reverse().join('');
  if (firstHalf === secondHalfReversed && firstHalf.length >= 4) {
    return { isDummy: true, type: 'Mirrored Sequence', pattern: 'Palindromic / mirror dummy pattern' };
  }

  return null;
};

/**
 * Compares phone status bar clock with receipt transaction time
 */
export const compareClocks = (statusBarTimeStr, txnTimeStr) => {
  if (!statusBarTimeStr || !txnTimeStr) return null;

  const parseMinutes = (timeStr) => {
    const match = timeStr.match(/([0-9]{1,2}):([0-9]{2})(?:\s*(AM|PM|am|pm))?/i);
    if (!match) return null;
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const meridian = match[3] ? match[3].toUpperCase() : null;

    if (meridian === 'PM' && hours < 12) hours += 12;
    if (meridian === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };

  const statusMinutes = parseMinutes(statusBarTimeStr);
  const txnMinutes = parseMinutes(txnTimeStr);

  if (statusMinutes === null || txnMinutes === null) return null;

  // If transaction time is significantly ahead of the status bar time on the same day
  // (e.g. status bar says 10:15 AM, receipt says 11:30 AM)
  const diffMinutes = txnMinutes - statusMinutes;

  if (diffMinutes > 15 && diffMinutes < 720) {
    return {
      isFuturePayment: true,
      diffMinutes,
      statusTime: statusBarTimeStr,
      txnTime: txnTimeStr,
      description: `Clock Inconsistency: Transaction receipt timestamp (${txnTimeStr}) is ${diffMinutes} minutes ahead of the phone's status bar clock (${statusBarTimeStr}).`
    };
  }

  return {
    isFuturePayment: false,
    diffMinutes,
    statusTime: statusBarTimeStr,
    txnTime: txnTimeStr
  };
};
