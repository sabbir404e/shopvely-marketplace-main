import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, CartItem } from '@/types/product';
import { toast } from '@/hooks/use-toast';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number, size?: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  subtotal: number;
  discount: number;
  appliedCoupon: string | null;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('shopvely-cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [discount, setDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('shopvely-cart', JSON.stringify(items));
    // Reset discount if cart becomes empty
    if (items.length === 0) {
      setDiscount(0);
      setAppliedCoupon(null);
    }
  }, [items]);

  const addToCart = (product: Product, quantity = 1, size?: string) => {
    setItems(prev => {
      const existingIndex = prev.findIndex(
        item => item.product.id === product.id && item.selectedSize === size
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }

      return [...prev, { product, quantity, selectedSize: size }];
    });

    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const removeFromCart = (productId: string) => {
    setItems(prev => prev.filter(item => item.product.id !== productId));
    toast({
      title: "Removed from cart",
      description: "Item has been removed from your cart.",
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }

    setItems(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    setDiscount(0);
    setAppliedCoupon(null);
    toast({
      title: "Cart cleared",
      description: "All items have been removed from your cart.",
    });
  };

  const calculateSubtotal = () => items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const applyCoupon = (code: string): boolean => {
    if (!code) return false;

    // In a real app, this would be an API call. Here we check localStorage.
    const savedCoupons = localStorage.getItem('shopvely-coupons');
    const coupons = savedCoupons ? JSON.parse(savedCoupons) : [];

    const coupon = coupons.find((c: any) => c.code === code.toUpperCase() && c.isActive);

    if (!coupon) {
      toast({
        title: "Invalid Coupon",
        description: "This coupon code is invalid or expired.",
        variant: "destructive",
      });
      return false;
    }

    const today = new Date().toISOString().split('T')[0];
    if (coupon.expiryDate < today) {
      toast({
        title: "Expired Coupon",
        description: "This coupon code has expired.",
        variant: "destructive",
      });
      return false;
    }

    let discountAmount = 0;

    // Check if coupon is product specific
    if (coupon.productIds && coupon.productIds.length > 0) {
      // Calculate discount only on eligible items
      const eligibleItemsTotal = items.reduce((sum, item) => {
        // Convert product.id to string for comparison as logic in Tabs uses string '1' but product.id might be number 1? 
        // In types/product.ts id is string. In ProductsTab id is number (dummy data).
        // Safest is to compare loosely or convert to string.
        if (coupon.productIds.includes(String(item.product.id))) {
          return sum + (item.product.price * item.quantity);
        }
        return sum;
      }, 0);

      if (eligibleItemsTotal === 0) {
        toast({
          title: "Not Applicable",
          description: "This coupon is not applicable to any items in your cart.",
          variant: "destructive",
        });
        return false;
      }

      discountAmount = (eligibleItemsTotal * coupon.percentage) / 100;
    } else {
      // Global discount
      const subtotal = calculateSubtotal();
      discountAmount = (subtotal * coupon.percentage) / 100;
    }

    setDiscount(discountAmount);
    setAppliedCoupon(code.toUpperCase());

    toast({
      title: "Coupon Applied",
      description: `You saved ৳${discountAmount.toLocaleString()} (${coupon.percentage}%)!`,
    });
    return true;
  };

  const removeCoupon = () => {
    setDiscount(0);
    setAppliedCoupon(null);
    toast({
      title: "Coupon Removed",
      description: "Discount has been removed.",
    });
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = calculateSubtotal();
  const totalPrice = Math.max(0, subtotal - discount);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        subtotal,
        discount,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
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
