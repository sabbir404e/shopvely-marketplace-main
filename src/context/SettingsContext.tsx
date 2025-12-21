import React, { createContext, useContext, useState, useEffect } from 'react';

export interface BannerSlide {
    id: number;
    badge: string;
    title: string;
    highlight: string;
    description: string;
    image: string;
    discount: string;
    bgClass: string;
    category?: string; // Category slug for "Shop Now" navigation
}

interface Settings {
    storeName: string;
    supportEmail: string;
    maintenanceMode: boolean;
    orderAlerts: boolean;
    stockWarnings: boolean;
    newSignups: boolean;
    bannerSlides: BannerSlide[];
}

interface SettingsContextType {
    settings: Settings;
    updateSettings: (newSettings: Partial<Settings>) => void;
    isLoading: boolean;
}

const DEFAULT_SETTINGS: Settings = {
    storeName: 'ShopVely',
    supportEmail: 'contact.shopvely@gmail.com',
    maintenanceMode: false,
    orderAlerts: true,
    stockWarnings: true,
    newSignups: false,
    bannerSlides: [
        {
            id: 1,
            badge: '🔥 New Season Collection',
            title: 'Shop Smart,',
            highlight: 'Shop Lovely',
            description: 'Discover amazing deals on electronics, fashion, home essentials and more. Quality products at unbeatable prices.',
            image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
            discount: 'UP TO 50% OFF',
            bgClass: 'from-primary/20 via-secondary/30 to-accent/20',
            category: '', // All products
        },
        {
            id: 2,
            badge: '✨ Seasonal Sale',
            title: 'Festive',
            highlight: 'Collection',
            description: 'Celebrate in style with our exclusive festive collection. Traditional meets modern fashion.',
            image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800',
            discount: 'UP TO 40% OFF',
            bgClass: 'from-accent/20 via-primary/20 to-secondary/30',
            category: 'seasonal-products',
        },
        {
            id: 3,
            badge: '🎁 Limited Time Offer',
            title: 'Electronics',
            highlight: 'Mega Sale',
            description: 'Upgrade your tech with the latest gadgets. Premium quality at amazing prices.',
            image: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=800',
            discount: 'UP TO 60% OFF',
            bgClass: 'from-secondary/30 via-accent/20 to-primary/20',
            category: 'electronics',
        },
        {
            id: 4,
            badge: '🏠 Home Essentials',
            title: 'Transform Your',
            highlight: 'Living Space',
            description: 'Beautiful home decor and furniture at prices you\'ll love. Make your house a home.',
            image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800',
            discount: 'UP TO 35% OFF',
            bgClass: 'from-primary/15 via-accent/25 to-secondary/20',
            category: 'home-living',
        },
    ]
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const storedSettings = localStorage.getItem('shopvely_settings');
        if (storedSettings) {
            try {
                setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(storedSettings) });
            } catch (e) {
                console.error("Failed to parse settings", e);
            }
        }
        setIsLoading(false);
    }, []);

    const updateSettings = (newSettings: Partial<Settings>) => {
        const updated = { ...settings, ...newSettings };
        setSettings(updated);
        localStorage.setItem('shopvely_settings', JSON.stringify(updated));
    };

    return (
        <SettingsContext.Provider value={{ settings, updateSettings, isLoading }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
