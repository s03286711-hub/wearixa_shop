'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { calculateShippingCharge } from '@/utils/shippingUtils';
import { useAuth } from './AuthContext';

export interface CartItem {
  _id: string;
  title: string;
  price: number;
  image: string;
  qty: number;
  stock: number;
  shippingCharges: number;
  size?: string;
  color?: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string, size?: string, color?: string) => void;
  updateQty: (id: string, qty: number, size?: string, color?: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalShipping: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType>({
  cartItems: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQty: () => {},
  clearCart: () => {},
  totalItems: 0,
  totalShipping: 0,
  totalPrice: 0,
});

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('wearixaCart');
      if (stored) setCartItems(JSON.parse(stored));
    }
  }, []);

  const saveToStorage = (items: CartItem[]) => {
    localStorage.setItem('wearixaCart', JSON.stringify(items));
  };

  const addToCart = (item: CartItem) => {
    setCartItems((prev) => {
      const existing = prev.find(
        (i) => i._id === item._id && i.size === item.size && i.color === item.color
      );
      let updated: CartItem[];
      if (existing) {
        updated = prev.map((i) =>
          i._id === item._id && i.size === item.size && i.color === item.color
            ? { ...i, qty: Math.min(i.qty + item.qty, i.stock) }
            : i
        );
      } else {
        updated = [...prev, item];
      }
      saveToStorage(updated);
      return updated;
    });
  };

  const removeFromCart = (id: string, size?: string, color?: string) => {
    setCartItems((prev) => {
      const updated = prev.filter((i) => !(i._id === id && i.size === size && i.color === color));
      saveToStorage(updated);
      return updated;
    });
  };

  const updateQty = (id: string, qty: number, size?: string, color?: string) => {
    setCartItems((prev) => {
      const updated = prev.map((i) => 
        (i._id === id && i.size === size && i.color === color ? { ...i, qty } : i)
      );
      saveToStorage(updated);
      return updated;
    });
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('wearixaCart');
  };

  const { user } = useAuth();

  const totalItems = cartItems.reduce((sum, i) => sum + i.qty, 0);
  
  const totalShipping = cartItems.reduce((sum, i) => {
    const userAddress = { 
      city: user?.city || '', 
      country: user?.country || '' 
    };
    // We need to pass the applyShippingCharges toggle as well
    const charge = calculateShippingCharge(userAddress, { 
      applyShippingCharges: (i as any).applyShippingCharges, 
      shippingCharges: i.shippingCharges 
    });
    return sum + (charge * i.qty);
  }, 0);

  const totalPrice = cartItems.reduce((sum, i) => sum + (i.price * i.qty), 0) + totalShipping;

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQty, clearCart, totalItems, totalShipping, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
