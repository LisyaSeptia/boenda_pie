import React, { useEffect, useState } from 'react';
import { productService } from '../services/productService';
import { transactionService } from '../services/transactionService';
import { useCart } from '../context/CartContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';
import ReceiptModal from '../components/ReceiptModal';
import { formatRupiah } from '../utils/formatters';
import {
  Search,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  QrCode,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';

const POSKasirPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const {
    cartItems,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    paymentMethod,
    setPaymentMethod,
    payAmount,
    setPayAmount,
    totalAmount
  } = useCart();

  // Receipt Modal State
  const [completedTransaction, setCompletedTransaction] = useState(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  // Toast
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [search, selectedCategory]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await productService.getAll({
        search,
        category: selectedCategory
      });
      if (res.success) {
        setProducts(res.data);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal memuat katalog POS', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: 'success' }), 4000);
  };

  const numPay = Number(payAmount) || 0;
  const changeAmount = numPay >= totalAmount ? numPay - totalAmount : 0;
  const isPayValid = cartItems.length > 0 && numPay >= totalAmount;

  const handleCheckout = async () => {
    if (!isPayValid) {
      showToast('Nominal pembayaran kurang dari total belanja', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        items: cartItems.map((item) => ({
          productId: item._id,
          quantity: item.quantity
        })),
        payAmount: numPay,
        paymentMethod
      };

      const res = await transactionService.create(payload);
      if (res.success) {
        setCompletedTransaction(res.data);
        setIsReceiptOpen(true);
        clearCart();
        fetchProducts(); // Refresh stock in catalog
        showToast('Transaksi kasir berhasil diproses!');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal memproses transaksi', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = ['Food', 'Drink'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

      {/* Product Catalog Section (8 Cols) */}
      <div className="lg:col-span-7 xl:col-span-8 space-y-4">
        {/* Search & Category Filter */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari produk pie..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                selectedCategory === ''
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Semua
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        {loading ? (
          <LoadingSpinner text="Menyiapkan katalog kasir..." />
        ) : products.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-200">
            <ShoppingBag className="w-12 h-12 mx-auto mb-2 text-slate-300" />
            <p className="font-semibold text-sm">Produk tidak ditemukan</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 xl:grid-cols-4 gap-3">
            {products.map((prod) => {
              const isOutOfStock = prod.stock <= 0;
              return (
                <div
                  key={prod._id}
                  onClick={() => !isOutOfStock && addToCart(prod)}
                  className={`bg-white rounded-2xl border p-3.5 flex flex-col justify-between transition-all group ${
                    isOutOfStock
                      ? 'border-slate-200 opacity-60 cursor-not-allowed'
                      : 'border-slate-200/80 hover:border-amber-500 hover:shadow-md cursor-pointer'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-900 rounded-full">
                        {prod.category}
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        isOutOfStock ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        Stok: {prod.stock}
                      </span>
                    </div>

                    <h4 className="font-extrabold text-slate-800 text-xs line-clamp-2 group-hover:text-amber-700 transition-colors">
                      {prod.name}
                    </h4>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="font-black text-amber-800 text-sm">
                      {formatRupiah(prod.price)}
                    </span>
                    <button
                      disabled={isOutOfStock}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                        isOutOfStock
                          ? 'bg-slate-100 text-slate-400'
                          : 'bg-amber-500 text-slate-950 group-hover:bg-amber-600'
                      }`}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cart Side Panel (4 Cols) */}
      <div className="lg:col-span-5 xl:col-span-4 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs sticky top-20">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-slate-900 text-sm">Keranjang Pesanan</h3>
          </div>
          {cartItems.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 underline"
            >
              Kosongkan
            </button>
          )}
        </div>

        {/* Cart Items List */}
        <div className="max-h-60 overflow-y-auto space-y-2 pr-1 mb-4">
          {cartItems.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              Keranjang masih kosong. Klik produk di katalog untuk menambahkan.
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item._id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-2 text-xs">
                <div className="flex-1 overflow-hidden">
                  <p className="font-bold text-slate-800 truncate">{item.name}</p>
                  <p className="text-[11px] text-amber-700 font-semibold">{formatRupiah(item.price)}</p>
                </div>

                <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5">
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity - 1)}
                    className="p-1 hover:bg-slate-100 rounded text-slate-600"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-6 text-center font-bold text-slate-900 text-xs">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity + 1)}
                    className="p-1 hover:bg-slate-100 rounded text-slate-600"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-right shrink-0">
                  <p className="font-extrabold text-slate-900 text-xs">{formatRupiah(item.subtotal)}</p>
                  <button
                    onClick={() => removeFromCart(item._id)}
                    className="text-slate-400 hover:text-rose-600 text-[10px]"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Payment Summary */}
        <div className="pt-3 border-t border-slate-100 space-y-3 text-xs">
          <div className="flex justify-between font-bold text-slate-900 text-base">
            <span>TOTAL BELANJA</span>
            <span className="text-amber-800 font-black">{formatRupiah(totalAmount)}</span>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Metode Pembayaran</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('CASH')}
                className={`py-2 px-2 rounded-xl font-bold flex flex-col items-center gap-1 border transition-all text-[11px] ${
                  paymentMethod === 'CASH'
                    ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <DollarSign className="w-4 h-4" />
                TUNAI
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('QRIS')}
                className={`py-2 px-2 rounded-xl font-bold flex flex-col items-center gap-1 border transition-all text-[11px] ${
                  paymentMethod === 'QRIS'
                    ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <QrCode className="w-4 h-4" />
                QRIS
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('TRANSFER')}
                className={`py-2 px-2 rounded-xl font-bold flex flex-col items-center gap-1 border transition-all text-[11px] ${
                  paymentMethod === 'TRANSFER'
                    ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                TRANSFER
              </button>
            </div>
          </div>

          {/* Payment Input */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Uang Pembayaran (Rp)</label>
            <div className="relative">
              <input
                type="number"
                min="0"
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                placeholder="Masukkan nominal uang..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 font-extrabold text-sm focus:outline-none focus:border-amber-500"
              />
              <button
                type="button"
                onClick={() => setPayAmount(totalAmount.toString())}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-amber-100 text-amber-900 text-[10px] font-bold rounded-lg hover:bg-amber-200"
              >
                Uang Pas
              </button>
            </div>
          </div>

          {/* Change Display */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
            <span className="font-semibold text-slate-600">Kembalian:</span>
            <span className={`font-black text-sm ${numPay < totalAmount && cartItems.length > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
              {numPay < totalAmount && cartItems.length > 0
                ? `Kurang ${formatRupiah(totalAmount - numPay)}`
                : formatRupiah(changeAmount)}
            </span>
          </div>

          {/* Process Transaction Button */}
          <button
            type="button"
            disabled={!isPayValid || isSubmitting}
            onClick={handleCheckout}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-40 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>PROSES TRANSAKSI</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Receipt Modal */}
      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        transaction={completedTransaction}
      />
    </div>
  );
};

export default POSKasirPage;
