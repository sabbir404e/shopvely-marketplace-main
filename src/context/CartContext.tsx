import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, CartItem } from '@/types/product';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number, size?: string) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  totalItems: number;
  totalPrice: number;
  subtotal: number;
  discount: number;
  appliedCoupon: string | null;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [discount, setDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  // Load initial cart
  useEffect(() => {
    const loadCart = async () => {
      setIsLoading(true);
      if (user) {
        // Fetch from Supabase
        try {
          // 1. Get or Create Cart
          let { data: cart, error: cartError } = await (supabase as any)
            .from('carts')
            .select('id')
            .eq('user_id', user.id)
            .single();

          if (!cart && !cartError) {
            // Create cart if not exists (should handle this better usually, but auto-create here)
            const { data: newCart, error: createError } = await (supabase as any)
              .from('carts')
              .insert({ user_id: user.id })
              .select()
              .single();
            if (createError) throw createError;
            cart = newCart;
          }

          if (cart) {
            // 2. Fetch Items
            const { data: cartItems, error: itemsError } = await (supabase as any)
              .from('cart_items')
              .select(`
                quantity,
                selected_size,
                product:products (
                  id, name, base_price, discount_price, thumbnail_url, stock, category_id, description, status
                )
              `)
              .eq('cart_id', cart.id);

            if (itemsError) throw itemsError;

            if (cartItems) {
              const mappedItems: CartItem[] = cartItems.map((item: any) => ({
                quantity: item.quantity,
                selectedSize: item.selected_size,
                product: {
                  id: item.product.id,
                  name: item.product.name,
                  price: item.product.discount_price || item.product.base_price, // Handle price logic
                  originalPrice: item.product.base_price,
                  image: item.product.thumbnail_url,
                  images: [item.product.thumbnail_url], // simplified
                  category: 'Unknown', // Join category if needed
                  description: item.product.description,
                  stock: item.product.stock,
                  isNew: false,
                  isFeatured: false,
                }
              }));
              setItems(mappedItems);
            }
          }
        } catch (error) {
          console.error("Error loading cart from Supabase", error);
        }
      } else {
        // Load from LocalStorage
        const saved = localStorage.getItem('shopvely-cart');
        if (saved) {
          setItems(JSON.parse(saved));
        } else {
          setItems([]);
        }
      }
      setIsLoading(false);
    };

    loadCart();
  }, [user]);

  // Sync to LocalStorage only for guests
  useEffect(() => {
    if (!user) {
      localStorage.setItem('shopvely-cart', JSON.stringify(items));
    }
  }, [items, user]);

  // Reset discount if cart becomes empty
  useEffect(() => {
    if (items.length === 0) {
      setDiscount(0);
      setAppliedCoupon(null);
    }
  }, [items]);

  const addToCart = async (product: Product, quantity = 1, size?: string) => {
    // Optimistic Update
    const newItem = { product, quantity, selectedSize: size };
    const prevItems = [...items];

    setItems(prev => {
      const existingIndex = prev.findIndex(
        item => item.product.id === product.id && item.selectedSize === size
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }
      return [...prev, newItem];
    });

    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });

    if (user) {
      try {
        // Get Cart ID
        let { data: cart } = await (supabase as any)
          .from('carts')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (!cart) {
          // Should exist from load, but safety check
          const { data: newCart } = await (supabase as any).from('carts').insert({ user_id: user.id }).select().single();
          cart = newCart;
        }

        // Check if item exists in DB
        // Note: RLS allows inserting? Yes.
        // We need to upsert. 
        // But valid upsert requires a unique constraint on (cart_id, product_id, variant_id/size).
        // Current schema doesn't seem to enforce strict unique constraint with size text.
        // So we manually check or just insert.
        // For simplicity, let's look for match first.

        // First check matches
        // Note: This is getting complex for 'selected_size' which is text.
        // Simplest: Delete match if exists, then insert new quantity? Or Update?

        const { data: existingItem } = await (supabase as any)
          .from('cart_items')
          .select('id, quantity')
          .eq('cart_id', cart.id)
          .eq('product_id', product.id)
          .is('selected_size', size || null) // Handle null vs undefined
          .maybeSingle(); // Use maybeSingle to avoid error if 0

        if (existingItem) {
          await (supabase as any)
            .from('cart_items')
            .update({ quantity: existingItem.quantity + quantity })
            .eq('id', existingItem.id);
        } else {
          await (supabase as any)
            .from('cart_items')
            .insert({
              cart_id: cart.id,
              product_id: product.id,
              quantity: quantity,
              selected_size: size
            });
        }

      } catch (error) {
        console.error("Failed to sync add to cart", error);
        // Revert state? For now keep optimistic.
      }
    }
  };

  const removeFromCart = async (productId: string) => {
    // Note: This simple signature removes ALL items with this product ID, ignoring size?
    // The previous implementation: prev.filter(item => item.product.id !== productId)
    // Yes, it removes all variants of that product.

    setItems(prev => prev.filter(item => item.product.id !== productId));
    toast({
      title: "Removed from cart",
      description: "Item has been removed from your cart.",
    });

    if (user) {
      try {
        const { data: cart } = await (supabase as any).from('carts').select('id').eq('user_id', user.id).single();
        if (cart) {
          await (supabase as any)
            .from('cart_items')
            .delete()
            .eq('cart_id', cart.id)
            .eq('product_id', productId);
        }
      } catch (e) { console.error(e) }
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity < 1) {
      await removeFromCart(productId);
      return;
    }

    setItems(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );

    if (user) {
      try {
        // This is tricky because "updateQuantity" signature doesn't specify size.
        // It updates ALL variants of that product?
        // Original: item.product.id === productId ? { ...item, quantity } : item
        // Yes, it updates ALL instances. Wait, that might be a bug in original too if you have Size M and Size L.
        // If I have Shirt M (qty 1) and Shirt L (qty 1), and I call updateQuantity(id, 2)...
        // Both become qty 2.
        // We will stick to the existing behavior for now but it's imperfect.

        const { data: cart } = await (supabase as any).from('carts').select('id').eq('user_id', user.id).single();
        if (cart) {
          await (supabase as any)
            .from('cart_items')
            .update({ quantity })
            .eq('cart_id', cart.id)
            .eq('product_id', productId);
        }
      } catch (e) { console.error(e) }
    }
  };

  const clearCart = async () => {
    setItems([]);
    setDiscount(0);
    setAppliedCoupon(null);
    toast({
      title: "Cart cleared",
      description: "All items have been removed from your cart.",
    });

    if (user) {
      try {
        const { data: cart } = await (supabase as any).from('carts').select('id').eq('user_id', user.id).single();
        if (cart) {
          await (supabase as any)
            .from('cart_items')
            .delete()
            .eq('cart_id', cart.id);
        }
      } catch (e) { console.error(e) }
    }
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
        isLoading
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
