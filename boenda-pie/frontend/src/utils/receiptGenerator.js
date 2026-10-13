import { formatRupiah, formatDate } from './formatters';

/**
 * Generate high-resolution Receipt Image Canvas and Base64 Data URL
 */
export const generateReceiptCanvas = (transaction) => {
  if (!transaction) return null;

  const W = 420;
  const pad = 24;
  const lineH = 22;
  const items = transaction.items || [];

  const metaLines = 5;
  const itemLines = items.length * 2;
  const totalLines = 4;
  const H = pad * 2 + 90 + (metaLines * lineH) + 16 + (itemLines * lineH) + 16 + (totalLines * lineH) + 60;

  const canvas = document.createElement('canvas');
  const scale = 2; // retina
  canvas.width = W * scale;
  canvas.height = H * scale;
  const ctx = canvas.getContext('2d');
  ctx.scale(scale, scale);

  // Background
  ctx.fillStyle = '#fffaf5';
  ctx.roundRect(0, 0, W, H, 16);
  ctx.fill();

  // Pink border
  ctx.strokeStyle = '#f8cee8';
  ctx.lineWidth = 2;
  ctx.roundRect(1, 1, W - 2, H - 2, 15);
  ctx.stroke();

  let y = pad;

  // Helpers
  const dashedLine = (yy) => {
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = '#e8a5cb';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad, yy);
    ctx.lineTo(W - pad, yy);
    ctx.stroke();
    ctx.setLineDash([]);
  };
  const solidLine = (yy, color = '#e8a5cb') => {
    ctx.setLineDash([]);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad, yy);
    ctx.lineTo(W - pad, yy);
    ctx.stroke();
  };
  const text = (txt, x, yy, opts = {}) => {
    ctx.font = `${opts.weight || 'normal'} ${opts.size || 12}px ${opts.family || 'monospace'}`;
    ctx.fillStyle = opts.color || '#1a1a1a';
    ctx.textAlign = opts.align || 'left';
    ctx.fillText(txt, x, yy);
  };
  const rowText = (left, right, yy, opts = {}) => {
    text(left, pad, yy, { ...opts, align: 'left' });
    text(right, W - pad, yy, { ...opts, align: 'right' });
  };

  // Header Mascot & Title
  const imgEl = new Image();
  imgEl.src = '/mascot_pie_hd.png';
  if (imgEl.complete && imgEl.naturalWidth > 0) {
    const imgAspect = imgEl.naturalWidth / imgEl.naturalHeight;
    const targetH = 46;
    const targetW = targetH * imgAspect;
    ctx.drawImage(imgEl, (W - targetW) / 2, y, targetW, targetH);
    y += targetH + 8;
  } else {
    y += 6;
  }

  ctx.font = 'bold 15px Arial';
  ctx.fillStyle = '#a0336e';
  ctx.textAlign = 'center';
  ctx.fillText('BOENDA PIE PURWOKERTO', W / 2, y + 14);
  y += 20;

  ctx.font = '11px Arial';
  ctx.fillStyle = '#c4577a';
  ctx.fillText('Sokawera, Berkoh, Kec. Purwokerto Sel., Kabupaten Banyumas, Jawa Tengah', W / 2, y + 12);
  y += 16;
  ctx.font = '10px Arial';
  ctx.fillStyle = '#888';
  ctx.fillText('Telp/WA: 08986659534', W / 2, y + 12);
  y += 20;

  dashedLine(y); y += 16;

  // Meta
  ctx.textAlign = 'left';
  rowText('No Invoice:', transaction.invoiceNumber || '-', y, { size: 11, family: 'Arial', color: '#555' });
  ctx.font = 'bold 11px Arial'; ctx.fillStyle = '#1a1a1a'; ctx.textAlign = 'right';
  ctx.fillText(transaction.invoiceNumber || '-', W - pad, y);
  y += lineH;

  rowText('Waktu:', formatDate(transaction.date || transaction.createdAt), y, { size: 11, family: 'Arial', color: '#555' });
  ctx.font = '11px Arial'; ctx.fillStyle = '#1a1a1a'; ctx.textAlign = 'right';
  ctx.fillText(formatDate(transaction.date || transaction.createdAt), W - pad, y);
  y += lineH;

  rowText('Kasir:', transaction.cashierName || '-', y, { size: 11, family: 'Arial', color: '#555' });
  ctx.font = '11px Arial'; ctx.fillStyle = '#1a1a1a'; ctx.textAlign = 'right';
  ctx.fillText(transaction.cashierName || '-', W - pad, y);
  y += lineH;

  // Pembeli
  if (transaction.customerName && transaction.customerName !== 'Umum') {
    const custDisplay = transaction.customerPhone 
      ? `${transaction.customerName} (${transaction.customerPhone})` 
      : transaction.customerName;
    text('Pembeli:', pad, y, { size: 11, family: 'Arial', color: '#555', align: 'left' });
    text(custDisplay, W - pad, y, { size: 11, weight: 'bold', family: 'Arial', color: '#1a1a1a', align: 'right' });
    y += lineH;
  }

  // Metode badge
  ctx.font = '11px Arial'; ctx.fillStyle = '#555'; ctx.textAlign = 'left';
  ctx.fillText('Metode:', pad, y);
  const badgeTxt = transaction.paymentMethod || '-';
  ctx.font = 'bold 10px Arial';
  const bw = ctx.measureText(badgeTxt).width + 14;
  const bx = W - pad - bw;
  ctx.fillStyle = '#f8cee8';
  ctx.beginPath();
  ctx.roundRect(bx, y - 12, bw, 17, 6);
  ctx.fill();
  ctx.fillStyle = '#a0336e';
  ctx.textAlign = 'center';
  ctx.fillText(badgeTxt, bx + bw / 2, y);
  y += lineH;

  // Packaging
  if (transaction.packaging) {
    ctx.font = '11px Arial'; ctx.fillStyle = '#555'; ctx.textAlign = 'left';
    ctx.fillText('Packaging:', pad, y);
    const pkgTxt = (transaction.packaging === 'KARDUS' ? 'Kardus' : 'Kertas') +
      (transaction.packagingFee > 0 ? ` (+${formatRupiah(transaction.packagingFee)})` : ' (Gratis)');
    ctx.font = 'bold 10px Arial'; ctx.fillStyle = '#8a6000'; ctx.textAlign = 'right';
    ctx.fillText(pkgTxt, W - pad, y);
    y += lineH;
  }

  // Notes
  if (transaction.notes) {
    ctx.font = '11px Arial'; ctx.fillStyle = '#555'; ctx.textAlign = 'left';
    ctx.fillText('Request:', pad, y);
    ctx.font = 'italic 10px Arial'; ctx.fillStyle = '#1a1a1a'; ctx.textAlign = 'right';
    const maxLen = 25;
    const noteTxt = transaction.notes.length > maxLen ? transaction.notes.substring(0, maxLen) + '...' : transaction.notes;
    ctx.fillText(noteTxt, W - pad, y);
    y += lineH;
  }

  dashedLine(y); y += 16;

  // Items
  items.forEach((item) => {
    ctx.font = 'bold 12px Arial';
    ctx.fillStyle = '#1a1a1a';
    ctx.textAlign = 'left';
    ctx.fillText(item.productName, pad, y);
    y += 18;
    ctx.font = '11px Arial';
    ctx.fillStyle = '#555';
    ctx.textAlign = 'left';
    ctx.fillText(`  ${item.quantity} x ${formatRupiah(item.price)}`, pad, y);
    ctx.textAlign = 'right';
    ctx.fillText(formatRupiah(item.subtotal), W - pad, y);
    y += lineH;
  });

  dashedLine(y); y += 16;

  // Totals
  ctx.font = 'bold 13px Arial';
  ctx.fillStyle = '#1a1a1a';
  ctx.textAlign = 'left';
  ctx.fillText('TOTAL', pad, y);
  ctx.textAlign = 'right';
  ctx.fillText(formatRupiah(transaction.totalAmount), W - pad, y);
  y += lineH;

  ctx.font = '12px Arial'; ctx.fillStyle = '#444';
  ctx.textAlign = 'left'; ctx.fillText('BAYAR', pad, y);
  ctx.textAlign = 'right'; ctx.fillText(formatRupiah(transaction.payAmount), W - pad, y);
  y += lineH;

  ctx.font = 'bold 12px Arial'; ctx.fillStyle = '#1a7a3a';
  ctx.textAlign = 'left'; ctx.fillText('KEMBALIAN', pad, y);
  ctx.textAlign = 'right'; ctx.fillText(formatRupiah(transaction.changeAmount), W - pad, y);
  y += 18;

  dashedLine(y); y += 16;

  // Footer
  ctx.font = 'bold 11px Arial'; ctx.fillStyle = '#3d2c1e'; ctx.textAlign = 'center';
  ctx.fillText('Terima kasih telah berbelanja di Boenda Pie!', W / 2, y);
  y += 16;
  ctx.font = '10px Arial'; ctx.fillStyle = '#888';
  ctx.fillText('Pie krispi khas Purwokerto favorit keluarga.', W / 2, y);

  return canvas;
};

export const getReceiptBase64 = (transaction) => {
  const canvas = generateReceiptCanvas(transaction);
  return canvas ? canvas.toDataURL('image/png') : null;
};
