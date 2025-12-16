import React, { useState } from 'react';
import { Star, Edit2, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useReviews } from '@/context/ReviewContext';
import { useAuth } from '@/context/AuthContext';
import { Review } from '@/types/review';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import ReviewForm from './ReviewForm';

interface ReviewListProps {
    productId: string;
}

const ReviewList: React.FC<ReviewListProps> = ({ productId }) => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const { getProductReviews, deleteReview } = useReviews();
    const { toast } = useToast();

    const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
    const reviews = getProductReviews(productId);

    const handleDelete = async (reviewId: string) => {
        if (!confirm(t('review.confirmDelete'))) {
            return;
        }

        const result = await deleteReview(reviewId);
        if (result.success) {
            toast({
                title: t('review.success'),
                description: t('review.deleteSuccess'),
            });
        } else {
            toast({
                title: t('review.error'),
                description: result.error || t('review.deleteError'),
                variant: 'destructive',
            });
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMs = now.getTime() - date.getTime();
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

        if (diffInDays === 0) {
            return t('review.today');
        } else if (diffInDays === 1) {
            return t('review.yesterday');
        } else if (diffInDays < 7) {
            return t('review.daysAgo', { count: diffInDays });
        } else if (diffInDays < 30) {
            const weeks = Math.floor(diffInDays / 7);
            return t('review.weeksAgo', { count: weeks });
        } else if (diffInDays < 365) {
            const months = Math.floor(diffInDays / 30);
            return t('review.monthsAgo', { count: months });
        } else {
            return date.toLocaleDateString();
        }
    };

    if (reviews.length === 0) {
        return (
            <div className="text-center py-12">
                <Star className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                    {t('review.noReviews')}
                </h3>
                <p className="text-muted-foreground">
                    {t('review.beTheFirst')}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {reviews.map((review) => {
                const isOwnReview = user?.id === review.userId;
                const isEditing = editingReviewId === review.id;

                if (isEditing) {
                    return (
                        <div key={review.id}>
                            <ReviewForm
                                productId={productId}
                                existingReview={{
                                    id: review.id,
                                    rating: review.rating,
                                    comment: review.comment,
                                }}
                                onSuccess={() => setEditingReviewId(null)}
                                onCancel={() => setEditingReviewId(null)}
                            />
                        </div>
                    );
                }

                return (
                    <div key={review.id} className="border-b border-border pb-6 last:border-b-0">
                        <div className="flex items-start justify-between mb-2">
                            <div>
                                <span className="font-semibold text-foreground">{review.userName}</span>
                                {review.status === 'pending' && (
                                    <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full dark:bg-yellow-900 dark:text-yellow-200">
                                        {t('review.pendingApproval', 'Pending Approval')}
                                    </span>
                                )}
                                {review.updatedAt !== review.createdAt && (
                                    <span className="text-xs text-muted-foreground ml-2">
                                        ({t('review.edited')})
                                    </span>
                                )}
                            </div>
                            <span className="text-sm text-muted-foreground">
                                {formatDate(review.createdAt)}
                            </span>
                        </div>

                        {/* Star Rating Display */}
                        <div className="flex items-center gap-1 mb-3">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    className={cn(
                                        'h-4 w-4',
                                        star <= review.rating
                                            ? 'text-gold fill-gold'
                                            : 'text-muted-foreground'
                                    )}
                                />
                            ))}
                        </div>

                        {/* Review Comment */}
                        {review.comment && (
                            <p className="text-muted-foreground mb-3 whitespace-pre-wrap">
                                {review.comment}
                            </p>
                        )}

                        {/* Action Buttons (only for own reviews) */}
                        {isOwnReview && (
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setEditingReviewId(review.id)}
                                    className="gap-1"
                                >
                                    <Edit2 className="h-3 w-3" />
                                    {t('review.edit')}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDelete(review.id)}
                                    className="gap-1 text-destructive hover:text-destructive"
                                >
                                    <Trash2 className="h-3 w-3" />
                                    {t('review.delete')}
                                </Button>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default ReviewList;
