import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Order, OrderItem } from '@/types/order';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

interface OrderContextType {
    orders: Order[];
    isLoading: boolean;
    addOrder: (order: Omit<Order, 'id' | 'date' | 'status'>) => Promise<string | null>;
    updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
    deleteOrder: (orderId: string) => Promise<void>;
    getStats: () => {
        totalRevenue: number;
        totalOrders: number;
        activeOrders: number;
    };
    refreshOrders: () => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user, isAdmin } = useAuth();

    const fetchOrders = async () => {
        if (!user) {
            setOrders([]);
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);

            let query = (supabase as any)
                .from('orders')
                .select(`
                    id,
                    user_id,
                    created_at,
                    status,
                    final_amount,
                    shipping_address_snapshot,
                    payment_method,
                    profiles:user_id ( full_name, email ),
                    order_items (
                        id,
                        product_name,
                        quantity,
                        price,
                        variant_id
                    )
                `)
                .order('created_at', { ascending: false });

            // If not admin, only show own orders
            if (!isAdmin) {
                query = query.eq('user_id', user.id);
            }

            const { data, error } = await query;

            if (error) throw error;

            if (data) {
                const mappedOrders: Order[] = data.map((o: any) => ({
                    id: o.id,
                    user_id: o.user_id,
                    customer: o.shipping_address_snapshot?.name || o.profiles?.full_name || 'Guest',
                    date: new Date(o.created_at).toISOString().split('T')[0],
                    total: o.final_amount,
                    status: o.status,
                    shippingAddress: o.shipping_address_snapshot || {},
                    paymentMethod: o.payment_method,
                    items: o.order_items?.map((item: any) => ({
                        id: item.id,
                        name: item.product_name,
                        quantity: item.quantity,
                        price: item.price,
                        selectedSize: item.variant_id ? 'Variant' : undefined
                    })) || []
                }));
                setOrders(mappedOrders);
            }
        } catch (error) {
            console.error('Failed to fetch orders:', error);
            toast({
                title: "Error fetching orders",
                description: "Could not load orders from database.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [user, isAdmin]);

    const refreshOrders = async () => {
        await fetchOrders();
    };

    const addOrder = async (orderData: Omit<Order, 'id' | 'date' | 'status'>): Promise<string | null> => {
        try {
            if (!user) throw new Error("User must be logged in to place order");

            // 1. Insert Order
            // Generate a custom ID like SV-TIMESTAMP-RANDOM
            const customId = `SV${Date.now()}${Math.floor(Math.random() * 1000)}`;

            const { error: orderError } = await (supabase as any)
                .from('orders')
                .insert({
                    id: customId,
                    user_id: user.id,
                    total_amount: orderData.total, // For now assuming total = final
                    final_amount: orderData.total,
                    status: 'Processing', // Default
                    shipping_address_snapshot: orderData.shippingAddress,
                    payment_method: orderData.paymentMethod || 'COD'
                });

            if (orderError) throw orderError;

            // 2. Insert Order Items
            if (orderData.items.length > 0) {
                const itemsToInsert = orderData.items.map(item => ({
                    order_id: customId,
                    product_id: item.productId, // Ensure passed from cart or undefined
                    product_name: item.name,
                    quantity: item.quantity,
                    price: item.price
                }));

                const { error: itemsError } = await (supabase as any)
                    .from('order_items')
                    .insert(itemsToInsert);

                if (itemsError) throw itemsError;
            }

            toast({ title: "Order Placed", description: `Order ${customId} created successfully.` });
            await fetchOrders();
            return customId;

        } catch (error: any) {
            console.error("Order creation failed:", error);
            toast({
                title: "Order Failed",
                description: error.message,
                variant: "destructive"
            });
            return null;
        }
    };

    const updateOrderStatus = async (orderId: string, status: Order['status']) => {
        try {
            const { error } = await (supabase as any)
                .from('orders')
                .update({ status })
                .eq('id', orderId);

            if (error) throw error;

            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
            toast({ title: "Status Updated", description: `Order marked as ${status}` });

        } catch (error: any) {
            console.error("Failed to update status:", error);
            toast({
                title: "Update Failed",
                description: error.message,
                variant: "destructive"
            });
        }
    };

    const deleteOrder = async (orderId: string) => {
        try {
            const { error } = await (supabase as any)
                .from('orders')
                .delete()
                .eq('id', orderId);

            if (error) throw error;

            setOrders(prev => prev.filter(o => o.id !== orderId));
            toast({ title: "Order Deleted" });

        } catch (error: any) {
            console.error("Failed to delete order:", error);
            toast({
                title: "Delete Failed",
                description: error.message,
                variant: "destructive"
            });
        }
    };

    const getStats = () => {
        const totalRevenue = orders
            .filter(o => o.status !== 'Cancelled')
            .reduce((sum, order) => sum + order.total, 0);

        const totalOrders = orders.length;
        const activeOrders = orders.filter(o => o.status === 'Processing' || o.status === 'Shipped').length;

        return {
            totalRevenue,
            totalOrders,
            activeOrders
        };
    };

    return (
        <OrderContext.Provider value={{
            orders,
            isLoading,
            addOrder,
            updateOrderStatus,
            deleteOrder,
            getStats,
            refreshOrders
        }}>
            {children}
        </OrderContext.Provider>
    );
};

export const useOrders = () => {
    const context = useContext(OrderContext);
    if (context === undefined) {
        throw new Error('useOrders must be used within an OrderProvider');
    }
    return context;
};
