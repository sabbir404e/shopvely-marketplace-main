import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, TrendingUp } from 'lucide-react';
import ProductCard from '@/components/ui/ProductCard';
import { useProducts } from '@/context/ProductContext';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

const FeaturedProducts: React.FC = () => {
  const { t } = useTranslation();
  const { products } = useProducts();

  const featuredProducts = useMemo(() =>
    products.filter(p => p.isFeatured).slice(0, 4), [products]);
  const newProducts = useMemo(() =>
    products.filter(p => p.isNew).slice(0, 4), [products]);

  return (
    <section className="py-12 lg:py-16 bg-muted/30">
      <div className="container-main">

        {/* Featured Products */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('hero.topDeals')}</h2>
              </div>
            </div>
            <Link
              to="/shop?featured=true"
              className="hidden sm:flex items-center gap-1 text-primary hover:text-primary/80 font-medium transition-colors"
            >
              {t('common.viewAll')} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {featuredProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                className="animate-fade-in"
              />
            ))}
          </div>
        </div>

        {/* New Arrivals */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Sparkles className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('hero.newArrivals')}</h2>
              </div>
            </div>
            <Link
              to="/shop?new=true"
              className="hidden sm:flex items-center gap-1 text-primary hover:text-primary/80 font-medium transition-colors"
            >
              {t('common.viewAll')} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {newProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                className="animate-fade-in"
              />
            ))}
          </div>

          {/* Mobile View All */}
          <div className="sm:hidden flex justify-center mt-6">
            <Link to="/shop">
              <Button variant="outline" className="gap-2">
                {t('common.viewAllProducts')} <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>


        {/* All Products */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/10 rounded-lg">
                <Sparkles className="h-5 w-5 text-indigo-500" />
              </div>
              <div>
                <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('hero.allProducts')}</h2>
              </div>
            </div>
            <Link
              to="/shop"
              className="hidden sm:flex items-center gap-1 text-primary hover:text-primary/80 font-medium transition-colors"
            >
              {t('common.viewAll')} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {products.slice(0, 8).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                className="animate-fade-in"
              />
            ))}
          </div>

          {/* Mobile View All */}
          <div className="sm:hidden flex justify-center mt-6">
            <Link to="/shop">
              <Button variant="outline" className="gap-2">
                {t('common.viewAllProducts')} <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section >
  );
};

export default FeaturedProducts;
