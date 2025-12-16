import React, { createContext, useContext, useState, useEffect } from 'react';

export interface OrderItem {
    id: string;
    name: string;
    quantity: number;
    price: number;
    selectedSize?: string;
}

export interface ShippingAddress {
    name: string;
    phone: string;
    address: string;
    city: string;
    village: string;
    postalCode: string;
}

export interface Order {
    id: string;
    customer: string;
    date: string;
    total: number; // Storing as number for calculations
    status: 'Delivered' | 'Processing' | 'Shipped' | 'Cancelled';
    items: OrderItem[];
    shippingAddress?: ShippingAddress;
}

interface OrderContextType {
    orders: Order[];
    addOrder: (order: Order) => void;
    updateOrderStatus: (orderId: string, status: Order['status']) => void;
    deleteOrder: (orderId: string) => void;
    getStats: () => {
        totalRevenue: number;
        totalOrders: number;
        activeOrders: number;
    };
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

const STORAGE_KEY = 'shopvely_orders';

// Initial dummy data
const INITIAL_ORDERS: Order[] = [
    {
        id: 'ORD-001',
        customer: 'Sabbir Hossain',
        date: '2025-12-11',
        total: 2500,
        status: 'Delivered',
        items: [
            { id: '1', name: 'Premium Wireless Headphones', quantity: 1, price: 2500, selectedSize: undefined }
        ],
        shippingAddress: {
            name: 'Sabbir Hossain',
            phone: '01700000000',
            address: 'House 12, Road 5',
            city: 'Dhaka',
            village: 'Uttara',
            postalCode: '1230'
        }
    },
    {
        id: 'ORD-002',
        customer: 'Rahim Ahmed',
        date: '2025-12-12',
        total: 1200,
        status: 'Processing',
        items: [
            { id: '8', name: 'Cotton T-Shirt Pack', quantity: 1, price: 1200, selectedSize: 'L' }
        ],
        shippingAddress: {
            name: 'Rahim Ahmed',
            phone: '01800000000',
            address: 'Flat 4B, King Tower',
            city: 'Chittagong',
            village: 'Agrabad',
            postalCode: '4100'
        }
    },
    {
        id: 'ORD-003',
        customer: 'Karim Ullah',
        date: '2025-12-10',
        total: 8500,
        status: 'Shipped',
        items: [
            { id: '2', name: 'Smart Watch Pro', quantity: 1, price: 8500, selectedSize: '44mm' }
        ],
        shippingAddress: {
            name: 'Karim Ullah',
            phone: '01900000000',
            address: 'Vill: Ruppur',
            city: 'Sylhet',
            village: 'Ruppur',
            postalCode: '3100'
        }
    },
    {
        id: 'ORD-004',
        customer: 'Jamal Khan',
        date: '2025-12-09',
        total: 1800,
        status: 'Cancelled',
        items: [
            { id: '9', name: 'Yoga Mat Premium', quantity: 1, price: 1800 }
        ],
        shippingAddress: {
            name: 'Jamal Khan',
            phone: '01600000000',
            address: '78 College Road',
            city: 'Rajshahi',
            village: 'Boalia',
            postalCode: '6000'
        }
    },
    {
        id: 'ORD-005',
        customer: 'Nusrat Jahan',
        date: '2025-12-08',
        total: 3200,
        status: 'Processing',
        items: [
            { id: '3', name: 'Designer Leather Handbag', quantity: 1, price: 3200, selectedSize: 'M' }
        ],
        shippingAddress: {
            name: 'Nusrat Jahan',
            phone: '01500000000',
            address: '15 Kazi Lane',
            city: 'Khulna',
            village: 'Sonadanga',
            postalCode: '9000'
        }
    },
];

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [orders, setOrders] = useState<Order[]>([]);

    useEffect(() => {
        const storedOrders = localStorage.getItem(STORAGE_KEY);
        if (storedOrders) {
            try {
                const parsed = JSON.parse(storedOrders);
                // Migration for legacy data where items was a number
                const migratedOrders = parsed.map((order: any) => {
                    if (typeof order.items === 'number') {
                        return {
                            ...order,
                            items: [{
                                id: `legacy-${order.id}`,
                                name: 'Legacy Item (Details Unavailable)',
                                quantity: order.items,
                                price: order.total ? (order.total / order.items) : 0,
                                selectedSize: undefined
                            }]
                        };
                    }
                    return order;
                });
                setOrders(migratedOrders);
            } catch (error) {
                console.error('Failed to parse orders:', error);
                setOrders(INITIAL_ORDERS);
            }
        } else {
            setOrders(INITIAL_ORDERS);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    }, [orders]);

    const addOrder = (order: Order) => {
        setOrders(prev => [order, ...prev]);
    };

    const updateOrderStatus = (orderId: string, status: Order['status']) => {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    };

    const deleteOrder = (orderId: string) => {
        setOrders(prev => prev.filter(o => o.id !== orderId));
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
        <OrderContext.Provider value={{ orders, addOrder, updateOrderStatus, deleteOrder, getStats }}>
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
