import React, { useEffect, useState } from 'react';
import { productService } from '../services/productService';
import { transactionService } from '../services/transactionService';
import { useCart } from '../context/CartContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';
import ReceiptModal from '../components/ReceiptModal';
import { formatRupiah } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';
import { getCachedData, setCachedData } from '../utils/dataCache';
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
  UtensilsCrossed,
  CupSoda,
  Sparkles,
  Loader2,
  User,
  Package
} from 'lucide-react';

const POSKasirPage = () => {
  const { user } = useAuth();
  const [activeCashierName, setActiveCashierName] = useState(user?.name || '');
  const [products, setProducts] = useState(() => getCachedData('products') || []);
  const [loading, setLoading] = useState(() => !getCachedData('products'));
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    if (user?.name && !activeCashierName) {
      setActiveCashierName(user.name);
    }
  }, [user]);

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
    totalAmount,
    selectedPackaging,
    setSelectedPackaging
  } = useCart();

  // Receipt Modal State
  const [completedTransaction, setCompletedTransaction] = useState(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  // Toast
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customerNote, setCustomerNote] = useState('');

  useEffect(() => {
    fetchProducts();
  }, [search, selectedCategory]);

  const fetchProducts = async () => {
    try {
      if (products.length === 0) setLoading(true);
      const res = await productService.getAll({
        search,
        category: selectedCategory
      });
      if (res.success) {
        setProducts(res.data);
        if (!search && !selectedCategory) setCachedData('products', res.data);
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

  const totalPies = cartItems.reduce((acc, item) => {
    const p = products.find(prod => prod._id === item._id);
    const isDrink = p ? ((p.category || '').toLowerCase() === 'drink' || (p.category || '').toLowerCase() === 'minuman') : false;
    return isDrink ? acc : acc + item.quantity;
  }, 0);

  // Set default packaging if free threshold reached
  useEffect(() => {
    if (totalPies >= 16 && selectedPackaging !== 'KARDUS') {
      setSelectedPackaging('KARDUS');
    } else if (totalPies < 16 && selectedPackaging !== 'KERTAS' && selectedPackaging !== 'KARDUS') {
      setSelectedPackaging('KERTAS');
    }
  }, [totalPies, selectedPackaging, setSelectedPackaging]);

  const packagingFee = (totalPies < 16 && selectedPackaging === 'KARDUS') ? 3500 : 0;
  const finalTotal = totalAmount + packagingFee;

  const numPay = Number(payAmount) || 0;
  const changeAmount = numPay >= finalTotal ? numPay - finalTotal : 0;
  const isPayValid = cartItems.length > 0 && numPay >= finalTotal;

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
        paymentMethod,
        cashierName: activeCashierName.trim() || user?.name || 'Kasir',
        packaging: selectedPackaging,
        packagingFee,
        notes: customerNote.trim()
      };

      const res = await transactionService.create(payload);
      if (res.success) {
        setCompletedTransaction({ ...res.data, packaging: selectedPackaging, packagingFee, notes: customerNote.trim() });
        setIsReceiptOpen(true);
        clearCart();
        setCustomerNote('');
        fetchProducts(); // Refresh stock in catalog
        showToast('Transaksi kasir berhasil diproses!');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal memproses transaksi', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter products by category for grouped view
  const foodProducts = products.filter(
    (p) => (p.category || '').toLowerCase() === 'food' || (p.category || '').toLowerCase() === 'makanan'
  );

  const drinkProducts = products.filter(
    (p) => (p.category || '').toLowerCase() === 'drink' || (p.category || '').toLowerCase() === 'minuman'
  );

  const otherProducts = products.filter(
    (p) =>
      (p.category || '').toLowerCase() !== 'food' &&
      (p.category || '').toLowerCase() !== 'makanan' &&
      (p.category || '').toLowerCase() !== 'drink' &&
      (p.category || '').toLowerCase() !== 'minuman'
  );

  const renderProductCard = (prod) => {
    const isOutOfStock = prod.stock <= 0;
    const isDrink = (prod.category || '').toLowerCase() === 'drink';
    return (
      <div
        key={prod._id}
        onClick={() => !isOutOfStock && addToCart(prod)}
        className={`bg-white rounded-2xl border-2 p-3.5 flex flex-col justify-between transition-all duration-200 group hover:-translate-y-0.5 ${isOutOfStock
            ? 'border-slate-200 opacity-60 cursor-not-allowed bg-slate-50/50'
            : isDrink
              ? 'border-[#beeaff] hover:border-[#7dcef5] hover:shadow-md cursor-pointer'
              : 'border-[#f8cee8] hover:border-[#f0a3d0] hover:shadow-md cursor-pointer'
          }`}
      >
        <div>
          <div className="flex justify-end mb-2">
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isOutOfStock
                  ? 'bg-rose-100 text-rose-800'
                  : prod.stock <= prod.minStock
                    ? 'bg-[#fcf0c0] text-[#8a6000]'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
            >
              Stok: {prod.stock}
            </span>
          </div>

          {/* Product Image */}
          <div className="w-full h-24 mb-3 rounded-xl overflow-hidden bg-slate-100">
            <img
              src={(() => {
                if (prod.image) return prod.image;
                
                const name = (prod.name || '').toLowerCase();
                // Minuman - jus dalam gelas
                if (name.includes('jambu'))   return '/img/jus_jambu.jpg';
                if (name.includes('jus') || name.includes('juice')) return '/img/jus_default.jpg';
                if (isDrink) return '/img/jus_default.jpg';
                // Pie / Makanan
                if (name.includes('strawberry') || name.includes('stroberi')) return '/img/pie_strawberry.jpg';
                // Default pie
                return '/img/pie_default.jpg';
              })()}
              alt={prod.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>


          <h4 className="font-extrabold text-slate-800 text-xs line-clamp-2 group-hover:text-[#a0336e] transition-colors">
            {prod.name}
          </h4>
        </div>

        <div className={`mt-3 pt-2.5 border-t flex items-center justify-between ${
          isDrink ? 'border-[#7dcef5]' : 'border-[#f0a3d0]'
        }`}>
          <span className="font-black text-slate-900 text-sm">
            {formatRupiah(prod.price)}
          </span>
          <button
            disabled={isOutOfStock}
            className={`w-6 h-6 rounded-lg flex items-center justify-center border font-bold transition-all ${isOutOfStock
                ? 'bg-slate-100 text-slate-400 border-slate-200'
                : isDrink
                  ? 'bg-[#beeaff] text-[#1a6fa0] border-[#7dcef5] hover:bg-[#a6e0fc] group-hover:scale-105 active:scale-95'
                  : 'bg-[#f8cee8] text-[#a0336e] border-[#f0a3d0] hover:bg-[#f3b5db] group-hover:scale-105 active:scale-95'
              }`}
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Product Catalog Section (8 Cols) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-5">
          {/* Search & Category Filter */}
          <div className="bg-white p-4 rounded-2xl border-2 border-[#f8cee8] shadow-xs flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#a0336e] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari menu..."
                className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-xs focus:outline-none focus:border-[#f8cee8] focus:bg-white transition-all"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setSelectedCategory('')}
                className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition-all shrink-0 border ${selectedCategory === ''
                    ? 'bg-[#fcf0c0] text-[#8a6000] border-[#f5d96b] shadow-xs'
                    : 'bg-white text-slate-500 border-slate-200 hover:bg-[#fffdf0]'
                  }`}
              >
                Semua Menu ✨
              </button>
              <button
                onClick={() => setSelectedCategory('Food')}
                className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition-all shrink-0 border flex items-center gap-1.5 ${selectedCategory === 'Food'
                    ? 'bg-[#f8cee8] text-[#a0336e] border-[#f0a3d0] shadow-xs'
                    : 'bg-white text-slate-500 border-slate-200 hover:bg-[#fff4f9]'
                  }`}
              >
                <UtensilsCrossed className="w-3.5 h-3.5" />
                Food 🍕
              </button>
              <button
                onClick={() => setSelectedCategory('Drink')}
                className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition-all shrink-0 border flex items-center gap-1.5 ${selectedCategory === 'Drink'
                    ? 'bg-[#beeaff] text-[#1a6fa0] border-[#7dcef5] shadow-xs'
                    : 'bg-white text-slate-500 border-slate-200 hover:bg-[#f0f9ff]'
                  }`}
              >
                <CupSoda className="w-3.5 h-3.5" />
                Drink 🥤
              </button>
            </div>
          </div>

          {/* Product Catalog Display */}
          {loading ? (
            <LoadingSpinner text="Menyiapkan katalog kasir..." />
          ) : products.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border-2 border-[#f8cee8] shadow-xs">
              <ShoppingBag className="w-12 h-12 mx-auto mb-2 text-[#a0336e]" />
              <p className="font-extrabold text-slate-700 text-sm">Menu tidak ditemukan</p>
              <p className="text-xs text-slate-400 mt-1">Coba kata kunci atau filter lain.</p>
            </div>
          ) : selectedCategory ? (
            /* Filtered View (Single Category) */
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5">
              {products.map((prod) => renderProductCard(prod))}
            </div>
          ) : (
            /* Default Grouped View (Food Row Section & Drink Row Section) */
            <div className="space-y-6">
              {/* FOOD SECTION */}
              {foodProducts.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-xl bg-[#f8cee8] text-[#a0336e] border border-[#f0a3d0]">
                        <UtensilsCrossed className="w-4 h-4" />
                      </span>
                      <h3 className="font-extrabold text-slate-800 text-sm">
                        Kategori Makanan (Food 🍕)
                      </h3>
                    </div>
                    <span className="text-[11px] font-extrabold text-[#a0336e] bg-[#f8cee8] px-3 py-1 rounded-full border border-[#f0a3d0]">
                      {foodProducts.length} Varian
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5">
                    {foodProducts.map((prod) => renderProductCard(prod))}
                  </div>
                </div>
              )}

              {/* DRINK SECTION */}
              {drinkProducts.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-xl bg-[#beeaff] text-[#1a6fa0] border border-[#7dcef5]">
                        <CupSoda className="w-4 h-4" />
                      </span>
                      <h3 className="font-extrabold text-slate-800 text-sm">
                        Kategori Minuman (Drink 🥤)
                      </h3>
                    </div>
                    <span className="text-[11px] font-extrabold text-[#1a6fa0] bg-[#beeaff] px-3 py-1 rounded-full border border-[#7dcef5]">
                      {drinkProducts.length} Varian
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5">
                    {drinkProducts.map((prod) => renderProductCard(prod))}
                  </div>
                </div>
              )}

              {/* OTHER SECTION (if any) */}
              {otherProducts.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-xl bg-[#fcf0c0] text-[#8a6000] border border-[#f5d96b]">
                        <Sparkles className="w-4 h-4" />
                      </span>
                      <h3 className="font-extrabold text-slate-800 text-sm">
                        Menu Lainnya
                      </h3>
                    </div>
                    <span className="text-[11px] font-extrabold text-[#8a6000] bg-[#fcf0c0] px-3 py-1 rounded-full border border-[#f5d96b]">
                      {otherProducts.length} Varian
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5">
                    {otherProducts.map((prod) => renderProductCard(prod))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Cart Side Panel (4 Cols) */}
        <div className="lg:col-span-5 xl:col-span-4 bg-white rounded-2xl border-2 border-[#f8cee8] p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b-2 border-[#f8cee8] mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-[#f8cee8] text-[#a0336e] border border-[#f0a3d0]">
                <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">Keranjang Pesanan</h3>
                <p className="text-[11px] text-slate-500 font-bold">Total {cartItems.reduce((acc, item) => acc + item.quantity, 0)} pcs item</p>
              </div>
            </div>
            {cartItems.length > 0 && (
              <button
                onClick={clearCart}
                className="text-[11px] font-extrabold text-rose-500 hover:text-rose-700 hover:underline transition-colors"
              >
                Kosongkan
              </button>
            )}
          </div>



          {/* Cart Items List */}
          <div className="max-h-60 overflow-y-auto space-y-2 pr-1 mb-4 custom-scrollbar">
            {cartItems.length === 0 ? (
              <div className="py-10 text-center text-slate-400 text-xs">
                <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="font-medium text-slate-500">Keranjang masih kosong</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Klik produk di katalog untuk menambahkan.</p>
              </div>
            ) : (
              cartItems.map((item) => (
                <div key={item._id} className="p-3 rounded-xl bg-[#fff4f9] border border-[#f8cee8] flex items-center justify-between gap-2 text-xs hover:border-[#f0a3d0] transition-colors">
                  <div className="flex-1 overflow-hidden">
                    <p className="font-bold text-slate-800 truncate">{item.name}</p>
                    <p className="text-[11px] text-[#a0336e] font-extrabold">{formatRupiah(item.price)}</p>
                  </div>

                  <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-2xs">
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity - 1)}
                      className="p-1 hover:bg-[#fff4f9] rounded-lg text-slate-600 transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-6 text-center font-extrabold text-slate-900 text-xs">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                      className="p-1 hover:bg-[#f0f9ff] rounded-lg text-slate-600 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="font-black text-slate-900 text-xs">{formatRupiah(item.subtotal)}</p>
                    <button
                      onClick={() => removeFromCart(item._id)}
                      className="text-rose-400 hover:text-rose-600 text-[10px] font-semibold transition-colors"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Payment Summary */}
          <div className="pt-3.5 border-t border-[#f8cee8] space-y-3.5 text-xs">
            <div className="p-3 rounded-xl bg-[#fcf0c0] border-2 border-[#f5d96b] flex justify-between items-center">
              <span className="font-extrabold text-[#8a6000] text-xs uppercase tracking-wider">TOTAL BELANJA</span>
              <span className="text-slate-950 font-black text-lg">{formatRupiah(finalTotal)}</span>
            </div>

            {/* Packaging Selection */}
            {cartItems.length > 0 && (
              <div>
                <label className="block font-extrabold text-slate-700 mb-2 text-xs">Pilihan Packaging Pie ({totalPies} pcs)</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedPackaging('KERTAS')}
                    className={`flex-1 py-2 px-2 rounded-xl font-bold flex flex-col items-center gap-1 border-2 transition-all text-[11px] ${selectedPackaging === 'KERTAS'
                        ? 'bg-[#beeaff] text-[#1a6fa0] border-[#7dcef5] shadow-xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-[#f0f9ff]'
                      }`}
                  >
                    <Package className="w-4 h-4" />
                    Kertas (Gratis)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedPackaging('KARDUS')}
                    className={`flex-1 py-2 px-2 rounded-xl font-bold flex flex-col items-center gap-1 border-2 transition-all text-[11px] ${selectedPackaging === 'KARDUS'
                        ? 'bg-[#f8cee8] text-[#a0336e] border-[#f0a3d0] shadow-xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-[#fff4f9]'
                      }`}
                  >
                    <Package className="w-4 h-4" />
                    Kardus {totalPies >= 16 ? '(Gratis)' : '(+Rp 3.500)'}
                  </button>
                </div>
              </div>
            )}

            {/* Payment Method Selector */}
            <div>
              <label className="block font-extrabold text-slate-700 mb-2 text-xs">Metode Pembayaran</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('CASH')}
                  className={`py-2.5 px-2 rounded-2xl font-extrabold flex flex-col items-center gap-1 border-2 transition-all text-[11px] ${paymentMethod === 'CASH'
                      ? 'bg-[#f8cee8] text-[#a0336e] border-[#f0a3d0] shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-[#fff4f9]'
                    }`}
                >
                  <DollarSign className="w-4 h-4 stroke-[2.5]" />
                  TUNAI
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('QRIS')}
                  className={`py-2.5 px-2 rounded-2xl font-extrabold flex flex-col items-center gap-1 border-2 transition-all text-[11px] ${paymentMethod === 'QRIS'
                      ? 'bg-[#beeaff] text-[#1a6fa0] border-[#7dcef5] shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-[#f0f9ff]'
                    }`}
                >
                  <QrCode className="w-4 h-4 stroke-[2.5]" />
                  QRIS
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('TRANSFER')}
                  className={`py-2.5 px-2 rounded-2xl font-extrabold flex flex-col items-center gap-1 border-2 transition-all text-[11px] ${paymentMethod === 'TRANSFER'
                      ? 'bg-[#fcf0c0] text-[#8a6000] border-[#f5d96b] shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-[#fffdf0]'
                    }`}
                >
                  <CreditCard className="w-4 h-4 stroke-[2.5]" />
                  TRANSFER
                </button>
              </div>
            </div>

            {/* Payment Input */}
            <div>
              <label className="block font-extrabold text-slate-700 mb-1.5 text-xs">Uang Pembayaran (Rp)</label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  value={payAmount ? Number(payAmount).toLocaleString('id-ID') : ''}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^0-9]/g, '');
                    setPayAmount(raw);
                  }}
                  placeholder="Masukkan nominal uang..."
                  className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl py-2.5 pl-3 pr-24 font-extrabold text-sm focus:outline-none focus:border-[#f8cee8] focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setPayAmount(finalTotal.toString())}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#f8cee8] text-[#a0336e] border border-[#f0a3d0] text-[10px] font-extrabold rounded-xl hover:bg-[#f3b5db] active:scale-95 transition-all"
                >
                  Uang Pas
                </button>
              </div>
            </div>

            {/* Change Display */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
              <span className="font-bold text-slate-600 text-xs">Kembalian:</span>
              <span className={`font-black text-sm ${numPay < finalTotal && cartItems.length > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                {numPay < finalTotal && cartItems.length > 0
                  ? `Kurang ${formatRupiah(finalTotal - numPay)}`
                  : formatRupiah(changeAmount)}
              </span>
            </div>

            {/* Customer Notes */}
            <div>
              <label className="block font-extrabold text-slate-700 mb-1.5 text-xs">Request Pembeli (Opsional)</label>
              <textarea
                value={customerNote}
                onChange={(e) => setCustomerNote(e.target.value)}
                placeholder="Contoh: Tolong pisahkan rasa cokelat..."
                rows="2"
                className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-[#7dcef5]"
              />
            </div>

            {/* Process Transaction Button */}
            <button
              type="button"
              disabled={!isPayValid || isSubmitting}
              onClick={handleCheckout}
              className="w-full py-3.5 px-4 bg-[#f8cee8] text-[#a0336e] border-2 border-[#f0a3d0] hover:bg-[#f3b5db] font-black text-xs uppercase tracking-wider rounded-2xl shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-40 cursor-pointer active:scale-98"
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
    </>
  );
};

export default POSKasirPage;
