import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CreditCard, Truck, CheckCircle, ChevronLeft, Wallet, Banknote, Copy, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCart } from '@/context/CartContext';
import { useOrders } from '@/context/OrderContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type PaymentMethod = 'cod' | 'mobile' | 'card';

const Checkout: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { items, totalPrice, clearCart, subtotal, discount, applyCoupon, removeCoupon, appliedCoupon } = useCart();
  const { addOrder } = useOrders();
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [selectedCard, setSelectedCard] = useState<'visa' | 'mastercard'>('visa');
  const [selectedMobileService, setSelectedMobileService] = useState('bKash');
  const [couponCode, setCouponCode] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');

  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    village: '',
    postalCode: '',
  });

  const formatPrice = (price: number) => `৳${price.toLocaleString()}`;
  const shippingCost = totalPrice >= 5000 ? 0 : 100;
  const finalTotal = totalPrice + shippingCost;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShippingInfo(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!shippingInfo.name || !shippingInfo.phone || !shippingInfo.address || !shippingInfo.city || !shippingInfo.village || !shippingInfo.postalCode) {
      toast({
        title: "Error",
        description: t('checkout.fillShippingDetails'),
        variant: "destructive",
      });
      return;
    }

    if ((paymentMethod === 'mobile' || paymentMethod === 'card') && !transactionId) {
      toast({
        title: "Error",
        description: t('checkout.fillTransactionId'),
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    // Simulate order processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Clear transaction ID if payment method is not mobile or card (just in case)
    if (paymentMethod !== 'mobile' && paymentMethod !== 'card') {
      setTransactionId('');
    }

    // Create new order payload
    const orderPayload = {
      customer: shippingInfo.name,
      customerId: user?.id,
      total: finalTotal,
      items: items.map(item => ({
        id: item.product.id,
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
        selectedSize: item.selectedSize,
        productId: item.product.id // Ensure productId is passed
      })),
      shippingAddress: shippingInfo,
      paymentMethod: paymentMethod // Pass payment method
    };

    const createdOrderId = await addOrder(orderPayload);

    if (createdOrderId) {
      setOrderId(createdOrderId);
      setOrderPlaced(true);
      clearCart();
    }

    setIsProcessing(false);
  };

  if (items.length === 0 && !orderPlaced) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center px-4">
            <h1 className="text-2xl font-bold text-foreground mb-4">{t('checkout.emptyCart')}</h1>
            <p className="text-muted-foreground mb-6">{t('checkout.addItemsToCheckout')}</p>
            <Link to="/shop">
              <Button className="btn-primary">{t('common.continueShopping')}</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center px-4 max-w-md">
            <div className="w-20 h-20 mx-auto mb-6 bg-accent/20 rounded-full flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-accent" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">{t('checkout.orderPlacedSuccess')}</h1>
            <p className="text-muted-foreground mb-2">{t('checkout.thankYouPurchase')}</p>
            <p className="text-foreground font-medium mb-6">
              {t('checkout.orderId')}: <span className="text-primary">{orderId}</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/shop">
                <Button className="btn-primary">{t('common.continueShopping')}</Button>
              </Link>
              <Link to="/">
                <Button variant="outline">{t('common.backToHome')}</Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const paymentMethods = [
    { id: 'cod' as const, label: t('checkout.cashOnDelivery'), icon: Banknote, desc: t('checkout.payWhenReceive') },
    { id: 'mobile' as const, label: t('checkout.mobileBanking'), icon: Wallet, desc: 'bKash, Nagad, Rocket, Upay' },
    { id: 'card' as const, label: t('checkout.cardPayment'), icon: CreditCard, desc: 'Visa, Mastercard' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        <div className="container-main py-6 lg:py-8">
          <Link to="/cart" className="inline-flex items-center gap-1 text-primary hover:text-primary/80 mb-6">
            <ChevronLeft className="h-4 w-4" />
            {t('common.backToCart')}
          </Link>

          <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-6">{t('checkout.title')}</h1>

          <form onSubmit={handleSubmit}>
            <div className="lg:grid lg:grid-cols-3 lg:gap-8">
              {/* Left Column - Form */}
              <div className="lg:col-span-2 space-y-6 mb-6 lg:mb-0">
                {/* Shipping Info */}
                <div className="bg-card rounded-xl border border-border p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Truck className="h-5 w-5 text-primary" />
                    <h2 className="font-bold text-lg text-foreground">{t('checkout.shippingInfo')}</h2>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        {t('checkout.fullName')} <span className="text-destructive">*</span>
                      </label>
                      <Input
                        name="name"
                        value={shippingInfo.name}
                        onChange={handleInputChange}
                        placeholder={t('checkout.fullName')}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        {t('checkout.phoneNumber')} <span className="text-destructive">*</span>
                      </label>
                      <Input
                        name="phone"
                        value={shippingInfo.phone}
                        onChange={handleInputChange}
                        placeholder="01XXX-XXXXXX"
                        required
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-foreground mb-1">
                        {t('checkout.address')} <span className="text-destructive">*</span>
                      </label>
                      <Input
                        name="address"
                        value={shippingInfo.address}
                        onChange={handleInputChange}
                        placeholder={t('checkout.address')}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        {t('checkout.city')} <span className="text-destructive">*</span>
                      </label>
                      <Input
                        name="city"
                        value={shippingInfo.city}
                        onChange={handleInputChange}
                        placeholder={t('checkout.city')}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        {t('checkout.village')} <span className="text-destructive">*</span>
                      </label>
                      <Input
                        name="village"
                        value={shippingInfo.village}
                        onChange={handleInputChange}
                        placeholder={t('checkout.village')}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        {t('checkout.postalCode')} <span className="text-destructive">*</span>
                      </label>
                      <Input
                        name="postalCode"
                        value={shippingInfo.postalCode}
                        onChange={handleInputChange}
                        placeholder="1000"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="bg-card rounded-xl border border-border p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <h2 className="font-bold text-lg text-foreground">{t('checkout.paymentMethod')}</h2>
                  </div>

                  <div className="space-y-3">
                    {paymentMethods.map((method) => (
                      <label
                        key={method.id}
                        className={cn(
                          "flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-colors",
                          paymentMethod === method.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value={method.id}
                          checked={paymentMethod === method.id}
                          onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                          className="sr-only"
                        />
                        <div className={cn(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                          paymentMethod === method.id ? "border-primary" : "border-border"
                        )}>
                          {paymentMethod === method.id && (
                            <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                          )}
                        </div>
                        <method.icon className={cn(
                          "h-6 w-6",
                          paymentMethod === method.id ? "text-primary" : "text-muted-foreground"
                        )} />
                        <div>
                          <p className="font-medium text-foreground">{method.label}</p>
                          <p className="text-sm text-muted-foreground">{method.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>

                  {paymentMethod === 'mobile' && (
                    <div className="mt-4 p-4 bg-muted/50 rounded-lg space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {t('checkout.selectMobileBanking')}
                        </p>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {['bKash', 'Nagad', 'Rocket', 'Upay'].map((service) => (
                            <span
                              key={service}
                              className={cn(
                                "px-3 py-1.5 border rounded-lg text-sm cursor-pointer transition-colors",
                                selectedMobileService === service
                                  ? "bg-primary text-primary-foreground border-primary"
                                  : "bg-card border-border hover:border-primary"
                              )}
                              onClick={() => setSelectedMobileService(service)}
                            >
                              {service}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-foreground">
                            {t('checkout.sendMoneyTo')} <span className="text-primary font-bold">
                              {selectedMobileService === 'bKash' && '01797832574'}
                              {selectedMobileService === 'Nagad' && '01965308721'}
                              {selectedMobileService === 'Rocket' && '01720067890'}
                              {selectedMobileService === 'Upay' && '01722097094'}
                            </span>
                          </p>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => {
                              const number =
                                selectedMobileService === 'bKash' ? '01797832574' :
                                  selectedMobileService === 'Nagad' ? '01965308721' :
                                    selectedMobileService === 'Rocket' ? '01720067890' :
                                      '01722097094';

                              navigator.clipboard.writeText(number);
                              toast({
                                title: "Success",
                                description: t('checkout.numberCopied'),
                              });
                            }}
                            title={t('common.copy')}
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                          {t('checkout.transactionId')} <span className="text-destructive">*</span>
                        </label>
                        <Input
                          value={transactionId}
                          onChange={(e) => setTransactionId(e.target.value)}
                          placeholder={t('checkout.enterTransactionId')}
                          required
                        />
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'card' && (
                    <div className="mt-4 p-4 bg-muted/50 rounded-lg space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {t('checkout.selectCardType')}
                        </p>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {['Visa', 'Mastercard'].map((type) => (
                            <span
                              key={type}
                              className={cn(
                                "px-3 py-1.5 border rounded-lg text-sm cursor-pointer transition-colors",
                                selectedCard === type.toLowerCase()
                                  ? "bg-primary text-primary-foreground border-primary"
                                  : "bg-card border-border hover:border-primary"
                              )}
                              onClick={() => setSelectedCard(type.toLowerCase() as 'visa' | 'mastercard')}
                            >
                              {type}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-foreground">
                            {selectedCard === 'visa' ? 'Visa' : 'Mastercard'} {t('checkout.number')}: <span className="text-primary font-bold">{selectedCard === 'visa' ? '8765432567890982' : '1144678909054376'}</span>
                          </p>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => {
                              navigator.clipboard.writeText(selectedCard === 'visa' ? '8765432567890982' : '1144678909054376');
                              toast({
                                title: "Success",
                                description: t('checkout.numberCopied'),
                              });
                            }}
                            title={t('common.copy')}
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                          {t('checkout.transactionId')} <span className="text-destructive">*</span>
                        </label>
                        <Input
                          value={transactionId}
                          onChange={(e) => setTransactionId(e.target.value)}
                          placeholder={t('checkout.enterTransactionId')}
                          required
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-card rounded-xl border border-border p-6 sticky top-32">
                  <h2 className="font-bold text-lg text-foreground mb-4">{t('checkout.orderSummary')}</h2>

                  {/* Items */}
                  <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                    {items.map((item) => (
                      <div key={`${item.product.id}-${item.selectedSize}`} className="flex gap-3">
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground line-clamp-1">
                            {item.product.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {t('checkout.qty')}: {item.quantity}
                            {item.selectedSize && ` • ${t('common.size')}: ${item.selectedSize}`}
                          </p>
                        </div>
                        <span className="text-sm font-medium text-foreground">
                          {formatPrice(item.product.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-border pt-4 space-y-2 mb-4">
                    <div className="flex justify-between text-muted-foreground">
                      <span>{t('cart.subtotal')}</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount ({appliedCoupon})</span>
                        <div className="flex items-center gap-2">
                          <span>-{formatPrice(discount)}</span>
                          <button onClick={removeCoupon} className="text-destructive hover:text-destructive/80">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}
                    <div className="flex justify-between text-muted-foreground">
                      <span>{t('cart.shipping')}</span>
                      <span>{shippingCost === 0 ? t('common.free') : formatPrice(shippingCost)}</span>
                    </div>
                  </div>

                  <div className="mb-4 flex gap-2">
                    <Input
                      placeholder="Promo Code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="bg-background"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        if (applyCoupon(couponCode)) {
                          setCouponCode('');
                        }
                      }}
                    >
                      Apply
                    </Button>
                  </div>

                  <div className="border-t border-border pt-4 mb-6">
                    <div className="flex justify-between">
                      <span className="font-bold text-foreground">{t('cart.total')}</span>
                      <span className="font-bold text-xl text-primary">{formatPrice(finalTotal)}</span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full btn-primary"
                    size="lg"
                    disabled={isProcessing}
                  >
                    {isProcessing ? t('checkout.processing') : `${t('checkout.placeOrder')} • ${formatPrice(finalTotal)}`}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center mt-4">
                    {t('checkout.termsAgreement')}
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;