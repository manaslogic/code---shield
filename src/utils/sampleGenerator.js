/**
 * Sample UPI Screenshot Generator for instant local testing.
 * Generates test images with verifiable visual text and canvas patterns.
 */

export const createSampleScreenshot = (type = 'authentic') => {
  const canvas = document.createElement('canvas');
  canvas.width = 420;
  canvas.height = 760;
  const ctx = canvas.getContext('2d');

  if (type === 'authentic') {
    // 1. Google Pay style Authentic receipt
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Header bar
    ctx.fillStyle = '#1A73E8';
    ctx.fillRect(0, 0, canvas.width, 90);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 20px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Google Pay', canvas.width / 2, 54);

    // Green Check Circle
    ctx.beginPath();
    ctx.arc(canvas.width / 2, 170, 38, 0, Math.PI * 2);
    ctx.fillStyle = '#0F9D58';
    ctx.fill();

    // White Checkmark
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 - 14, 170);
    ctx.lineTo(canvas.width / 2 - 4, 180);
    ctx.lineTo(canvas.width / 2 + 16, 160);
    ctx.stroke();

    // Paid to text
    ctx.fillStyle = '#202124';
    ctx.font = 'bold 18px Inter, sans-serif';
    ctx.fillText('Paid to Sharma Provisions', canvas.width / 2, 240);

    ctx.fillStyle = '#5F6368';
    ctx.font = '14px Inter, sans-serif';
    ctx.fillText('sharmaprovisions@okaxis', canvas.width / 2, 268);

    // Amount
    ctx.fillStyle = '#202124';
    ctx.font = 'bold 44px Inter, sans-serif';
    ctx.fillText('₹1,450.00', canvas.width / 2, 340);

    // Status
    ctx.fillStyle = '#0F9D58';
    ctx.font = 'bold 16px Inter, sans-serif';
    ctx.fillText('✓ Payment Successful', canvas.width / 2, 380);

    // Separator line
    ctx.strokeStyle = '#E8EAED';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(30, 420);
    ctx.lineTo(canvas.width - 30, 420);
    ctx.stroke();

    // Transaction Details
    ctx.textAlign = 'left';
    ctx.fillStyle = '#5F6368';
    ctx.font = '13px Inter, sans-serif';
    ctx.fillText('UPI Ref No (UTR)', 40, 460);
    ctx.fillStyle = '#202124';
    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.fillText('432198765412', 40, 484);

    ctx.fillStyle = '#5F6368';
    ctx.font = '13px Inter, sans-serif';
    ctx.fillText('Date & Time', 40, 524);
    ctx.fillStyle = '#202124';
    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.fillText('20 Nov 2026, 06:45 PM', 40, 548);

    ctx.fillStyle = '#5F6368';
    ctx.font = '13px Inter, sans-serif';
    ctx.fillText('Paid From', 40, 588);
    ctx.fillStyle = '#202124';
    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.fillText('HDFC Bank •••• 8912', 40, 612);

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        const file = new File([blob], 'gpay_authentic_receipt.png', { type: 'image/png' });
        resolve({
          file,
          previewUrl: URL.createObjectURL(blob),
          name: 'gpay_authentic_receipt.png',
          size: '64.2 KB',
          rawSize: blob.size,
          type: 'image/png',
          dimensions: { width: 420, height: 760 },
          uploadedAt: new Date().toISOString()
        });
      }, 'image/png');
    });
  } else {
    // 2. Manipulated / Spliced Screenshot (High Suspicion)
    ctx.fillStyle = '#FAFAFA';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Pre-compress background with noise
    ctx.fillStyle = '#ECEFF1';
    for (let i = 0; i < canvas.width; i += 20) {
      for (let j = 0; j < canvas.height; j += 20) {
        if ((i + j) % 40 === 0) ctx.fillRect(i, j, 20, 20);
      }
    }

    // Header bar
    ctx.fillStyle = '#5F259F'; // PhonePe purple
    ctx.fillRect(0, 0, canvas.width, 90);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 20px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PhonePe', canvas.width / 2, 54);

    // White box pasted over original amount to simulate photo-editing splice!
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(30, 280, canvas.width - 60, 100);
    ctx.strokeStyle = '#D9E2EC';
    ctx.strokeRect(30, 280, canvas.width - 60, 100);

    // Heavily mismatched font for spliced amount
    ctx.fillStyle = '#C0393B';
    ctx.font = '900 48px "Courier New", monospace';
    ctx.fillText('₹95,000', canvas.width / 2, 345);

    // Details with non-standard UTR
    ctx.textAlign = 'left';
    ctx.fillStyle = '#78909C';
    ctx.font = '13px Inter, sans-serif';
    ctx.fillText('Beneficiary', 40, 420);
    ctx.fillStyle = '#263238';
    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.fillText('fake.merchant@invalid_psp', 40, 444);

    ctx.fillStyle = '#78909C';
    ctx.font = '13px Inter, sans-serif';
    ctx.fillText('Transaction ID (Altered)', 40, 484);
    ctx.fillStyle = '#C0393B';
    ctx.font = 'bold 14px "Courier New", monospace';
    ctx.fillText('TXN-999-FAKE', 40, 508);

    ctx.fillStyle = '#78909C';
    ctx.font = '13px Inter, sans-serif';
    ctx.fillText('Status', 40, 548);
    ctx.fillStyle = '#2E7D32';
    ctx.font = 'bold 15px Inter, sans-serif';
    ctx.fillText('Payment Successful', 40, 572);

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        const file = new File([blob], 'manipulated_payment_splice.jpg', { type: 'image/jpeg' });
        resolve({
          file,
          previewUrl: URL.createObjectURL(blob),
          name: 'manipulated_payment_splice.jpg',
          size: '88.5 KB',
          rawSize: blob.size,
          type: 'image/jpeg',
          dimensions: { width: 420, height: 760 },
          uploadedAt: new Date().toISOString()
        });
      }, 'image/jpeg', 0.6);
    });
  }
};
