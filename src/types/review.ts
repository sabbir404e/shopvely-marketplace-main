export interface Review {
    id: string;
    productId: string;
    userId: string;
    userName: string;
    userEmail: string;
    rating: number; // 1-5
    comment: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
    updatedAt: string;
}

export interface ReviewFormData {
    rating: number;
    comment: string;
    status?: 'pending' | 'approved' | 'rejected';
}

export interface ProductReviewStats {
    averageRating: number;
    totalReviews: number;
    ratingDistribution: {
        1: number;
        2: number;
        3: number;
        4: number;
        5: number;
    };
}
