import React, { useState, useEffect } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'; // Fixed import
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { Check, X, Loader2 } from 'lucide-react';

const WithdrawalsTab: React.FC = () => {
    const { toast } = useToast();
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            // 1. Fetch Requests
            const { data: requestsData, error: requestError } = await supabase
                .from('withdraw_requests' as any)
                .select('*')
                .order('created_at', { ascending: false });

            if (requestError) throw requestError;

            if (requestsData && requestsData.length > 0) {
                // 2. Fetch Profiles for these requests
                const userIds = requestsData.map((r: any) => r.user_id);
                const { data: profilesData, error: profileError } = await supabase
                    .from('profiles')
                    .select('id, full_name, phone')
                    .in('id', userIds);

                if (profileError) throw profileError;

                // 3. Merge Data
                const mergedData = requestsData.map((req: any) => ({
                    ...req,
                    profiles: profilesData?.find((p: any) => p.id === req.user_id) || { full_name: 'Unknown', phone: '' }
                }));

                setRequests(mergedData);
            } else {
                setRequests([]);
            }

        } catch (error: any) {
            console.error("Error fetching requests:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to fetch withdraw requests",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: string, userId: string, points: number) => {
        if (!confirm("Are you sure you want to Approve this request?")) return;

        try {
            const { error } = await supabase
                .from('withdraw_requests' as any)
                .update({ status: 'COMPLETED' })
                .eq('id', id);

            if (error) throw error;

            // Log
            await (supabase.from('loyalty_transactions' as any) as any).insert({
                user_id: userId,
                type: 'WITHDRAW_COMPLETED',
                points: 0,
                tk_amount: 0,
                meta_json: { request_id: id }
            });

            toast({ title: "Approved", description: "Withdrawal request approved." });
            fetchRequests();

        } catch (error: any) {
            console.error(error);
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    };

    const handleReject = async (id: string, userId: string, points: number) => {
        if (!confirm("Are you sure you want to REJECT this request? Points will be refunded.")) return;

        try {
            // 1. Update Status
            const { error: updateError } = await supabase
                .from('withdraw_requests' as any)
                .update({ status: 'REJECTED' })
                .eq('id', id);

            if (updateError) throw updateError;

            // 2. Refund Points
            // First get current points
            const { data: profile } = await supabase.from('profiles').select('loyalty_points').eq('id', userId).single();
            const currentPoints = (profile as any)?.loyalty_points || 0;

            const { error: refundError } = await supabase
                .from('profiles')
                .update({ loyalty_points: currentPoints + points } as any)
                .eq('id', userId);

            if (refundError) throw refundError;

            // 3. Log
            await (supabase.from('loyalty_transactions' as any) as any).insert({
                user_id: userId,
                type: 'WITHDRAW_REJECTED_REFUND',
                points: points,
                tk_amount: 0,
                meta_json: { request_id: id }
            });

            toast({ title: "Rejected", description: "Request rejected and points refunded." });
            fetchRequests();

        } catch (error: any) {
            console.error(error);
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Withdrawal Requests</CardTitle>
                <CardDescription>Manage user withdrawal requests</CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>User</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Method</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {requests.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground">No pending requests.</TableCell>
                                </TableRow>
                            ) : (
                                requests.map((req) => (
                                    <TableRow key={req.id}>
                                        <TableCell>{new Date(req.created_at).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{(req.profiles as any)?.full_name || 'Unknown'}</span>
                                                <span className="text-xs text-muted-foreground">{(req.profiles as any)?.phone || 'No Phone'}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-bold">৳{req.withdraw_tk}</span>
                                                <span className="text-xs text-muted-foreground">{req.points_amount} pts</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {req.method} <br />
                                            <span className="text-xs text-muted-foreground">{req.number}</span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={
                                                req.status === 'COMPLETED' ? 'default' :
                                                    req.status === 'REJECTED' ? 'destructive' : 'secondary'
                                            }>
                                                {req.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {req.status === 'PROCESSING' && (
                                                <div className="flex justify-end gap-2">
                                                    <Button size="sm" variant="outline" className="text-green-600 hover:text-green-700" onClick={() => handleApprove(req.id, req.user_id, req.points_amount)}>
                                                        <Check className="h-4 w-4" />
                                                    </Button>
                                                    <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700" onClick={() => handleReject(req.id, req.user_id, req.points_amount)}>
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
};

export default WithdrawalsTab;
