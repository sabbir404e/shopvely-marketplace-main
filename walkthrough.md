# Loyalty & Referral System Implementation

## Overview
A complete Referral and Loyalty Point system has been implemented. Users can refer friends, earn points on purchases (commission), and withdraw points as cash (Tk). Admins can manage orders to credit points and process withdrawal requests.

## Features

### 1. Referral System
- **Sign Up**: New users can enter a `Referral Code` during signup.
- **Tracking**: The referrer is linked to the new user via `referred_by_user_id` in the database.
- **Code Generation**: Every user gets a unique `referral_code` upon registration.
- **Prevention**: Users cannot refer themselves.

### 2. Loyalty Points (Commission)
- **Earning Rule**: Referrers earn **5%** commission on the product price of orders made by their referred users.
- **Conversion**: Commission (Tk) is converted to points. **1 Tk = 10 Points**.
- **Crediting**: Points are **ONLY** credited when an Admin marks an order as **"Deal Complete (Credit Points)"**.
    - This ensures points are not awarded for cancelled or returned orders.
    - Transaction is logged in `loyalty_transactions` table.

### 3. Withdrawal System
- **User Interface**: 
    - **Account Page**: Users can view their Loyalty Points and Referral Code.
    - **Request Withdraw**: Users can request a withdrawal via a Modal (min 100 points).
    - **History**: Users can view the status of their withdrawal requests.
- **Admin Interface**:
    - **Withdrawals Tab**: A new tab in the Admin Dashboard lists all pending requests.
    - **Approve**: Admin can approve a request (mark as COMPLETED).
    - **Reject**: Admin can reject a request (mark as REJECTED). **rejected points are instantly refunded** to the user's balance.

## Database Changes
The `supabase_schema.sql` has been updated with:
- **Profiles Table**: Added `loyalty_points`, `referral_code`, `referred_by_user_id`.
- **New Tables**:
    - `loyalty_transactions`: Logs earning and withdrawal events.
    - `withdraw_requests`: Stores user withdrawal requests.

## How to Test

### User Side
1.  **Register** a new account (User A). Note their Referral Code from the Account page.
2.  **Register** another account (User B) using User A's referral code.
3.  **Place an Order** as User B.

### Admin Side
1.  Go to **Admin Dashboard -> Orders**.
2.  Find User B's order.
3.  Change Status to **"Deal Complete (Credit Points)"**.
    - *Result*: User A's `loyalty_points` should increase.

### Withdrawal
1.  Login as User A.
2.  Go to **Account -> Withdraw Points**.
3.  Submit a request.
4.  Login as Admin.
5.  Go to **Admin Dashboard -> Withdrawals**.
6.  Approve or Reject the request.

## Files Modified
- `src/pages/Auth.tsx`: Signup with referral code.
- `src/context/AuthContext.tsx`: Referral logic in signUp.
- `src/pages/Checkout.tsx`: Saving `customerId` with orders.
- `src/pages/Account.tsx`: Loyalty UI and Withdrawals.
- `src/pages/admin/tabs/OrdersTab.tsx`: "Deal Complete" logic.
- `src/pages/admin/tabs/WithdrawalsTab.tsx`: **[NEW]** Withdrawal management.
- `src/pages/admin/Dashboard.tsx`: Added Withdrawals tab.
- `supabase_schema.sql`: Database updates.
