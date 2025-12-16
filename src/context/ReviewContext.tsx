import React, { createContext, useContext, useState, useEffect } from 'react';
import { Review, ReviewFormData, ProductReviewStats } from '@/types/review';
import { useAuth } from './AuthContext';

interface ReviewContextType {
    reviews: Review[];
    addReview: (productId: string, data: ReviewFormData) => Promise<{ success: boolean; error?: string }>;
    updateReview: (reviewId: string, data: ReviewFormData) => Promise<{ success: boolean; error?: string }>;
    deleteReview: (reviewId: string) => Promise<{ success: boolean; error?: string }>;
    getProductReviews: (productId: string) => Review[];
    getUserReview: (productId: string, userId: string) => Review | undefined;
    getProductStats: (productId: string) => ProductReviewStats;
}

const ReviewContext = createContext<ReviewContextType | undefined>(undefined);

const STORAGE_KEY = 'shopvely_reviews';

export const ReviewProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, profile, isAdmin } = useAuth();
    const [reviews, setReviews] = useState<Review[]>([]);

    // Load reviews from localStorage on mount
    useEffect(() => {
        const storedReviews = localStorage.getItem(STORAGE_KEY);
        if (storedReviews) {
            try {
                setReviews(JSON.parse(storedReviews));
            } catch (error) {
                console.error('Failed to load reviews:', error);
                setReviews([]);
            }
        }
    }, []);

    // Save reviews to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
    }, [reviews]);

    const addReview = async (productId: string, data: ReviewFormData): Promise<{ success: boolean; error?: string }> => {
        if (!user) {
            return { success: false, error: 'You must be logged in to submit a review' };
        }

        if (data.rating < 1 || data.rating > 5) {
            return { success: false, error: 'Rating must be between 1 and 5' };
        }

        // Check if user already reviewed this product
        const existingReview = reviews.find(r => r.productId === productId && r.userId === user.id);
        if (existingReview) {
            return { success: false, error: 'You have already reviewed this product. Please edit your existing review.' };
        }

        const newReview: Review = {
            id: `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            productId,
            userId: user.id,
            userName: profile?.full_name || user.email?.split('@')[0] || 'Anonymous',
            userEmail: user.email || '',
            rating: data.rating,
            comment: data.comment.trim(),
            status: 'pending', // Default to pending
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        setReviews(prev => [...prev, newReview]);
        return { success: true };
    };

    const updateReview = async (reviewId: string, data: ReviewFormData): Promise<{ success: boolean; error?: string }> => {
        if (!user) {
            return { success: false, error: 'You must be logged in to update a review' };
        }

        if (data.rating < 1 || data.rating > 5) {
            return { success: false, error: 'Rating must be between 1 and 5' };
        }

        const reviewIndex = reviews.findIndex(r => r.id === reviewId);
        if (reviewIndex === -1) {
            return { success: false, error: 'Review not found' };
        }

        const review = reviews[reviewIndex];
        if (review.userId !== user.id && !isAdmin) {
            return { success: false, error: 'You can only edit your own reviews' };
        }

        // Determine new status
        // If admin provides a status, use it.
        // If user edits, reset to pending.
        let newStatus = data.status || 'pending';

        if (!isAdmin) {
            // Force pending for non-admins (regular user edits)
            newStatus = 'pending';
        }

        const updatedReview: Review = {
            ...review,
            rating: data.rating,
            comment: data.comment.trim(),
            status: newStatus as 'pending' | 'approved' | 'rejected',
            updatedAt: new Date().toISOString(),
        };

        setReviews(prev => {
            const newReviews = [...prev];
            newReviews[reviewIndex] = updatedReview;
            return newReviews;
        });

        return { success: true };
    };

    const deleteReview = async (reviewId: string): Promise<{ success: boolean; error?: string }> => {
        if (!user) {
            return { success: false, error: 'You must be logged in to delete a review' };
        }

        const review = reviews.find(r => r.id === reviewId);
        if (!review) {
            return { success: false, error: 'Review not found' };
        }

        if (review.userId !== user.id) {
            return { success: false, error: 'You can only delete your own reviews' };
        }

        setReviews(prev => prev.filter(r => r.id !== reviewId));
        return { success: true };
    };

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
                getProductReviews: (id) => getProductReviews(id), // Only public interface
                getUserReview,
                getProductStats,
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
