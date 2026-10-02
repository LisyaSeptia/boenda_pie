import React from 'react';
import Modal from './Modal';
import { Printer, CheckCircle2, ShoppingBag } from 'lucide-react';
import { formatRupiah, formatDate } from '../utils/formatters';

const ReceiptModal = ({ isOpen, onClose, transaction }) => {
  if (!transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Struk Pembayaran" maxWidth="max-w-md">
      <div className="space-y-4">
        {/* Printable Area */}
        <div id="printable-receipt" className="p-4 bg-amber-50/40 rounded-xl border border-amber-100 font-mono text-xs text-slate-700 leading-relaxed">
          <div className="text-center pb-3 border-b border-dashed border-amber-200">
            <div className="flex justify-center mb-1">
              <ShoppingBag className="w-6 h-6 text-amber-600" />
            </div>
            <h2 className="text-base font-bold text-amber-900 font-sans tracking-wide">BOENDA PIE PURWOKERTO</h2>
            <p className="text-[11px] text-amber-700 font-sans">Jl. Raya Purwokerto, Jawa Tengah</p>
            <p className="text-[10px] text-slate-500 font-sans">Telp/WA: 0812-3456-7890</p>
          </div>

          <div className="py-2 border-b border-dashed border-amber-200 text-[11px] space-y-1">
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
              <span className="font-medium bg-amber-200/60 px-1.5 py-0.5 rounded text-[10px]">{transaction.paymentMethod}</span>
            </div>
          </div>

          {/* Items */}
          <div className="py-3 border-b border-dashed border-amber-200 space-y-2">
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
              <span className="text-amber-700">{formatRupiah(transaction.totalAmount)}</span>
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

          <div className="mt-4 pt-3 border-t border-dashed border-amber-200 text-center text-[10px] text-slate-500 font-sans">
            <p className="font-medium text-slate-700">Terima kasih telah berbelanja di Boenda Pie!</p>
            <p>Pie krispi khas Purwokerto favorit keluarga.</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-white font-medium text-sm rounded-xl shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            Cetak Struk
          </button>
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm rounded-xl transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ReceiptModal;
