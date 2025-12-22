import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '@/types/product';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface WishlistContextType {
  items: Product[];
  addToWishlist: (product: Product) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  totalItems: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<Product[]>([]);

  // Load Wishlist
  useEffect(() => {
    const loadWishlist = async () => {
      if (user) {
        try {
          const { data: wishlistItems, error } = await (supabase as any)
            .from('wishlists')
            .select(`
                product:products (
                  id, name, base_price, discount_price, thumbnail_url, stock, category_id, description, status
                )
            `)
            .eq('user_id', user.id);

          if (error) throw error;

          if (wishlistItems) {
            const mappedItems: Product[] = wishlistItems.map((item: any) => ({
              id: item.product.id,
              name: item.product.name,
              price: item.product.discount_price || item.product.base_price,
              originalPrice: item.product.base_price,
              image: item.product.thumbnail_url,
              images: [item.product.thumbnail_url],
              category: 'Unknown',
              description: item.product.description,
              stock: item.product.stock,
              isNew: false,
              isFeatured: false,
            }));
            setItems(mappedItems);
          }
        } catch (error) {
          console.error("Failed to load wishlist", error);
        }
      } else {
        const saved = localStorage.getItem('shopvely-wishlist');
        if (saved) {
          setItems(JSON.parse(saved));
        } else {
          setItems([]);
        }
      }
    };
    loadWishlist();
  }, [user]);

  // Sync to local storage for guests
  useEffect(() => {
    if (!user) {
      localStorage.setItem('shopvely-wishlist', JSON.stringify(items));
    }
  }, [items, user]);

  const isInWishlist = (productId: string) => {
    return items.some(item => item.id === productId);
  };

  const addToWishlist = async (product: Product) => {
    if (!isInWishlist(product.id)) {
      setItems(prev => [...prev, product]);
      toast({
        title: "Added to wishlist",
        description: `${product.name} has been added to your wishlist.`,
      });

      if (user) {
        try {
          const { error } = await (supabase as any)
            .from('wishlists')
            .insert({
              user_id: user.id,
              product_id: product.id
            });
          if (error) throw error;
        } catch (error) {
          console.error("Failed to sync wishlist add", error);
        }
      }
    }
  };

  const removeFromWishlist = async (productId: string) => {
    setItems(prev => prev.filter(item => item.id !== productId));
    toast({
      title: "Removed from wishlist",
      description: "Item has been removed from your wishlist.",
    });

    if (user) {
      try {
        const { error } = await (supabase as any)
          .from('wishlists')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);
        if (error) throw error;
      } catch (error) {
        console.error("Failed to sync wishlist remove", error);
      }
    }
  };

  const totalItems = items.length;

  return (
    <WishlistContext.Provider
      value={{
        items,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        totalItems,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
