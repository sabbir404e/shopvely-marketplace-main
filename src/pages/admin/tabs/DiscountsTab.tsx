import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { useProducts } from '@/context/ProductContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface Coupon {
    id: string;
    code: string;
    percentage: number;
    expiryDate: string;
    isActive: boolean;
    productIds?: string[];
}



const DiscountsTab: React.FC = () => {
    const { products } = useProducts();
    const { userRole } = useAuth();
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);

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

    const fetchCoupons = async () => {
        try {
            setLoading(true);
            const { data, error } = await (supabase as any)
                .from('coupons')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (data) {
                const mappedCoupons: Coupon[] = data.map((c: any) => ({
                    id: c.id,
                    code: c.code,
                    percentage: c.value,
                    expiryDate: c.end_date ? c.end_date.split('T')[0] : '',
                    isActive: c.is_active,
                    productIds: c.product_ids || []
                }));
                setCoupons(mappedCoupons);
            }
        } catch (error) {
            console.error("Error fetching coupons:", error);
            toast({ title: "Error", description: "Failed to load coupons", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCoupons();
    }, []);

    const handleAddCoupon = async (e: React.FormEvent) => {
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

        try {
            const { error } = await (supabase as any)
                .from('coupons')
                .insert({
                    code: newCoupon.code.toUpperCase(),
                    value: percentage,
                    end_date: new Date(newCoupon.expiryDate).toISOString(),
                    type: 'percentage',
                    is_active: true,
                    product_ids: newCoupon.productIds.length > 0 ? newCoupon.productIds : null
                });

            if (error) throw error;

            toast({
                title: "Success",
                description: "Coupon created successfully",
            });

            setNewCoupon({ code: '', percentage: '', expiryDate: '', productIds: [] });
            fetchCoupons();

        } catch (error: any) {
            console.error("Error adding coupon:", error);
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    };

    const handleDeleteCoupon = async (id: string) => {
        if (!confirm("Are you sure you want to delete this coupon?")) return;
        try {
            const { error } = await (supabase as any)
                .from('coupons')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setCoupons(coupons.filter(c => c.id !== id));
            toast({ title: "Success", description: "Coupon deleted" });
        } catch (error: any) {
            console.error("Error deleting coupon:", error);
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    };

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            const { error } = await (supabase as any)
                .from('coupons')
                .update({ is_active: !currentStatus })
                .eq('id', id);

            if (error) throw error;

            setCoupons(coupons.map(c =>
                c.id === id ? { ...c, isActive: !c.isActive } : c
            ));
        } catch (error: any) {
            console.error("Error updating coupon:", error);
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
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
            {userRole === 'admin' && (
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
                                    {products.map(product => (
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
            )}

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
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground">Loading...</TableCell>
                                </TableRow>
                            ) : coupons.map((coupon) => (
                                <TableRow key={coupon.id}>
                                    <TableCell className="font-medium">{coupon.code}</TableCell>
                                    <TableCell>{coupon.percentage}%</TableCell>
                                    <TableCell className="max-w-[150px] truncate" title={coupon.productIds ? coupon.productIds.map(id => products.find(p => p.id === id)?.name).join(', ') : "All Products"}>
                                        {coupon.productIds && coupon.productIds.length > 0
                                            ? `${coupon.productIds.length} Product(s)`
                                            : "All Products"}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={coupon.isActive ? "default" : "secondary"}
                                            className="cursor-pointer"
                                            onClick={() => toggleStatus(coupon.id, coupon.isActive)}
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
                            {!loading && coupons.length === 0 && (
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
