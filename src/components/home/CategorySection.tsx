import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { categories as baseCategories } from '@/data/products';
import { useProducts } from '@/context/ProductContext';

const CategorySection: React.FC = () => {
  const { t } = useTranslation();
  const { products } = useProducts();

  // Derive categories dynamically from products
  const categories = useMemo(() => {
    const categoryNames = [...new Set(products.map(p => p.category))];
    const derivedCategories = categoryNames
      .filter(name => name !== 'Other' && name !== 'Uncategorized')
      .map(name => {
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

    // Add "All Products" card at the beginning
    const allProductsCard = {
      id: 'all-products',
      name: 'All Products',
      slug: 'all-products',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600', // Realistic store interior
      productCount: products.length
    };

    return [allProductsCard, ...derivedCategories];
  }, [products]);

  return (
    <section className="py-12 lg:py-16 bg-background">
      <div className="container-main">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('hero.shopByCategory')}</h2>
          </div>
          <Link
            to="/shop"
            className="hidden sm:flex items-center gap-1 text-primary hover:text-primary/80 font-medium transition-colors"
          >
            {t('common.viewAll')} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category, index) => (
            <Link
              key={category.id}
              to={category.slug === 'all-products' ? '/shop' : `/shop?category=${category.slug}`}
              className="group relative overflow-hidden rounded-xl aspect-square animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Background Image */}
              <img
                src={category.image}
                alt={t(`categories.${category.slug}`)}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/40 to-transparent" />

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="font-bold text-card text-lg">
                  {category.slug === 'all-products' ? t('hero.allProducts') : t(`categories.${category.slug}`)}
                </h3>
                <p className="text-card/70 text-sm">{category.productCount} {t('product.units')}</p>
              </div>

              {/* Hover Effect */}
              <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
          ))}
        </div>

        {/* Mobile View All */}
        <Link
          to="/shop"
          className="sm:hidden flex items-center justify-center gap-1 text-primary hover:text-primary/80 font-medium mt-6 transition-colors"
        >
          {t('home.viewAllCategories')} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
};

export default CategorySection;
