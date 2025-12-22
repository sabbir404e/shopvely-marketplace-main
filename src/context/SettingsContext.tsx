import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/components/ui/use-toast";

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
    const { toast } = useToast();

    // Fetch settings from Supabase
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data, error } = await supabase
                    .from('site_settings' as any)
                    .select('*');

                if (error) throw error;

                if (data) {
                    const newSettings = { ...DEFAULT_SETTINGS };

                    // Parse fetched settings
                    data.forEach((item: any) => {
                        if (item.key === 'settings_store') {
                            newSettings.storeName = item.value.storeName;
                            newSettings.supportEmail = item.value.supportEmail;
                            newSettings.maintenanceMode = item.value.maintenanceMode;
                        }
                        if (item.key === 'settings_notifications') {
                            newSettings.orderAlerts = item.value.orderAlerts;
                            newSettings.stockWarnings = item.value.stockWarnings;
                            newSettings.newSignups = item.value.newSignups;
                        }
                        if (item.key === 'settings_banners') {
                            newSettings.bannerSlides = item.value;
                        }
                    });

                    setSettings(newSettings);
                }
            } catch (error) {
                console.error("Failed to fetch settings:", error);
                // Fallback to default is already handled by initial state
            } finally {
                setIsLoading(false);
            }
        };

        fetchSettings();
    }, []);

    const updateSettings = async (newSettings: Partial<Settings>) => {
        const updated = { ...settings, ...newSettings };
        setSettings(updated);

        // Optimistic update locally, then sync to DB
        // We split the huge object into 3 logical chunks for the DB

        try {
            const updates = [];

            // 1. Store Settings
            if (newSettings.storeName !== undefined || newSettings.supportEmail !== undefined || newSettings.maintenanceMode !== undefined) {
                updates.push(supabase
                    .from('site_settings' as any)
                    .upsert({
                        key: 'settings_store',
                        value: {
                            storeName: updated.storeName,
                            supportEmail: updated.supportEmail,
                            maintenanceMode: updated.maintenanceMode
                        }
                    } as any, { onConflict: 'key' }));
            }

            // 2. Notification Settings
            if (newSettings.orderAlerts !== undefined || newSettings.stockWarnings !== undefined || newSettings.newSignups !== undefined) {
                updates.push(supabase
                    .from('site_settings' as any)
                    .upsert({
                        key: 'settings_notifications',
                        value: {
                            orderAlerts: updated.orderAlerts,
                            stockWarnings: updated.stockWarnings,
                            newSignups: updated.newSignups
                        }
                    } as any, { onConflict: 'key' }));
            }

            // 3. Banner Settings
            if (newSettings.bannerSlides !== undefined) {
                updates.push(supabase
                    .from('site_settings' as any)
                    .upsert({
                        key: 'settings_banners',
                        value: updated.bannerSlides
                    } as any, { onConflict: 'key' }));
            }

            // If we are updating everything (e.g. from handleSave in admin panel), we rely on checks above.
            // But if 'newSettings' has all keys, we might need to be careful. 
            // The usage in SettingsTab passes the whole object, so all 3 blocks will likely fire.

            await Promise.all(updates);

        } catch (error: any) {
            console.error("Failed to save settings:", error);
            toast({
                title: "Error Saving Settings",
                description: "Failed to sync with server. Changes might be lost on refresh.",
                variant: "destructive"
            });
        }
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
