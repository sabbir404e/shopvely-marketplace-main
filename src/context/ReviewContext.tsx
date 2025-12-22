import React, { createContext, useContext, useState, useEffect } from 'react';
import { Review, ReviewFormData, ProductReviewStats } from '@/types/review';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface ReviewContextType {
    reviews: Review[];
    addReview: (productId: string, data: ReviewFormData) => Promise<{ success: boolean; error?: string }>;
    updateReview: (reviewId: string, data: ReviewFormData) => Promise<{ success: boolean; error?: string }>;
    deleteReview: (reviewId: string) => Promise<{ success: boolean; error?: string }>;
    getProductReviews: (productId: string) => Review[];
    getUserReview: (productId: string, userId: string) => Review | undefined;
    getProductStats: (productId: string) => ProductReviewStats;
    refreshReviews: () => Promise<void>;
}

const ReviewContext = createContext<ReviewContextType | undefined>(undefined);

export const ReviewProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, isAdmin } = useAuth();
    const [reviews, setReviews] = useState<Review[]>([]);

    const fetchReviews = async () => {
        try {
            // Fetch reviews with user info
            const { data, error } = await (supabase as any)
                .from('reviews')
                .select(`
                    id,
                    product_id,
                    user_id,
                    rating,
                    comment,
                    is_approved,
                    created_at,
                    updated_at,
                    profiles:user_id ( full_name, email )
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (data) {
                const mappedReviews: Review[] = data.map((r: any) => ({
                    id: r.id,
                    productId: r.product_id,
                    userId: r.user_id,
                    userName: r.profiles?.full_name || 'Anonymous',
                    userEmail: r.profiles?.email || '',
                    rating: r.rating,
                    comment: r.comment,
                    status: r.is_approved ? 'approved' : 'pending',
                    createdAt: r.created_at,
                    updatedAt: r.updated_at
                }));
                setReviews(mappedReviews);
            }
        } catch (error) {
            console.error('Failed to fetch reviews:', error);
            // Don't show toast on every fetch error to avoid spamming
        }
    };

    useEffect(() => {
        fetchReviews();
        // Subscribe to changes? For now, just fetch on mount and after actions.
    }, []);

    const refreshReviews = async () => {
        await fetchReviews();
    };

    const addReview = async (productId: string, data: ReviewFormData): Promise<{ success: boolean; error?: string }> => {
        if (!user) {
            return { success: false, error: 'You must be logged in to submit a review' };
        }

        if (data.rating < 1 || data.rating > 5) {
            return { success: false, error: 'Rating must be between 1 and 5' };
        }

        // Check if user already reviewed this product (Frontend check, DB constraint ensures it too but better UX here)
        // Wait, DB constraint isn't strictly unique(user_id, product_id) in schema provided? 
        // Let's check schema... "unique(user_id, product_id)" wasn't explicitly seen in 'reviews' table definition in step 315.
        // It's better to check.
        const existingReview = reviews.find(r => r.productId === productId && r.userId === user.id);
        if (existingReview) {
            return { success: false, error: 'You have already reviewed this product. Please edit your existing review.' };
        }

        try {
            const { error } = await (supabase as any)
                .from('reviews')
                .insert({
                    user_id: user.id,
                    product_id: productId,
                    rating: data.rating,
                    comment: data.comment.trim(),
                    is_approved: false // Always pending initially
                });

            if (error) throw error;

            toast({ title: 'Review Submitted', description: 'Your review is pending approval.' });
            await fetchReviews();
            return { success: true };

        } catch (error: any) {
            console.error("Failed to add review:", error);
            return { success: false, error: error.message || "Failed to submit review" };
        }
    };

    const updateReview = async (reviewId: string, data: ReviewFormData): Promise<{ success: boolean; error?: string }> => {
        if (!user) {
            return { success: false, error: 'You must be logged in to update a review' };
        }

        const review = reviews.find(r => r.id === reviewId);
        if (!review) return { success: false, error: 'Review not found' };

        if (review.userId !== user.id && !isAdmin) {
            return { success: false, error: 'You can only edit your own reviews' };
        }

        try {
            const updates: any = {
                rating: data.rating,
                comment: data.comment.trim(),
                updated_at: new Date().toISOString()
            };

            // If admin, allowing status change
            if (isAdmin && data.status) {
                updates.is_approved = data.status === 'approved';
            } else if (!isAdmin) {
                // If user edits, reset to pending?
                // Depending on policy. Usually yes.
                updates.is_approved = false;
            }

            const { error } = await (supabase as any)
                .from('reviews')
                .update(updates)
                .eq('id', reviewId);

            if (error) throw error;

            toast({ title: 'Review Updated' });
            await fetchReviews();
            return { success: true };

        } catch (error: any) {
            console.error("Failed to update review:", error);
            return { success: false, error: error.message };
        }
    };

    const deleteReview = async (reviewId: string): Promise<{ success: boolean; error?: string }> => {
        if (!user) {
            return { success: false, error: 'You must be logged in to delete a review' };
        }

        const review = reviews.find(r => r.id === reviewId);
        if (!review) return { success: false, error: 'Review not found' };

        if (review.userId !== user.id && !isAdmin) {
            return { success: false, error: 'You can only delete your own reviews' };
        }

        try {
            const { error } = await (supabase as any)
                .from('reviews')
                .delete()
                .eq('id', reviewId);

            if (error) throw error;

            toast({ title: 'Review Deleted' });
            // Optimistic update
            setReviews(prev => prev.filter(r => r.id !== reviewId));
            return { success: true };

        } catch (error: any) {
            console.error("Failed to delete review:", error);
            return { success: false, error: error.message };
        }
    };

    // Public Helpers - these work from local "reviews" state which is now fetched from DB
    const getProductReviews = (productId: string, includePending = false): Review[] => {
        return reviews
            .filter(r => r.productId === productId && (includePending || r.status === 'approved'))
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    };

    const getUserReview = (productId: string, userId: string): Review | undefined => {
        return reviews.find(r => r.productId === productId && r.userId === userId);
    };

    const getProductStats = (productId: string): ProductReviewStats => {
        const productReviews = reviews.filter(r => r.productId === productId && r.status === 'approved');
        const totalReviews = productReviews.length;

        if (totalReviews === 0) {
            return {
                averageRating: 0,
                totalReviews: 0,
                ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
            };
        }

        const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        let totalRating = 0;

        productReviews.forEach(review => {
            totalRating += review.rating;
            ratingDistribution[review.rating as keyof typeof ratingDistribution]++;
        });

        return {
            averageRating: Math.round((totalRating / totalReviews) * 10) / 10,
            totalReviews,
            ratingDistribution,
        };
    };

    return (
        <ReviewContext.Provider
            value={{
                reviews,
                addReview,
                updateReview,
                deleteReview,
                getProductReviews: (id) => getProductReviews(id),
                getUserReview,
                getProductStats,
                refreshReviews
            }}
        >
            {children}
        </ReviewContext.Provider>
    );
};

export const useReviews = () => {
    const context = useContext(ReviewContext);
    if (context === undefined) {
        throw new Error('useReviews must be used within a ReviewProvider');
    }
    return context;
};
