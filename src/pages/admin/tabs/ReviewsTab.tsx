import React, { useState } from 'react';
import { useReviews } from '@/context/ReviewContext';
import { Review } from '@/types/review';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, X, Trash2, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getProductById } from '@/data/products';

const ReviewsTab: React.FC = () => {
    const { reviews, updateReview, deleteReview } = useReviews();
    const { toast } = useToast();
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

    // Filter reviews based on selection
    const filteredReviews = reviews.filter(review => {
        if (filter === 'all') return true;
        return review.status === filter;
    });

    // Sort by date (newest first)
    const sortedReviews = [...filteredReviews].sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return <Badge className="bg-green-500 hover:bg-green-600">Approved</Badge>;
            case 'rejected':
                return <Badge variant="destructive">Rejected</Badge>;
            default:
                return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" /> Pending</Badge>;
        }
    };

    const handleUpdateStatus = async (review: Review, newStatus: 'approved' | 'rejected') => {
        const result = await updateReview(review.id, {
            rating: review.rating,
            comment: review.comment,
            status: newStatus
        });

        if (result.success) {
            toast({
                title: "Status Updated",
                description: `Review marked as ${newStatus}`,
            });
        } else {
            toast({
                title: "Error",
                description: result.error || "Failed to update status",
                variant: "destructive",
            });
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this review?")) return;

        const result = await deleteReview(id);
        if (result.success) {
            toast({
                title: "Review Deleted",
                description: "The review has been permanently removed",
            });
        } else {
            toast({
                title: "Error",
                description: result.error || "Failed to delete review",
                variant: "destructive",
            });
        }
    };

    const getProductName = (productId: string) => {
        const product = getProductById(productId);
        return product ? product.name : 'Unknown Product';
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Reviews</h2>
                    <p className="text-muted-foreground">Manage and moderate customer reviews</p>
                </div>
            </div>

            <Tabs defaultValue="all" onValueChange={(v) => setFilter(v as any)}>
                <TabsList>
                    <TabsTrigger value="all">All ({reviews.length})</TabsTrigger>
                    <TabsTrigger value="pending">
                        Pending ({reviews.filter(r => r.status === 'pending').length})
                    </TabsTrigger>
                    <TabsTrigger value="approved">Approved</TabsTrigger>
                    <TabsTrigger value="rejected">Rejected</TabsTrigger>
                </TabsList>

                <TabsContent value={filter} className="space-y-4">
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead>User</TableHead>
                                    <TableHead>Rating</TableHead>
                                    <TableHead className="w-[300px]">Comment</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sortedReviews.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center">
                                            No reviews found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    sortedReviews.map((review) => (
                                        <TableRow key={review.id}>
                                            <TableCell className="font-medium max-w-[200px] truncate" title={getProductName(review.productId)}>
                                                {getProductName(review.productId)}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{review.userName}</span>
                                                    <span className="text-xs text-muted-foreground">{review.userEmail}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex text-gold">
                                                    {[...Array(review.rating)].map((_, i) => (
                                                        <span key={i}>★</span>
                                                    ))}
                                                </div>
                                            </TableCell>
                                            <TableCell className="max-w-[300px]">
                                                <p className="truncate" title={review.comment}>{review.comment}</p>
                                            </TableCell>
                                            <TableCell>{getStatusBadge(review.status)}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {new Date(review.createdAt).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    {review.status !== 'approved' && (
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                                            onClick={() => handleUpdateStatus(review, 'approved')}
                                                            title="Approve"
                                                        >
                                                            <Check className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                    {review.status !== 'rejected' && (
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                                            onClick={() => handleUpdateStatus(review, 'rejected')}
                                                            title="Reject"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                        onClick={() => handleDelete(review.id)}
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default ReviewsTab;
