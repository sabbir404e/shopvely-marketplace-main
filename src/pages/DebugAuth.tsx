import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

const DebugAuth = () => {
    const { user, session } = useAuth();
    const [profile, setProfile] = useState<any>(null);
    const [rpcResult, setRpcResult] = useState<any>(null);
    const [fetchError, setFetchError] = useState<any>(null);
    const [rpcError, setRpcError] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const runChecks = async () => {
        setLoading(true);
        setFetchError(null);
        setRpcError(null);
        setProfile(null);
        setRpcResult(null);

        if (!user) {
            setLoading(false);
            return;
        }

        // 1. Fetch Profile Direct
        const { data: profileData, error: pError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();

        setProfile(profileData);
        setFetchError(pError);

        // 2. Call RPC has_role
        const { data: rpcData, error: rError } = await supabase.rpc('has_role', {
            _user_id: user.id,
            _role: 'admin'
        });

        setRpcResult(rpcData);
        setRpcError(rError);

        setLoading(false);
    };

    useEffect(() => {
        runChecks();
    }, [user]);

    return (
        <div className="p-10 max-w-4xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold">Authentication Debugger</h1>

            <div className="p-4 border rounded bg-gray-50">
                <h2 className="font-bold">1. Auth State</h2>
                <p><strong>User ID:</strong> {user?.id || 'Not logged in'}</p>
                <p><strong>Email:</strong> {user?.email}</p>
                <p><strong>Session Expires:</strong> {session?.expires_at ? new Date(session.expires_at * 1000).toLocaleString() : 'N/A'}</p>
            </div>

            <div className="p-4 border rounded bg-gray-50">
                <h2 className="font-bold">2. Profile Table (RLS Check)</h2>
                {fetchError ? (
                    <div className="text-red-600">
                        Error: {JSON.stringify(fetchError)}
                    </div>
                ) : (
                    <pre className="bg-white p-2 border text-xs overflow-auto">
                        {profile ? JSON.stringify(profile, null, 2) : 'No Profile Found (RLS blocking or row missing)'}
                    </pre>
                )}
            </div>

            <div className="p-4 border rounded bg-gray-50">
                <h2 className="font-bold">3. RPC 'has_role' Check</h2>
                {rpcError ? (
                    <div className="text-red-600">
                        Error: {JSON.stringify(rpcError)}
                    </div>
                ) : (
                    <div>
                        <p><strong>Is Admin?</strong> {rpcResult === true ? 'TRUE (YES)' : 'FALSE (NO)'}</p>
                        <pre className="bg-white p-2 border text-xs">{JSON.stringify(rpcResult)}</pre>
                    </div>
                )}
            </div>

            <Button onClick={runChecks} disabled={loading}>
                {loading ? 'Running Checks...' : 'Re-run Checks'}
            </Button>

            <div className="mt-4">
                <p className="text-sm text-gray-500">Take a screenshot of this page and send it to me.</p>
            </div>
        </div>
    );
};

export default DebugAuth;
