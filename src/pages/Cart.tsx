import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';

const Cart: React.FC = () => {
  const { t } = useTranslation();
  const { items, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();

  const formatPrice = (price: number) => `৳${price.toLocaleString()}`;
  const shippingCost = totalPrice >= 5000 ? 0 : 100;
  const finalTotal = totalPrice + shippingCost;

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center px-4">
            <div className="w-24 h-24 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
              <ShoppingBag className="h-12 w-12 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">{t('cart.empty')}</h1>
            <p className="text-muted-foreground mb-6">
              {t('cart.emptyMessage')}
            </p>
            <Link to="/shop">
              <Button className="btn-primary gap-2">
                {t('common.startShopping')}
                <ArrowRight className="h-4 w-4" />
              </Button>
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
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground">{t('cart.title')}</h1>
              <p className="text-muted-foreground">{items.length} {t('common.itemsInCart')}</p>
            </div>
            <Button variant="ghost" onClick={clearCart} className="text-destructive hover:text-destructive/80">
              {t('cart.clearCart')}
            </Button>
          </div>

          <div className="lg:grid lg:grid-cols-3 lg:gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4 mb-6 lg:mb-0">
              {items.map((item) => (
                <div 
                  key={`${item.product.id}-${item.selectedSize}`} 
                  className="flex gap-4 p-4 bg-card rounded-xl border border-border"
                >
                  {/* Image */}
                  <Link to={`/product/${item.product.id}`} className="flex-shrink-0">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  </Link>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <Link 
                      to={`/product/${item.product.id}`}
                      className="font-semibold text-foreground hover:text-primary line-clamp-2"
                    >
                      {item.product.name}
                    </Link>
                    <div className="text-sm text-muted-foreground mt-1">
                      {item.product.brand && <span>{item.product.brand}</span>}
                      {item.selectedSize && <span className="ml-2">{t('common.size')}: {item.selectedSize}</span>}
                    </div>
                    
                    {/* Mobile Price */}
                    <div className="lg:hidden mt-2">
                      <span className="font-bold text-primary">{formatPrice(item.product.price)}</span>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center border border-border rounded-lg">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="p-2 hover:bg-muted transition-colors"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="px-3 text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="p-2 hover:bg-muted transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Desktop Price */}
                  <div className="hidden lg:block text-right">
                    <span className="font-bold text-primary text-lg">
                      {formatPrice(item.product.price * item.quantity)}
                    </span>
                    {item.quantity > 1 && (
                      <p className="text-sm text-muted-foreground">
                        {formatPrice(item.product.price)} {t('common.each')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-xl border border-border p-6 sticky top-32">
                <h2 className="font-bold text-lg text-foreground mb-4">{t('cart.orderSummary')}</h2>
                
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-muted-foreground">
                    <span>{t('cart.subtotal')}</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>{t('cart.shipping')}</span>
                    <span>{shippingCost === 0 ? t('common.free') : formatPrice(shippingCost)}</span>
                  </div>
                  {shippingCost > 0 && (
                    <p className="text-xs text-accent">
                      {t('cart.addMoreForFreeShipping', { amount: formatPrice(5000 - totalPrice) })}
                    </p>
                  )}
                </div>

                <div className="border-t border-border pt-4 mb-6">
                  <div className="flex justify-between">
                    <span className="font-bold text-foreground">{t('cart.total')}</span>
                    <span className="font-bold text-xl text-primary">{formatPrice(finalTotal)}</span>
                  </div>
                </div>

                <Link to="/checkout" className="block">
                  <Button className="w-full btn-primary gap-2" size="lg">
                    {t('cart.checkout')}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>

                <Link to="/shop" className="block mt-3">
                  <Button variant="outline" className="w-full">
                    {t('common.continueShopping')}
                  </Button>
                </Link>

                {/* Trust Badges */}
                <div className="mt-6 pt-6 border-t border-border">
                  <p className="text-xs text-muted-foreground text-center mb-3">
                    {t('cart.secureCheckout')}
                  </p>
                  <div className="flex justify-center gap-2">
                    {['Visa', 'Mastercard', 'bKash'].map((method) => (
                      <span
                        key={method}
                        className="px-2 py-1 bg-muted rounded text-xs font-medium text-muted-foreground"
                      >
                        {method}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Cart;