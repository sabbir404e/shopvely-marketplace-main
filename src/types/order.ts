
export interface OrderItem {
    id: string;
    name: string;
    quantity: number;
    price: number;
    selectedSize?: string;
    productId?: string;
}

export interface ShippingAddress {
    name: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
    village?: string;
}

export interface Order {
    id: string;
    user_id?: string;
    customer: string; // Helper for display (from profile or address)
    date: string;
    total: number;
    status: 'Delivered' | 'Processing' | 'Shipped' | 'Cancelled' | 'DEAL_COMPLETE' | 'pending';
    items: OrderItem[];
    shippingAddress: ShippingAddress;
    paymentMethod?: string;
}
