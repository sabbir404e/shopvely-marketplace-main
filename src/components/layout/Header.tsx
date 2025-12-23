import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Search, ShoppingCart, Heart, User, Menu, X, LogOut, Shield, ChevronDown,
  Smartphone, Shirt, Home, Sparkles, Dumbbell, BookOpen, Gift, LayoutGrid, Globe, Check, Baby
} from 'lucide-react';
import { categories as baseCategories } from '@/data/products';
import { useProducts } from '@/context/ProductContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSettings } from '@/context/SettingsContext';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { totalItems: cartItems } = useCart();
  const { totalItems: wishlistItems } = useWishlist();
  const { user, profile, isAdmin, signOut } = useAuth();
  const { products } = useProducts();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { settings } = useSettings();

  const currentLanguage = i18n.language;

  // Derive categories dynamically from products
  const categories = useMemo(() => {
    const categoryNames = [...new Set(products.map(p => p.category))];
    return categoryNames.map(name => {
      const base = baseCategories.find(c => c.name === name);
      const productCount = products.filter(p => p.category === name).length;
      return {
        id: base?.id || name.toLowerCase().replace(/\s+/g, '-'),
        name,
        slug: base?.slug || name.toLowerCase().replace(/\s+/g, '-'),
        image: base?.image || 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400',
        productCount
      };
    });
  }, [products]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const navLinks = [
    { name: t('common.home'), href: '/' },
    { name: t('common.shop'), href: '/shop' },
    { name: t('common.about'), href: '/about' },
    { name: t('common.contact'), href: '/contact' },
  ];

  const categoryIcons: Record<string, React.ReactNode> = {
    'electronics': <Smartphone className="h-4 w-4" />,
    'fashion': <Shirt className="h-4 w-4" />,
    'home-living': <Home className="h-4 w-4" />,
    'beauty-jewelry': <Sparkles className="h-4 w-4" />,
    'beauty': <Sparkles className="h-4 w-4" />,
    'sports': <Dumbbell className="h-4 w-4" />,
    'seasonal-products': <Gift className="h-4 w-4" />,
    'kids-item': <Baby className="h-4 w-4" />, // Fixed typo from 'kids-dtem'
  };

  // Helper to safely split store name
  const getStoreNameParts = () => {
    const name = settings.storeName || 'ShopVely';
    if (name.length < 4) return [name, ''];
    return [name.substring(0, 4), name.substring(4)];
  };

  const [storeNameFirst, storeNameSecond] = getStoreNameParts();

  return (
    <header className="sticky top-0 z-50 bg-header-bg border-b border-border shadow-sm">
      {/* Top Bar */}
      <div className="bg-header-bg text-white py-2">
        <div className="container-main flex items-center justify-between">
          <p className="text-xs hidden sm:block">
            🎉 {t('common.freeShipping')}
          </p>
          <div className="flex items-center gap-4 text-xs ml-auto">
            {!user && (
              <>
                <Link to="/auth" className="hover:text-white/80 transition-colors">
                  {t('common.login')}
                </Link>
                <span className="text-white/50">|</span>
                <Link to="/auth?mode=signup" className="hover:text-white/80 transition-colors">
                  {t('common.signUp')}
                </Link>
                <span className="text-white/50">|</span>
              </>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1 hover:text-white/80 transition-colors">
                  <Globe className="h-3.5 w-3.5" />
                  <span>{currentLanguage === 'bn' ? 'বাং' : 'EN'}</span>
                  <ChevronDown className="h-3 w-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[120px] bg-card">
                <DropdownMenuItem
                  className="cursor-pointer flex items-center justify-between"
                  onClick={() => changeLanguage('en')}
                >
                  English
                  {currentLanguage === 'en' && <Check className="h-4 w-4 text-primary" />}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer flex items-center justify-between"
                  onClick={() => changeLanguage('bn')}
                >
                  বাংলা
                  {currentLanguage === 'bn' && <Check className="h-4 w-4 text-primary" />}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container-main py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <h1 className="text-2xl sm:text-3xl font-extrabold">
              <span className="text-white">{storeNameFirst}</span>
              <span className="text-white/80">{storeNameSecond}</span>
            </h1>
          </Link>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <Input
                type="text"
                placeholder={t('common.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-12 py-3 rounded-full input-search"
              />
              <Button
                type="submit"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full h-9 w-9 btn-primary"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              to="/wishlist"
              className="relative p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              {wishlistItems > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center">
                  {wishlistItems}
                </span>
              )}
            </Link>

            <Link
              to="/cart"
              className="relative p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              {cartItems > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center">
                  {cartItems}
                </span>
              )}
            </Link>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="hidden sm:flex p-2 hover:bg-white/10 rounded-full transition-colors">
                    <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-card">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium truncate">{profile?.full_name || 'User'}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/account" className="cursor-pointer">
                      <User className="h-4 w-4 mr-2" />
                      {t('common.myAccount')}
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="cursor-pointer">
                        <Shield className="h-4 w-4 mr-2" />
                        {t('common.adminPanel')}
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/debug-auth" className="cursor-pointer text-blue-500">
                      <Shield className="h-4 w-4 mr-2" />
                      Debug Permissions
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    {t('common.signOut')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                to="/auth"
                className="hidden sm:flex p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <User className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </Link>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-white hover:bg-white/10"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Search Bar - Mobile */}
        <form onSubmit={handleSearch} className="md:hidden mt-4">
          <div className="relative w-full">
            <Input
              type="text"
              placeholder={t('common.searchMobile')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-12 py-2 rounded-full input-search"
            />
            <Button
              type="submit"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full h-8 w-8 btn-primary"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>

      {/* Navigation Bar - Desktop */}
      <nav className="hidden md:block bg-white/10 border-t border-white/20">
        <div className="container-main">
          <ul className="flex items-center gap-6 py-3">
            {/* Home Link */}
            <li>
              <Link
                to="/"
                className="text-sm font-medium text-white hover:text-white/80 transition-colors"
              >
                {t('common.home')}
              </Link>
            </li>

            {/* Shop Categories Dropdown */}
            <li className="relative group">
              <button className="flex items-center gap-1 text-sm font-medium text-white hover:text-white/80 transition-colors">
                {t('common.shopCategories')}
                <ChevronDown className="h-4 w-4 transition-transform group-hover:rotate-180" />
              </button>
              <div className="absolute left-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <ul className="bg-card border border-border rounded-lg shadow-lg py-2 min-w-[220px]">
                  {categories.map((category) => (
                    <li key={category.id}>
                      <Link
                        to={`/shop?category=${category.slug}`}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted hover:text-primary transition-colors"
                      >
                        <span className="text-muted-foreground">{categoryIcons[category.slug]}</span>
                        {t(`categories.${category.slug}`)}
                      </Link>
                    </li>
                  ))}
                  <li className="border-t border-border mt-2 pt-2">
                    <Link
                      to="/shop"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-primary hover:bg-muted transition-colors"
                    >
                      <LayoutGrid className="h-4 w-4" />
                      {t('common.viewAllProducts')}
                    </Link>
                  </li>
                </ul>
              </div>
            </li>

            {/* Other Links */}
            <li>
              <Link
                to="/about"
                className="text-sm font-medium text-white hover:text-white/80 transition-colors"
              >
                {t('common.about')}
              </Link>
            </li>
            <li>
              <Link
                to="/contact"
                className="text-sm font-medium text-white hover:text-white/80 transition-colors"
              >
                {t('common.contact')}
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={cn(
          "md:hidden absolute left-0 right-0 top-full bg-card border-b border-border shadow-lg transition-all duration-300",
          isMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
        )}
      >
        <nav className="container-main py-4">
          <ul className="space-y-2">
            {navLinks.map((link) => (
              <li key={link.name}>
                <Link
                  to={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="block py-2 px-4 text-foreground hover:bg-muted rounded-lg transition-colors"
                >
                  {link.name}
                </Link>
              </li>
            ))}
            {user ? (
              <>
                <li>
                  <Link
                    to="/account"
                    onClick={() => setIsMenuOpen(false)}
                    className="block py-2 px-4 text-foreground hover:bg-muted rounded-lg transition-colors"
                  >
                    {t('common.myAccount')}
                  </Link>
                </li>
                {isAdmin && (
                  <li>
                    <Link
                      to="/admin"
                      onClick={() => setIsMenuOpen(false)}
                      className="block py-2 px-4 text-foreground hover:bg-muted rounded-lg transition-colors"
                    >
                      {t('common.adminPanel')}
                    </Link>
                  </li>
                )}
                <li>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left py-2 px-4 text-destructive hover:bg-muted rounded-lg transition-colors"
                  >
                    {t('common.signOut')}
                  </button>
                </li>
              </>
            ) : (
              <li>
                <Link
                  to="/auth"
                  onClick={() => setIsMenuOpen(false)}
                  className="block py-2 px-4 text-foreground hover:bg-muted rounded-lg transition-colors"
                >
                  {t('common.login')} / {t('common.signUp')}
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
