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
import { useOrders } from '@/context/OrderContext';
import { products } from '@/data/products';
import { useReviews } from '@/context/ReviewContext';

const AnalyticsTab: React.FC = () => {
    const { getStats } = useOrders();
    const { reviews } = useReviews(); // Using reviews to estimate users for now if possible

    // Calculate real stats
    const orderStats = getStats();
    const productCount = products.length;
    // Estimate unique users from reviews + some base number for demo
    const uniqueReviewers = new Set(reviews.map(r => r.userId)).size;
    const totalUsers = uniqueReviewers + 1500; // Mock base + real unique reviewers

    const stats = [
        {
            name: 'Total Revenue',
            value: `৳${orderStats.totalRevenue.toLocaleString()}`,
            change: '+12%',
            icon: DollarSign,
            color: 'text-green-500'
        },
        {
            name: 'Total Orders',
            value: orderStats.totalOrders.toString(),
            change: `+${orderStats.activeOrders} active`,
            icon: ShoppingBag,
            color: 'text-blue-500'
        },
        {
            name: 'Total Products',
            value: productCount.toString(),
            change: '+3',
            icon: Package,
            color: 'text-purple-500'
        },
        {
            name: 'Total Users',
            value: totalUsers.toLocaleString(),
            change: '+24',
            icon: Users,
            color: 'text-orange-500'
        },
        {
            name: 'Page Views',
            value: '45.2K',
            change: '+18%',
            icon: Eye,
            color: 'text-cyan-500'
        },
        {
            name: 'Conversion Rate',
            value: '3.2%',
            change: '+0.4%',
            icon: TrendingUp,
            color: 'text-primary'
        },
    ];

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
                            <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                            <p className="text-xs text-muted-foreground">
                                <span className="text-green-500">{stat.change}</span> from last month
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default AnalyticsTab;
