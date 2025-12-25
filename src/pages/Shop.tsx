import React, { useState, useMemo } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { Grid3X3, LayoutGrid } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/ui/ProductCard';
import { Button } from '@/components/ui/button';
import { useProducts } from '@/context/ProductContext';
import { categories } from '@/data/products';
import { cn } from '@/lib/utils';

const Shop: React.FC = () => {
  const { products } = useProducts();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [sortBy, setSortBy] = useState('popular');

  React.useEffect(() => {
    if (location.hash) {
      try {
        const element = document.querySelector(location.hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      } catch (e) {
        // Ignore invalid selectors
      }
    }
  }, [location]);
  const [gridCols, setGridCols] = useState<'grid-2' | 'grid-3'>('grid-3');

  const searchQuery = searchParams.get('search') || '';
  const categoryParam = searchParams.get('category') || '';

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search filter
    if (searchQuery) {
      result = result.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category from URL param
    if (categoryParam) {
      const matchedCategory = categories.find(c => c.slug === categoryParam);
      const categoryName = matchedCategory ? matchedCategory.name.toLowerCase() : categoryParam.toLowerCase();

      result = result.filter(p =>
        p.category.toLowerCase() === categoryName ||
        p.category.toLowerCase().replace(/\s+/g, '-') === categoryParam ||
        p.category.toLowerCase().replace(' ', '-') === categoryParam // legacy fallback
      );
    }

    // Sorting
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
      case 'popular':
      default:
        result.sort((a, b) => b.reviewCount - a.reviewCount);
    }
    return result;
  }, [products, searchQuery, categoryParam, sortBy]);

  const displayCategoryName = useMemo(() => {
    if (!categoryParam) return '';
    const matched = categories.find(c => c.slug === categoryParam);
    if (matched) return matched.name;
    if (categoryParam.toLowerCase() === 'beauty') return 'Beauty & Jewelry';
    return categoryParam.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }, [categoryParam]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        <div className="container-main py-6 lg:py-8">
          {/* Breadcrumb */}
          <div id="shop-hero" className="mb-6 scroll-mt-24">
            <nav className="text-sm text-muted-foreground">
              <span>Home</span> / <span className="text-foreground">Shop</span>
              {categoryParam && <> / <span className="text-foreground">{displayCategoryName}</span></>}
            </nav>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground mt-2">
              {searchQuery ? `Results for "${searchQuery}"` : (categoryParam ? displayCategoryName : 'All Products')}
            </h1>
            <p className="text-muted-foreground mt-1">{filteredProducts.length} products found</p>
          </div>

          {/* Toolbar */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
            <div className="flex items-center gap-4 ml-auto">
              {/* Sort */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground hidden sm:inline">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-border rounded-lg text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="popular">Popular</option>
                  <option value="newest">Newest</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>

              {/* Grid Toggle */}
              <div className="hidden sm:flex items-center gap-1 border border-border rounded-lg p-1">
                <button
                  onClick={() => setGridCols('grid-2')}
                  className={cn(
                    "p-1.5 rounded",
                    gridCols === 'grid-2' ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                  )}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setGridCols('grid-3')}
                  className={cn(
                    "p-1.5 rounded",
                    gridCols === 'grid-3' ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                  )}
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          {filteredProducts.length > 0 ? (
            <div className={cn(
              "grid gap-4 lg:gap-6",
              gridCols === 'grid-2' ? "grid-cols-2" : "grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            )}>
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <h3 className="text-xl font-semibold text-foreground mb-2">No products found</h3>
              <p className="text-muted-foreground mb-4">Try adjusting your search terms</p>
              <Button onClick={() => window.location.href = '/shop'} className="btn-primary">
                View All Products
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Shop;
