import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';

const Wishlist: React.FC = () => {
  const { t } = useTranslation();
  const { items, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const formatPrice = (price: number) => `৳${price.toLocaleString()}`;

  const handleAddToCart = (product: typeof items[0]) => {
    addToCart(product, 1);
    removeFromWishlist(product.id);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center px-4">
            <div className="w-24 h-24 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
              <Heart className="h-12 w-12 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">{t('wishlist.empty')}</h1>
            <p className="text-muted-foreground mb-6">
              {t('wishlist.emptyMessage')}
            </p>
            <Link to="/shop">
              <Button className="btn-primary">{t('common.exploreProducts')}</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        <div className="container-main py-6 lg:py-8">
          <div className="mb-6">
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">{t('wishlist.title')}</h1>
            <p className="text-muted-foreground">{items.length} {t('common.itemsSaved')}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
            {items.map((product) => (
              <div key={product.id} className="bg-card rounded-xl border border-border overflow-hidden group">
                {/* Image */}
                <Link to={`/product/${product.id}`} className="block aspect-square overflow-hidden">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </Link>

                {/* Content */}
                <div className="p-4">
                  <Link 
                    to={`/product/${product.id}`}
                    className="font-semibold text-foreground hover:text-primary line-clamp-2 mb-2"
                  >
                    {product.name}
                  </Link>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <span className="font-bold text-primary">{formatPrice(product.price)}</span>
                    {product.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleAddToCart(product)}
                      className="flex-1 btn-primary gap-2" 
                      size="sm"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      {t('product.addToCart')}
                    </Button>
                    <Button
                      onClick={() => removeFromWishlist(product.id)}
                      variant="outline"
                      size="sm"
                      className="text-destructive border-destructive/30 hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Wishlist;