import React from 'react';
import Modal from './Modal';
import { Printer, ShoppingBag, ImageDown } from 'lucide-react';
import { formatRupiah, formatDate } from '../utils/formatters';

const ReceiptModal = ({ isOpen, onClose, transaction }) => {
  if (!transaction) return null;

  const handleDownloadImage = () => {
    const W = 420;
    const pad = 24;
    const lineH = 22;
    const items = transaction.items || [];

    // Estimate total height dynamically
    const metaLines = 4;
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

    // Helper functions
    const dashedLine = (yy) => {
      ctx.setLineDash([5, 4]);
      ctx.strokeStyle = '#f0a3d0';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(pad, yy);
      ctx.lineTo(W - pad, yy);
      ctx.stroke();
      ctx.setLineDash([]);
    };
    const solidLine = (yy, color = '#f0a3d0') => {
      ctx.setLineDash([]);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
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

    // ---- Header ----
    ctx.font = 'bold 16px Arial';
    ctx.fillStyle = '#a0336e';
    ctx.textAlign = 'center';
    ctx.fillText('🥧 BOENDA PIE PURWOKERTO', W / 2, y + 20);
    y += 28;

    ctx.font = '11px Arial';
    ctx.fillStyle = '#c4577a';
    ctx.fillText('Sokawera, Berkoh, Kec. Purwokerto Sel., Kabupaten Banyumas, Jawa Tengah', W / 2, y + 14);
    y += 18;
    ctx.font = '10px Arial';
    ctx.fillStyle = '#888';
    ctx.fillText('Telp/WA: 08986659534', W / 2, y + 14);
    y += 22;

    dashedLine(y); y += 14;

    // ---- Meta ----
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

    dashedLine(y); y += 14;

    // ---- Items ----
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

    dashedLine(y); y += 12;
    solidLine(y, '#d1d5db'); y += 14;

    // ---- Totals ----
    ctx.font = 'bold 14px Arial';
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

    ctx.font = 'bold 13px Arial'; ctx.fillStyle = '#1a7a3a';
    ctx.textAlign = 'left'; ctx.fillText('KEMBALIAN', pad, y);
    ctx.textAlign = 'right'; ctx.fillText(formatRupiah(transaction.changeAmount), W - pad, y);
    y += 18;

    dashedLine(y); y += 16;

    // ---- Footer ----
    ctx.font = 'bold 11px Arial'; ctx.fillStyle = '#3d2c1e'; ctx.textAlign = 'center';
    ctx.fillText('Terima kasih telah berbelanja di Boenda Pie!', W / 2, y);
    y += 16;
    ctx.font = '10px Arial'; ctx.fillStyle = '#888';
    ctx.fillText('Pie krispi khas Purwokerto favorit keluarga.', W / 2, y);

    // Download
    const link = document.createElement('a');
    link.download = `Struk_${transaction.invoiceNumber || 'Boenda_Pie'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handlePrint = () => {
    const printContent = document.getElementById('printable-receipt-content').innerHTML;
    const printWindow = window.open('', '_blank', 'width=400,height=700');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Struk - ${transaction.invoiceNumber}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: 'Courier New', Courier, monospace;
              font-size: 12px;
              color: #1a1a1a;
              background: white;
              width: 100%;
              max-width: 320px;
              margin: 0 auto;
              padding: 12px;
            }
            .receipt-wrapper {
              width: 100%;
            }
            .receipt-header {
              text-align: center;
              padding-bottom: 10px;
              border-bottom: 2px dashed #ccc;
              margin-bottom: 10px;
            }
            .receipt-header .store-icon {
              font-size: 22px;
              margin-bottom: 4px;
            }
            .receipt-header h1 {
              font-size: 14px;
              font-weight: 900;
              letter-spacing: 1px;
              text-transform: uppercase;
              margin-bottom: 2px;
              font-family: Arial, sans-serif;
            }
            .receipt-header p {
              font-size: 10px;
              color: #555;
              line-height: 1.4;
              font-family: Arial, sans-serif;
            }
            .receipt-meta {
              padding: 8px 0;
              border-bottom: 1px dashed #ccc;
              margin-bottom: 8px;
            }
            .meta-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 3px;
              font-size: 11px;
            }
            .meta-row .label { color: #666; }
            .meta-row .value { font-weight: 700; }
            .badge {
              background: #f0f0f0;
              padding: 1px 6px;
              border-radius: 4px;
              font-size: 10px;
              font-weight: 800;
              font-family: Arial, sans-serif;
            }
            .items-section {
              padding: 8px 0;
              border-bottom: 2px dashed #ccc;
              margin-bottom: 8px;
            }
            .item {
              margin-bottom: 6px;
            }
            .item-name {
              font-weight: 800;
              font-size: 12px;
              margin-bottom: 2px;
            }
            .item-detail {
              display: flex;
              justify-content: space-between;
              padding-left: 10px;
              font-size: 11px;
              color: #444;
            }
            .totals-section {
              padding: 6px 0;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 4px;
              font-size: 12px;
            }
            .total-row.grand-total {
              font-size: 14px;
              font-weight: 900;
              border-top: 2px solid #ccc;
              padding-top: 6px;
              margin-top: 4px;
            }
            .total-row.kembalian {
              font-weight: 800;
              color: #1a7a3a;
            }
            .receipt-footer {
              text-align: center;
              border-top: 2px dashed #ccc;
              margin-top: 10px;
              padding-top: 10px;
              font-size: 10px;
              color: #666;
              line-height: 1.5;
              font-family: Arial, sans-serif;
            }
            .receipt-footer strong {
              font-size: 11px;
              color: #333;
            }
            @media print {
              @page { margin: 0; }
              body { margin: 10px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 300);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Struk Pembayaran" maxWidth="max-w-md">
      <div className="space-y-4">
        {/* Printable Receipt Preview */}
        <div className="p-4 bg-pink-50/40 rounded-xl border border-pink-100 font-mono text-xs text-slate-700 leading-relaxed">
          {/* Hidden print-formatted version */}
          <div id="printable-receipt-content" style={{ display: 'none' }}>
            <div className="receipt-wrapper">
              <div className="receipt-header">
                <div className="store-icon">🥧</div>
                <h1>BOENDA PIE PURWOKERTO</h1>
                <p>Sokawera, Berkoh, Kec. Purwokerto Sel., Kabupaten Banyumas, Jawa Tengah</p>
                <p>Telp/WA: 08986659534</p>
              </div>
              <div className="receipt-meta">
                <div className="meta-row"><span className="label">No Invoice:</span><span className="value">{transaction.invoiceNumber}</span></div>
                <div className="meta-row"><span className="label">Waktu:</span><span className="value">{formatDate(transaction.date || transaction.createdAt)}</span></div>
                <div className="meta-row"><span className="label">Kasir:</span><span className="value">{transaction.cashierName}</span></div>
                <div className="meta-row"><span className="label">Metode:</span><span className="value"><span className="badge">{transaction.paymentMethod}</span></span></div>
              </div>
              <div className="items-section">
                {transaction.items && transaction.items.map((item, index) => (
                  <div key={index} className="item">
                    <div className="item-name">{item.productName}</div>
                    <div className="item-detail">
                      <span>{item.quantity} x {formatRupiah(item.price)}</span>
                      <span>{formatRupiah(item.subtotal)}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="totals-section">
                <div className="total-row grand-total"><span>TOTAL</span><span>{formatRupiah(transaction.totalAmount)}</span></div>
                <div className="total-row"><span>BAYAR</span><span>{formatRupiah(transaction.payAmount)}</span></div>
                <div className="total-row kembalian"><span>KEMBALIAN</span><span>{formatRupiah(transaction.changeAmount)}</span></div>
              </div>
              <div className="receipt-footer">
                <strong>Terima kasih telah berbelanja di Boenda Pie!</strong><br />
                Pie krispi khas Purwokerto favorit keluarga.
              </div>
            </div>
          </div>

          {/* Visible Preview inside Modal */}
          <div className="text-center pb-3 border-b border-dashed border-pink-200">
            <div className="flex justify-center mb-1">
              <ShoppingBag className="w-6 h-6 text-pink-500" />
            </div>
            <h2 className="text-base font-bold text-pink-900 font-sans tracking-wide">BOENDA PIE PURWOKERTO</h2>
            <p className="text-[11px] text-pink-700 font-sans">Sokawera, Berkoh, Kec. Purwokerto Sel., Kabupaten Banyumas, Jawa Tengah</p>
            <p className="text-[10px] text-slate-500 font-sans">Telp/WA: 08986659534</p>
          </div>

          <div className="py-2 border-b border-dashed border-pink-200 text-[11px] space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">No Invoice:</span>
              <span className="font-semibold text-slate-800">{transaction.invoiceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Waktu:</span>
              <span>{formatDate(transaction.date || transaction.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Kasir:</span>
              <span>{transaction.cashierName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Metode:</span>
              <span className="font-bold bg-pink-100 text-pink-800 px-1.5 py-0.5 rounded text-[10px]">{transaction.paymentMethod}</span>
            </div>
          </div>

          {/* Items */}
          <div className="py-3 border-b border-dashed border-pink-200 space-y-2">
            {transaction.items && transaction.items.map((item, index) => (
              <div key={index} className="space-y-0.5">
                <div className="font-semibold text-slate-800">{item.productName}</div>
                <div className="flex justify-between text-slate-600 pl-2">
                  <span>{item.quantity} x {formatRupiah(item.price)}</span>
                  <span>{formatRupiah(item.subtotal)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="pt-3 space-y-1 text-xs">
            <div className="flex justify-between font-bold text-slate-900 text-sm pt-1">
              <span>TOTAL</span>
              <span className="text-slate-950 font-black">{formatRupiah(transaction.totalAmount)}</span>
            </div>
            <div className="flex justify-between pt-1">
              <span>BAYAR</span>
              <span>{formatRupiah(transaction.payAmount)}</span>
            </div>
            <div className="flex justify-between font-semibold text-emerald-700">
              <span>KEMBALIAN</span>
              <span>{formatRupiah(transaction.changeAmount)}</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-dashed border-pink-200 text-center text-[10px] text-slate-500 font-sans">
            <p className="font-medium text-slate-700">Terima kasih telah berbelanja di Boenda Pie!</p>
            <p>Pie krispi khas Purwokerto favorit keluarga.</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 bg-[#f8cee8] text-[#a0336e] border border-[#f0a3d0] hover:bg-[#f3b5db] font-extrabold text-xs rounded-2xl shadow-xs transition-all active:scale-95"
          >
            <Printer className="w-4 h-4" />
            Cetak
          </button>
          <button
            type="button"
            onClick={handleDownloadImage}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 bg-[#beeaff] text-[#1a6fa0] border border-[#7dcef5] hover:bg-[#a5e1ff] font-extrabold text-xs rounded-2xl shadow-xs transition-all active:scale-95"
          >
            <ImageDown className="w-4 h-4" />
            Simpan Gambar
          </button>
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ReceiptModal;
