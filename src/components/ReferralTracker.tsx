
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const ReferralTracker = () => {
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const refCode = searchParams.get('ref');
        if (refCode) {
            localStorage.setItem('referralCode', refCode);
            // Optional: Clean URL? No, keep it simple for now so user sees it.
        }
    }, [searchParams]);

    return null;
};

export default ReferralTracker;
