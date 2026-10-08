import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [payAmount, setPayAmount] = useState('');
  const [selectedPackaging, setSelectedPackaging] = useState('Kertas (Gratis)');

  const addToCart = (product) => {
    if (product.stock <= 0) return;

    setCartItems((prevItems) => {
      const existing = prevItems.find((item) => item._id === product._id);
      if (existing) {
        if (existing.quantity >= product.stock) return prevItems;
        return prevItems.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.price }
            : item
        );
      }
      return [
        ...prevItems,
        {
          _id: product._id,
          code: product.code,
          name: product.name,
          price: product.price,
          quantity: 1,
          maxStock: product.stock,
          unit: product.unit,
          subtotal: product.price,
          isDrink: product.category?.name?.toLowerCase().includes('drink') || product.category?.name?.toLowerCase().includes('minuman')
        }
      ];
    });
  };

  const updateQuantity = (productId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item._id === productId) {
          const qty = Math.min(newQty, item.maxStock);
          return {
            ...item,
            quantity: qty,
            subtotal: qty * item.price
          };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item._id !== productId));
  };

  const clearCart = () => {
    setCartItems([]);
    setPayAmount('');
    setPaymentMethod('CASH');
  };

  const totalAmount = cartItems.reduce((acc, item) => acc + item.subtotal, 0);
  const totalItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
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
        totalItemsCount,
        selectedPackaging,
        setSelectedPackaging
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
