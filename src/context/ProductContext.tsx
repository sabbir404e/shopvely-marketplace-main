import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '@/types/product';
import { products as initialProducts, categories as initialCategories } from '@/data/products';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface ProductContextType {
    products: Product[];
    isLoading: boolean;
    addProduct: (product: Product) => Promise<void>;
    updateProduct: (productId: string, data: Partial<Product>) => Promise<void>;
    deleteProduct: (productId: string) => Promise<void>;
    getProduct: (productId: string) => Product | undefined;
    seedDatabase: () => Promise<void>;
    refreshProducts: () => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchProducts = async () => {
        try {
            setIsLoading(true);
            const { data, error } = await (supabase as any)
                .from('products')
                .select(`
                    *,
                    category:categories(name)
                `);

            if (error) throw error;

            if (data) {
                const mappedProducts: Product[] = data.map((p: any) => ({
                    id: p.id,
                    name: p.name,
                    description: p.description || '',
                    price: p.discount_price || p.base_price,
                    originalPrice: p.base_price,
                    discount: p.base_price > (p.discount_price || p.base_price)
                        ? Math.round(((p.base_price - (p.discount_price || p.base_price)) / p.base_price) * 100)
                        : 0,
                    images: p.gallery_urls || (p.thumbnail_url ? [p.thumbnail_url] : []),
                    category: p.category?.name || 'Uncategorized',
                    brand: p.brand || '',
                    rating: 0, // Todo: Aggregate from reviews
                    reviewCount: 0, // Todo: Aggregate from reviews
                    stock: p.stock,
                    isNew: p.is_new,
                    isFeatured: p.is_featured,
                    sizes: p.sizes || []
                }));
                setProducts(mappedProducts);
            }
        } catch (error) {
            console.error('Failed to fetch products:', error);
            toast({
                title: "Error fetching products",
                description: "Could not load products from database.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const refreshProducts = async () => {
        await fetchProducts();
    };

    const addProduct = async (product: Product) => {
        console.warn("Direct addProduct not implemented fully. Use seed or Admin panel.");
    };

    const updateProduct = async (productId: string, data: Partial<Product>) => {
        console.warn("Direct updateProduct not implemented fully.");
    };

    const deleteProduct = async (productId: string) => {
        console.warn("Direct deleteProduct not implemented fully.");
    };

    const getProduct = (productId: string) => {
        return products.find(p => p.id === productId);
    };

    const seedDatabase = async () => {
        try {
            setIsLoading(true);
            toast({ title: "Seeding Database...", description: "Please wait." });

            // 1. Seed Categories
            const categoryMap = new Map<string, string>(); // slug -> uuid

            for (const cat of initialCategories) {
                const { data: existing } = await (supabase as any).from('categories').select('id').eq('slug', cat.slug).single();

                if (existing) {
                    categoryMap.set(cat.slug, existing.id);
                } else {
                    const { data: newCat, error } = await (supabase as any).from('categories').insert({
                        name: cat.name,
                        slug: cat.slug,
                        image_url: cat.image,
                        description: `Products for ${cat.name}`
                    }).select('id').single();

                    if (error) throw error;
                    if (newCat) categoryMap.set(cat.slug, newCat.id);
                }
            }

            // 2. Seed Products
            for (const p of initialProducts) {
                const catSlug = initialCategories.find(c => c.name === p.category)?.slug;
                const categoryId = catSlug ? categoryMap.get(catSlug) : null;

                const dbProduct = {
                    name: p.name,
                    slug: p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                    description: p.description,
                    base_price: p.originalPrice || p.price,
                    discount_price: p.price < (p.originalPrice || p.price) ? p.price : null,
                    stock: p.stock,
                    status: 'published',
                    category_id: categoryId,
                    thumbnail_url: p.images[0],
                    gallery_urls: p.images,
                    is_new: p.isNew || false,
                    is_featured: p.isFeatured || false,
                    brand: p.brand,
                    sizes: p.sizes
                };

                const { data: existing } = await (supabase as any).from('products').select('id').eq('slug', dbProduct.slug).single();

                if (!existing) {
                    const { error } = await (supabase as any).from('products').insert(dbProduct);
                    if (error) {
                        console.error(`Failed to insert ${p.name}:`, error);
                    }
                }
            }

            toast({ title: "Seeding Complete", description: "Database populated successfully." });
            await fetchProducts();

        } catch (error: any) {
            console.error('Seeding failed:', error);
            toast({
                title: "Seeding Failed",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ProductContext.Provider value={{
            products,
            isLoading,
            addProduct,
            updateProduct,
            deleteProduct,
            getProduct,
            seedDatabase,
            refreshProducts
        }}>
            {children}
        </ProductContext.Provider>
    );
};

export const useProducts = () => {
    const context = useContext(ProductContext);
    if (context === undefined) {
        throw new Error('useProducts must be used within a ProductProvider');
    }
    return context;
};
