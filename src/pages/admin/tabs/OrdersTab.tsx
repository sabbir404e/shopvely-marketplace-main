import React, { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Eye, Search, Trash2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useOrders, Order } from '@/context/OrderContext';
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const OrdersTab: React.FC = () => {
    const { orders, updateOrderStatus, deleteOrder } = useOrders();
    const { userRole } = useAuth();
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredOrders = orders.filter(order =>
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
        if (newStatus === 'DEAL_COMPLETE') {
            const order = orders.find(o => o.id === orderId);
            if (!order) return;

            if (order.status === 'DEAL_COMPLETE') {
                toast({ title: "Already Completed", description: "This deal is already complete." });
                return;
            }

            // Commission Logic
            if (order.customerId) {
                try {
                    // 1. Get Customer Profile to find referrer
                    const { data: customerProfile } = await supabase
                        .from('profiles')
                        .select('referred_by_user_id')
                        .eq('id', order.customerId)
                        .single();

                    // Cast to any because types are not regenerated
                    const profileData = customerProfile as any;

                    if (profileData && profileData.referred_by_user_id) {
                        const referrerId = profileData.referred_by_user_id;

                        // 2. Calculate Commission
                        // Commission is 5% of product price (per item)
                        const totalCommissionTk = order.items.reduce((sum, item) => {
                            return sum + (item.price * item.quantity * 0.05);
                        }, 0);

                        // 1 TK = 10 Points
                        const earnedPoints = Math.round(totalCommissionTk * 10);

                        if (earnedPoints > 0) {
                            // 3. Fetch Referrer's current points
                            const { data: referrer, error: refError } = await supabase
                                .from('profiles')
                                .select('loyalty_points')
                                .eq('id', referrerId)
                                .single();

                            const referrerData = referrer as any;

                            if (referrerData && !refError) {
                                // 4. Update Referrer Wallet
                                const { error: updateError } = await supabase
                                    .from('profiles')
                                    .update({ loyalty_points: (referrerData.loyalty_points || 0) + earnedPoints } as any)
                                    .eq('id', referrerId);

                                if (!updateError) {
                                    // 5. Log Transaction
                                    await (supabase.from('loyalty_transactions' as any) as any).insert({
                                        user_id: referrerId,
                                        type: 'EARN_REFERRAL',
                                        points: earnedPoints,
                                        tk_amount: totalCommissionTk,
                                        order_id: orderId,
                                        meta_json: { from_customer: order.customerId }
                                    });

                                    toast({
                                        title: "Points Credited",
                                        description: `Referrer credited with ${earnedPoints} points.`,
                                        variant: "default" // success
                                    });
                                }
                            }
                        }
                    }
                } catch (error) {
                    console.error("Loyalty Error:", error);
                    toast({ title: "Loyalty System Error", description: "Failed to process referral rewards.", variant: "destructive" });
                }
            }
        }

        updateOrderStatus(orderId, newStatus);
        toast({
            title: "Status Updated",
            description: `Order ${orderId} marked as ${newStatus}.`,
        });
    };

    const handleDelete = (orderId: string) => {
        if (confirm('Are you sure you want to delete this order?')) {
            deleteOrder(orderId);
            toast({
                title: "Order Deleted",
                description: "Order has been removed successfully.",
                variant: "destructive"
            });
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Delivered': return 'bg-green-500 hover:bg-green-600';
            case 'Processing': return 'bg-blue-500 hover:bg-blue-600';
            case 'Shipped': return 'bg-purple-500 hover:bg-purple-600';
            case 'DEAL_COMPLETE': return 'bg-emerald-600 hover:bg-emerald-700';
            case 'Cancelled': return 'bg-red-500 hover:bg-red-600';
            default: return 'bg-gray-500 hover:bg-gray-600';
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Orders</CardTitle>
                        <CardDescription>Manage and track customer orders</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex items-center mb-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by Order ID or Customer..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                </div>

                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order ID</TableHead>
                                <TableHead>Customer Name</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Total Amount</TableHead>
                                <TableHead>Quantity</TableHead>
                                <TableHead>Size</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Shipping Information</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredOrders.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={9} className="text-center h-24 text-muted-foreground">
                                        No orders found matching your search.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredOrders.map((order) => (
                                    <TableRow key={order.id}>
                                        <TableCell className="font-medium">{order.id}</TableCell>
                                        <TableCell>{order.customer}</TableCell>
                                        <TableCell>{order.date}</TableCell>
                                        <TableCell>৳{order.total.toLocaleString()}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                {order.items.map((item, idx) => (
                                                    <div key={idx} className="text-sm">
                                                        {item.quantity}x
                                                    </div>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                {order.items.map((item, idx) => (
                                                    <div key={idx} className="text-sm">
                                                        {item.selectedSize ? (
                                                            <span className="font-semibold text-primary">{item.selectedSize}</span>
                                                        ) : (
                                                            <span className="text-muted-foreground">-</span>
                                                        )}
                                                        <span className="text-muted-foreground ml-1 text-xs">({item.name})</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {userRole === 'admin' ? (
                                                <Select
                                                    value={order.status}
                                                    onValueChange={(value) => handleStatusChange(order.id, value as Order['status'])}
                                                >
                                                    <SelectTrigger className={`w-[130px] h-8 text-white border-0 ${getStatusColor(order.status)}`}>
                                                        <SelectValue placeholder="Status" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Processing">Processing</SelectItem>
                                                        <SelectItem value="Shipped">Shipped</SelectItem>
                                                        <SelectItem value="Delivered">Delivered</SelectItem>
                                                        <SelectItem value="DEAL_COMPLETE">Deal Complete (Credit Points)</SelectItem>
                                                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            ) : (
                                                <Badge className={`${getStatusColor(order.status)} text-white hover:none`}>
                                                    {order.status}
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {order.shippingAddress ? (
                                                <div className="text-sm max-w-[200px]">
                                                    <p className="font-medium">{order.shippingAddress.phone}</p>
                                                    <p className="text-muted-foreground text-xs truncate" title={`${order.shippingAddress.address}, ${order.shippingAddress.village}`}>
                                                        {order.shippingAddress.address}, {order.shippingAddress.village}
                                                    </p>
                                                    <p className="text-muted-foreground text-xs truncate">
                                                        {order.shippingAddress.city} - {order.shippingAddress.postalCode}
                                                    </p>
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground text-sm">N/A</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {userRole === 'admin' && (
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700" onClick={() => handleDelete(order.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
};

export default OrdersTab;
