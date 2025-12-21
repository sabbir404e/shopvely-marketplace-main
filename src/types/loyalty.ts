export type TransactionType = 'EARN_REFERRAL' | 'WITHDRAW_REQUEST' | 'WITHDRAW_COMPLETED' | 'WITHDRAW_REJECTED_REFUNDED';
export type WithdrawStatus = 'PROCESSING' | 'COMPLETED' | 'REJECTED';
export type PayoutMethod = 'BKASH' | 'NAGAD';

export interface LoyaltyTransaction {
    id: string;
    user_id: string;
    type: TransactionType;
    points: number;
    tk_amount?: number;
    order_id?: string;
    meta_json?: any;
    created_at: string;
}

export interface WithdrawRequest {
    id: string;
    user_id: string;
    points_amount: number;
    withdraw_tk: number;
    method: PayoutMethod;
    number: string;
    status: WithdrawStatus;
    note?: string;
    processed_by_admin_id?: string;
    processed_at?: string;
    created_at: string;
}

export interface LoyaltyStats {
    pointsBalance: number;
    totalEarned: number;
    totalWithdrawn: number;
}
