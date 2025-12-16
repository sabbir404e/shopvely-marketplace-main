export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  images: string[];
  category: string;
  brand?: string;
  rating: number;
  reviewCount: number;
  sizes?: string[];
  stock: number;
  isNew?: boolean;
  isFeatured?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  productCount: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
}

export interface FilterOptions {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sizes?: string[];
  rating?: number;
  sortBy?: 'newest' | 'price-asc' | 'price-desc' | 'popular';
}
