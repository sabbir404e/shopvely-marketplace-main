import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, ShoppingCart, Minus, Plus, Star, Truck, Shield, RotateCcw, ChevronLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/ui/ProductCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useProducts } from '@/context/ProductContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useReviews } from '@/context/ReviewContext';
import { useAuth } from '@/context/AuthContext';
import ReviewList from '@/components/product/ReviewList';
import ReviewForm from '@/components/product/ReviewForm';
import { cn } from '@/lib/utils';

const ProductDetail: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { products, getProduct } = useProducts();
  const product = getProduct(id || '');
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { getProductStats, getUserReview } = useReviews();
  const { user } = useAuth();

  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    product?.sizes?.[0]
  );
  const [activeImage, setActiveImage] = useState(0);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">{t('product.productNotFound')}</h1>
            <Link to="/shop">
              <Button className="btn-primary">{t('common.backToShop')}</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const inWishlist = isInWishlist(product.id);
  const relatedProducts = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  // Get review stats and user's review
  const reviewStats = getProductStats(product.id);
  const userReview = user ? getUserReview(product.id, user.id) : undefined;

  const formatPrice = (price: number) => `৳${price.toLocaleString()}`;

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedSize);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, selectedSize);
    window.location.href = '/cart';
  };

  const handleWishlist = () => {
    if (inWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };



  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        <div className="container-main py-6 lg:py-8">
          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary">{t('common.home')}</Link>
            <span>/</span>
            <Link to="/shop" className="hover:text-primary">{t('common.shop')}</Link>
            <span>/</span>
            <Link to={`/shop?category=${product.category.toLowerCase()}`} className="hover:text-primary">{product.category}</Link>
            <span>/</span>
            <span className="text-foreground">{product.name}</span>
          </nav>

          <Link to="/shop" className="inline-flex items-center gap-1 text-primary hover:text-primary/80 mb-4 lg:hidden">
            <ChevronLeft className="h-4 w-4" />
            {t('common.backToShop')}
          </Link>

          {/* Product Section */}
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 mb-12">
            {/* Images */}
            <div className="space-y-4">
              <div className="aspect-square overflow-hidden rounded-2xl bg-muted">
                <img
                  src={product.images[activeImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {product.images.length > 1 && (
                <div className="flex gap-2">
                  {product.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={cn(
                        "w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors",
                        activeImage === i ? "border-primary" : "border-border"
                      )}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div>
              {/* Badges */}
              <div className="flex gap-2 mb-3">
                {product.isNew && <span className="badge-new">{t('product.new')}</span>}
                {product.discount && <span className="badge-sale">-{product.discount}%</span>}
              </div>

              {/* Brand & Category */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <span>{product.category}</span>
                {product.brand && (
                  <>
                    <span>•</span>
                    <span className="text-primary font-medium">{product.brand}</span>
                  </>
                )}
              </div>

              {/* Title */}
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-3">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-5 w-5",
                        i < Math.floor(reviewStats.averageRating || product.rating)
                          ? "text-gold fill-gold"
                          : "text-muted-foreground"
                      )}
                    />
                  ))}
                </div>
                <span className="text-foreground font-medium">
                  {reviewStats.averageRating > 0 ? reviewStats.averageRating : product.rating}
                </span>
                <span className="text-muted-foreground">
                  ({reviewStats.totalReviews > 0 ? reviewStats.totalReviews : product.reviewCount.toLocaleString()} {t('product.reviews')})
                </span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-3xl lg:text-4xl font-bold text-primary">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && (
                  <span className="text-xl text-muted-foreground line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-muted-foreground mb-6">
                {product.description}
              </p>

              {/* Size Selector */}
              {product.sizes && (
                <div className="mb-6">
                  <h4 className="font-semibold text-foreground mb-3">{t('common.size')}</h4>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map(size => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={cn(
                          "px-4 py-2 border rounded-lg font-medium transition-colors",
                          selectedSize === size
                            ? "bg-primary text-primary-foreground border-primary"
                            : "border-border text-foreground hover:border-primary"
                        )}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="mb-6">
                <h4 className="font-semibold text-foreground mb-3">{t('product.quantity')}</h4>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-border rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-3 hover:bg-muted transition-colors"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="px-4 font-semibold text-foreground">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="p-3 hover:bg-muted transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {product.stock} {t('common.itemsAvailable')}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <Button onClick={handleAddToCart} className="flex-1 btn-primary gap-2" size="lg">
                  <ShoppingCart className="h-5 w-5" />
                  {t('product.addToCart')}
                </Button>
                <Button onClick={handleBuyNow} variant="outline" className="flex-1 border-primary text-primary hover:bg-primary hover:text-primary-foreground" size="lg">
                  {t('product.buyNow')}
                </Button>
                <Button
                  onClick={handleWishlist}
                  variant="outline"
                  size="lg"
                  className={cn(
                    "px-4",
                    inWishlist && "bg-primary/10 border-primary text-primary"
                  )}
                >
                  <Heart className={cn("h-5 w-5", inWishlist && "fill-current")} />
                </Button>
              </div>

              {/* Features */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-xl">
                <div className="text-center">
                  <Truck className="h-6 w-6 mx-auto text-primary mb-1" />
                  <span className="text-xs text-muted-foreground">{t('product.freeShipping')}</span>
                </div>
                <div className="text-center">
                  <Shield className="h-6 w-6 mx-auto text-primary mb-1" />
                  <span className="text-xs text-muted-foreground">{t('product.securePayment')}</span>
                </div>
                <div className="text-center">
                  <RotateCcw className="h-6 w-6 mx-auto text-primary mb-1" />
                  <span className="text-xs text-muted-foreground">{t('product.easyReturns')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="description" className="mb-12">
            <TabsList className="w-full justify-start border-b border-border rounded-none bg-transparent p-0 mb-6">
              <TabsTrigger value="description" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
                {t('product.description')}
              </TabsTrigger>
              <TabsTrigger value="specifications" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
                {t('product.specifications')}
              </TabsTrigger>
              <TabsTrigger value="reviews" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
                {t('product.reviews')} ({reviewStats.totalReviews > 0 ? reviewStats.totalReviews : product.reviewCount})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="text-muted-foreground">
              <p>{product.description}</p>
              <p className="mt-4">
                Experience premium quality with this exceptional product from {product.brand || 'ShopVely'}.
                Crafted with attention to detail and designed to exceed your expectations.
              </p>
            </TabsContent>
            <TabsContent value="specifications">
              <dl className="space-y-3">
                <div className="flex gap-4">
                  <dt className="text-muted-foreground w-32">{t('product.category')}</dt>
                  <dd className="text-foreground">{product.category}</dd>
                </div>
                {product.brand && (
                  <div className="flex gap-4">
                    <dt className="text-muted-foreground w-32">{t('product.brand')}</dt>
                    <dd className="text-foreground">{product.brand}</dd>
                  </div>
                )}
                {product.sizes && (
                  <div className="flex gap-4">
                    <dt className="text-muted-foreground w-32">{t('product.availableSizes')}</dt>
                    <dd className="text-foreground">{product.sizes.join(', ')}</dd>
                  </div>
                )}
                <div className="flex gap-4">
                  <dt className="text-muted-foreground w-32">{t('product.stock')}</dt>
                  <dd className="text-foreground">{product.stock} {t('product.units')}</dd>
                </div>
              </dl>
            </TabsContent>
            <TabsContent value="reviews">
              <div className="space-y-6">
                {/* Review List */}
                <ReviewList productId={product.id} />

                {/* Review Form */}
                <div className="pt-6 border-t border-border">
                  {userReview ? (
                    <div className="bg-muted/30 rounded-lg p-4 mb-4">
                      <p className="text-sm text-muted-foreground">
                        {t('review.alreadyReviewed')}
                      </p>
                    </div>
                  ) : (
                    <ReviewForm productId={product.id} />
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">{t('product.relatedProducts')}</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                {relatedProducts.map(p => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;