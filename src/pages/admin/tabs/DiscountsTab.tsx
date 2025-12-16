import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

export interface Coupon {
    id: string;
    code: string;
    percentage: number;
    expiryDate: string;
    isActive: boolean;
    productIds?: string[];
}

const PRODUCTS = [
    { id: '1', name: 'Premium Kurta Set' },
    { id: '2', name: 'Casual Cotton Shirt' },
    { id: '3', name: 'Silk Saree Collection' },
    { id: '4', name: 'Denim Jeans' },
    { id: '5', name: 'Traditional Panjabi' },
    { id: '6', name: 'Georgette Kameez' },
];

const DiscountsTab: React.FC = () => {
    const [coupons, setCoupons] = useState<Coupon[]>(() => {
        const saved = localStorage.getItem('shopvely-coupons');
        return saved ? JSON.parse(saved) : [];
    });

    const [newCoupon, setNewCoupon] = useState<{
        code: string;
        percentage: string;
        expiryDate: string;
        productIds: string[];
    }>({
        code: '',
        percentage: '',
        expiryDate: '',
        productIds: [],
    });

    useEffect(() => {
        localStorage.setItem('shopvely-coupons', JSON.stringify(coupons));
    }, [coupons]);

    const handleAddCoupon = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCoupon.code || !newCoupon.percentage || !newCoupon.expiryDate) {
            toast({
                title: "Error",
                description: "Please fill in all required fields",
                variant: "destructive",
            });
            return;
        }

        const percentage = parseFloat(newCoupon.percentage);
        if (isNaN(percentage) || percentage <= 0 || percentage > 100) {
            toast({
                title: "Error",
                description: "Percentage must be between 1 and 100",
                variant: "destructive",
            });
            return;
        }

        const coupon: Coupon = {
            id: Date.now().toString(),
            code: newCoupon.code.toUpperCase(),
            percentage,
            expiryDate: newCoupon.expiryDate,
            isActive: true,
            productIds: newCoupon.productIds.length > 0 ? newCoupon.productIds : undefined,
        };

        setCoupons([...coupons, coupon]);
        setNewCoupon({ code: '', percentage: '', expiryDate: '', productIds: [] });
        toast({
            title: "Success",
            description: "Coupon created successfully",
        });
    };

    const handleDeleteCoupon = (id: string) => {
        setCoupons(coupons.filter(c => c.id !== id));
        toast({
            title: "Success",
            description: "Coupon deleted",
        });
    };

    const toggleStatus = (id: string) => {
        setCoupons(coupons.map(c =>
            c.id === id ? { ...c, isActive: !c.isActive } : c
        ));
    };

    const toggleProductSelection = (productId: string) => {
        setNewCoupon(prev => {
            const exists = prev.productIds.includes(productId);
            if (exists) {
                return { ...prev, productIds: prev.productIds.filter(id => id !== productId) };
            } else {
                return { ...prev, productIds: [...prev.productIds, productId] };
            }
        });
    };

    return (
        <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Create New Discount</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleAddCoupon} className="space-y-4">
                        <div>
                            <label className="text-sm font-medium mb-1 block">Coupon Code</label>
                            <Input
                                placeholder="e.g. SUMMER20"
                                value={newCoupon.code}
                                onChange={e => setNewCoupon({ ...newCoupon, code: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">Discount Percentage (%)</label>
                            <Input
                                type="number"
                                placeholder="20"
                                value={newCoupon.percentage}
                                onChange={e => setNewCoupon({ ...newCoupon, percentage: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">Expiry Date</label>
                            <Input
                                type="date"
                                value={newCoupon.expiryDate}
                                onChange={e => setNewCoupon({ ...newCoupon, expiryDate: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-1 block">Applicable Products (Optional)</label>
                            <div className="border rounded-md p-3 max-h-48 overflow-y-auto space-y-2">
                                <p className="text-xs text-muted-foreground mb-2">Select products to apply this discount to. Leave empty for all products.</p>
                                {PRODUCTS.map(product => (
                                    <div key={product.id} className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id={`prod-${product.id}`}
                                            checked={newCoupon.productIds.includes(product.id)}
                                            onChange={() => toggleProductSelection(product.id)}
                                            className="rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                        <label htmlFor={`prod-${product.id}`} className="text-sm cursor-pointer select-none">
                                            {product.name}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Button type="submit" className="w-full gap-2">
                            <Plus className="h-4 w-4" /> Create Coupon
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Active Coupons</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Code</TableHead>
                                <TableHead>Discount</TableHead>
                                <TableHead>Products</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {coupons.map((coupon) => (
                                <TableRow key={coupon.id}>
                                    <TableCell className="font-medium">{coupon.code}</TableCell>
                                    <TableCell>{coupon.percentage}%</TableCell>
                                    <TableCell className="max-w-[150px] truncate" title={coupon.productIds ? coupon.productIds.map(id => PRODUCTS.find(p => p.id === id)?.name).join(', ') : "All Products"}>
                                        {coupon.productIds && coupon.productIds.length > 0
                                            ? `${coupon.productIds.length} Product(s)`
                                            : "All Products"}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={coupon.isActive ? "default" : "secondary"}
                                            className="cursor-pointer"
                                            onClick={() => toggleStatus(coupon.id)}
                                        >
                                            {coupon.isActive ? "Active" : "Inactive"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDeleteCoupon(coupon.id)}
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {coupons.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                                        No coupons created yet
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default DiscountsTab;
