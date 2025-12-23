import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    ShoppingBag,
    Users,
    Package,
    TrendingUp,
    DollarSign,
    Eye
} from 'lucide-react';

import { supabase } from '@/integrations/supabase/client';
import { useReviews } from '@/context/ReviewContext';

const AnalyticsTab: React.FC = () => {
    const [stats, setStats] = React.useState([
        { name: 'Total Revenue', value: '...', change: '', icon: DollarSign, color: 'text-green-500' },
        { name: 'Total Orders', value: '...', change: '', icon: ShoppingBag, color: 'text-blue-500' },
        { name: 'Total Products', value: '...', change: '', icon: Package, color: 'text-purple-500' },
        { name: 'Total Users', value: '...', change: '', icon: Users, color: 'text-orange-500' },
        { name: 'Page Views', value: '45.2K', change: '+18%', icon: Eye, color: 'text-cyan-500' },
        { name: 'Conversion Rate', value: '3.2%', change: '+0.4%', icon: TrendingUp, color: 'text-primary' },
    ]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                // 1. Total Revenue (Sum of final_amount for paid/delivered orders)
                const { data: revenueData } = await (supabase as any)
                    .from('orders')
                    .select('final_amount')
                    .or('status.eq.delivered,status.eq.paid');

                const totalRevenue = revenueData?.reduce((sum, order) => sum + (Number(order.final_amount) || 0), 0) || 0;

                // 2. Total Orders (Count all orders)
                const { count: orderCount } = await (supabase as any)
                    .from('orders')
                    .select('*', { count: 'exact', head: true });

                // 3. Total Products (Count all products)
                const { count: productCount } = await (supabase as any)
                    .from('products')
                    .select('*', { count: 'exact', head: true });

                // 4. Total Users (Count profiles where role is not admin)
                const { count: userCount } = await (supabase as any)
                    .from('profiles')
                    .select('*', { count: 'exact', head: true })
                    .neq('role', 'admin');

                setStats([
                    {
                        name: 'Total Revenue',
                        value: `৳${totalRevenue.toLocaleString()}`,
                        change: 'Real-time',
                        icon: DollarSign,
                        color: 'text-green-500'
                    },
                    {
                        name: 'Total Orders',
                        value: (orderCount || 0).toLocaleString(),
                        change: 'Total',
                        icon: ShoppingBag,
                        color: 'text-blue-500'
                    },
                    {
                        name: 'Total Products',
                        value: (productCount || 0).toLocaleString(),
                        change: 'Active',
                        icon: Package,
                        color: 'text-purple-500'
                    },
                    {
                        name: 'Total Users',
                        value: (userCount || 0).toLocaleString(),
                        change: 'Registered',
                        icon: Users,
                        color: 'text-orange-500'
                    },
                    {
                        name: 'Page Views',
                        value: '0',
                        change: 'Not tracked',
                        icon: Eye,
                        color: 'text-cyan-500'
                    },
                    {
                        name: 'Conversion Rate',
                        value: '0%',
                        change: 'Not tracked',
                        icon: TrendingUp,
                        color: 'text-primary'
                    },
                ]);
            } catch (error) {
                console.error("Error fetching analytics:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {stats.map((stat) => (
                    <Card key={stat.name}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {stat.name}
                            </CardTitle>
                            <stat.icon className={`h-5 w-5 ${stat.color}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground">
                                {loading && stat.value === '...' ? (
                                    <span className="animate-pulse">...</span>
                                ) : (
                                    stat.value
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                <span className={stat.color}>{stat.change}</span>
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default AnalyticsTab;
