import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '@/types/product';
import { products as initialProducts } from '@/data/products';

interface ProductContextType {
    products: Product[];
    addProduct: (product: Product) => void;
    updateProduct: (productId: string, data: Partial<Product>) => void;
    deleteProduct: (productId: string) => void;
    getProduct: (productId: string) => Product | undefined;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

const STORAGE_KEY = 'shopvely_products';

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [products, setProducts] = useState<Product[]>([]);

    useEffect(() => {
        const storedProducts = localStorage.getItem(STORAGE_KEY);
        if (storedProducts) {
            try {
                setProducts(JSON.parse(storedProducts));
            } catch (error) {
                console.error('Failed to parse products:', error);
                setProducts(initialProducts);
            }
        } else {
            setProducts(initialProducts);
        }
    }, []);

    useEffect(() => {
        if (products.length > 0) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
        }
    }, [products]);

    const addProduct = (product: Product) => {
        setProducts(prev => [product, ...prev]);
    };

    const updateProduct = (productId: string, data: Partial<Product>) => {
        setProducts(prev => prev.map(p => p.id === productId ? { ...p, ...data } : p));
    };

    const deleteProduct = (productId: string) => {
        setProducts(prev => prev.filter(p => p.id !== productId));
    };

    const getProduct = (productId: string) => {
        return products.find(p => p.id === productId);
    };

    return (
        <ProductContext.Provider value={{ products, addProduct, updateProduct, deleteProduct, getProduct }}>
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
