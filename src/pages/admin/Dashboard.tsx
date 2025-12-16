import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AnalyticsTab from './tabs/AnalyticsTab';
import ProductsTab from './tabs/ProductsTab';
import OrdersTab from './tabs/OrdersTab';
import UsersTab from './tabs/UsersTab';
import DiscountsTab from './tabs/DiscountsTab';
import ReviewsTab from './tabs/ReviewsTab';
import SettingsTab from './tabs/SettingsTab';

const Dashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("analytics");

  // Sync active tab with URL path
  useEffect(() => {
    const path = location.pathname.split("/").pop();
    if (path && ['analytics', 'products', 'orders', 'users', 'reviews', 'discounts', 'settings'].includes(path)) {
      setActiveTab(path);
    } else if (location.pathname === '/admin' || location.pathname === '/admin/') {
      setActiveTab('analytics');
    }
  }, [location.pathname]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === 'analytics') {
      navigate('/admin');
    } else {
      navigate(`/admin/${value}`);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to the ShopVely admin panel</p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="discounts">Discounts</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-4">
          <AnalyticsTab />
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <ProductsTab />
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <OrdersTab />
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <UsersTab />
        </TabsContent>

        <TabsContent value="reviews" className="space-y-4">
          <ReviewsTab />
        </TabsContent>

        <TabsContent value="discounts" className="space-y-4">
          <DiscountsTab />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <SettingsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
