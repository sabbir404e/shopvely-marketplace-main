import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useReviews } from '@/context/ReviewContext';
import { useAuth } from '@/context/AuthContext';
import { ReviewFormData } from '@/types/review';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface ReviewFormProps {
    productId: string;
    existingReview?: {
        id: string;
        rating: number;
        comment: string;
    };
    onSuccess?: () => void;
    onCancel?: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ productId, existingReview, onSuccess, onCancel }) => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const { addReview, updateReview } = useReviews();
    const { toast } = useToast();

    const [rating, setRating] = useState(existingReview?.rating || 0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [comment, setComment] = useState(existingReview?.comment || '');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (existingReview) {
            setRating(existingReview.rating);
            setComment(existingReview.comment);
        }
    }, [existingReview]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            toast({
                title: t('review.error'),
                description: t('review.loginRequired'),
                variant: 'destructive',
            });
            return;
        }

        if (rating === 0) {
            toast({
                title: t('review.error'),
                description: t('review.ratingRequired'),
                variant: 'destructive',
            });
            return;
        }

        setIsSubmitting(true);

        const formData: ReviewFormData = {
            rating,
            comment: comment.trim(),
        };

        try {
            const result = existingReview
                ? await updateReview(existingReview.id, formData)
                : await addReview(productId, formData);

            if (result.success) {
                toast({
                    title: t('review.success'),
                    description: existingReview ? t('review.updateSuccess') : t('review.submitSuccess'),
                });

                // Reset form if it's a new review
                if (!existingReview) {
                    setRating(0);
                    setComment('');
                }

                onSuccess?.();
            } else {
                toast({
                    title: t('review.error'),
                    description: result.error || t('review.submitError'),
                    variant: 'destructive',
                });
            }
        } catch (error) {
            toast({
                title: t('review.error'),
                description: t('review.submitError'),
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!user) {
        return (
            <div className="bg-muted/50 rounded-lg p-6 text-center">
                <p className="text-muted-foreground">{t('review.loginToReview')}</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="bg-muted/50 rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-semibold text-foreground">
                {existingReview ? t('review.editYourReview') : t('review.writeReview')}
            </h3>

            {/* Star Rating Selector */}
            <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                    {t('review.yourRating')} <span className="text-destructive">*</span>
                </label>
                <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoveredRating(star)}
                            onMouseLeave={() => setHoveredRating(0)}
                            className="transition-transform hover:scale-110"
                        >
                            <Star
                                className={cn(
                                    'h-8 w-8 transition-colors',
                                    star <= (hoveredRating || rating)
                                        ? 'text-gold fill-gold'
                                        : 'text-muted-foreground'
                                )}
                            />
                        </button>
                    ))}
                </div>
            </div>

            {/* Comment Textarea */}
            <div>
                <label htmlFor="review-comment" className="block text-sm font-medium text-foreground mb-2">
                    {t('review.yourReview')}
                </label>
                <Textarea
                    id="review-comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder={t('review.reviewPlaceholder')}
                    rows={4}
                    className="resize-none"
                />
                <p className="text-xs text-muted-foreground mt-1">
                    {t('review.reviewHint')}
                </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
                <Button
                    type="submit"
                    disabled={isSubmitting || rating === 0}
                    className="btn-primary"
                >
                    {isSubmitting
                        ? t('common.loading')
                        : existingReview
                            ? t('review.updateReview')
                            : t('review.submitReview')}
                </Button>
                {existingReview && onCancel && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        disabled={isSubmitting}
                    >
                        {t('common.cancel')}
                    </Button>
                )}
            </div>
        </form>
    );
};

export default ReviewForm;
