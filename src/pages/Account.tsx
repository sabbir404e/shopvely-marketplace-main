import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { User, Mail, Phone, Star, Gift, Copy, LogOut, Shield, Loader2, CreditCard, History } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from '@/integrations/supabase/client';

const Account: React.FC = () => {
  const { user, profile, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isWithdrawOpen, setIsWithdrawOpen] = React.useState(false);
  const [withdrawAmount, setWithdrawAmount] = React.useState('');
  const [paymentMethod, setPaymentMethod] = React.useState('BKASH');
  const [paymentNumber, setPaymentNumber] = React.useState('');
  const [withdrawHistory, setWithdrawHistory] = React.useState<any[]>([]);
  const [isWithdrawing, setIsWithdrawing] = React.useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
    if (user) {
      fetchWithdrawHistory();
    }
  }, [user, loading, navigate]);



  const fetchWithdrawHistory = async () => {
    const { data } = await supabase
      .from('withdraw_requests' as any)
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });

    if (data) {
      setWithdrawHistory(data);
    }
  };

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;

    const points = parseInt(withdrawAmount);
    if (isNaN(points) || points <= 0) {
      toast({ title: "Invalid Amount", description: "Please enter a valid point amount.", variant: "destructive" });
      return;
    }

    if (points > profile.loyalty_points) {
      toast({ title: "Insufficient Points", description: "You do not have enough points.", variant: "destructive" });
      return;
    }

    // Minimum withdraw check (Optional: 10 TK = 100 Points)
    if (points < 1000) {
      toast({ title: "Minimum Withdraw", description: "Minimum withdrawal is 1000 points (100 TK).", variant: "destructive" });
      return;
    }

    setIsWithdrawing(true);
    try {
      const withdrawTk = points / 10;

      // 1. Deduct Points
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ loyalty_points: profile.loyalty_points - points } as any)
        .eq('id', user.id);

      if (updateError) throw updateError;

      // 2. Create Withdraw Request
      const { error: insertError } = await (supabase.from('withdraw_requests' as any) as any).insert({
        user_id: user.id,
        points_amount: points,
        withdraw_tk: withdrawTk,
        method: paymentMethod,
        number: paymentNumber,
        status: 'PROCESSING'
      });

      if (insertError) throw insertError;

      // 3. Log Transaction
      await (supabase.from('loyalty_transactions' as any) as any).insert({
        user_id: user.id,
        type: 'WITHDRAW_REQUEST',
        points: -points,
        tk_amount: withdrawTk,
        created_at: new Date().toISOString()
      });

      toast({ title: "Request Submitted", description: `Withdrawal request for ৳${withdrawTk} submitted.` });
      setIsWithdrawOpen(false);
      setWithdrawAmount('');
      setPaymentNumber('');
      fetchWithdrawHistory();
      window.location.reload(); // Refresh to update profile context context
    } catch (error: any) {
      console.error('Withdraw Error:', error);
      toast({ title: "Error", description: error.message || "Failed to process request.", variant: "destructive" });
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleCopyReferral = () => {
    if (profile?.referral_code) {
      navigator.clipboard.writeText(profile.referral_code);
      toast({
        title: "Copied!",
        description: "Referral code copied to clipboard."
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You have been successfully signed out."
    });
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 py-8">
        <div className="container-main">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">My Account</h1>
              <p className="text-muted-foreground">Manage your profile and preferences</p>
            </div>
            {isAdmin && (
              <Link to="/admin">
                <Button variant="outline" className="gap-2">
                  <Shield className="h-4 w-4" />
                  Admin Dashboard
                </Button>
              </Link>
            )}
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Profile Card */}
            <Card className="md:col-span-2 lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Profile Information
                </CardTitle>
                <CardDescription>Your personal details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    {profile?.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt="Avatar"
                        className="h-16 w-16 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-8 w-8 text-primary" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-foreground">
                      {profile?.full_name || 'No name set'}
                    </h3>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span className="text-sm">{user.email}</span>
                    </div>
                    {profile?.phone && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span className="text-sm">{profile.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
                {isAdmin && (
                  <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                    <Shield className="h-3 w-3 mr-1" />
                    Admin
                  </Badge>
                )}
              </CardContent>
            </Card>

            {/* Loyalty Points Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-gold" />
                  SV Points
                </CardTitle>
                <CardDescription>Your reward balance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <span className="text-4xl font-bold text-primary">
                    {profile?.loyalty_points || 0}
                  </span>
                  <p className="text-sm text-muted-foreground mt-1">points available</p>
                </div>
                <div className="mt-4 p-3 bg-muted rounded-lg mb-4">
                  <p className="text-xs text-muted-foreground text-center">
                    10 points = ৳1. Minimum withdraw: 1000 points.
                  </p>
                </div>
                <Dialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full gap-2">
                      <CreditCard className="h-4 w-4" />
                      Withdraw Points
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Withdraw SV Points</DialogTitle>
                      <DialogDescription>
                        Convert your points to cash. Rate: 10 Points = 1 BDT.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleWithdrawSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label>Points to Withdraw (Available: {profile?.loyalty_points})</Label>
                        <Input
                          type="number"
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(e.target.value)}
                          placeholder="Min 1000"
                          max={profile?.loyalty_points}
                        />
                        {withdrawAmount && (
                          <p className="text-sm text-muted-foreground">
                            You will receive: ৳{parseInt(withdrawAmount || '0') / 10}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>Payment Method</Label>
                        <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="BKASH">bKash</SelectItem>
                            <SelectItem value="NAGAD">Nagad</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Mobile Number</Label>
                        <Input
                          value={paymentNumber}
                          onChange={(e) => setPaymentNumber(e.target.value)}
                          placeholder="017xxxxxxxx"
                        />
                      </div>
                      <DialogFooter>
                        <Button type="submit" disabled={isWithdrawing}>
                          {isWithdrawing ? "Processing..." : "Submit Request"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            {/* Referral Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5 text-accent" />
                  Referral Program
                </CardTitle>
                <CardDescription>Share and earn rewards</CardDescription>
              </CardHeader>
              <CardContent>
                {profile?.referral_code ? (
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Your Code</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 px-4 py-2 bg-muted rounded-lg font-mono text-lg tracking-wider text-center">
                          {profile.referral_code}
                        </div>
                        <Button size="icon" variant="outline" onClick={handleCopyReferral}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Your Link</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 px-3 py-2 bg-muted rounded-lg text-sm truncate">
                          {`${window.location.origin}/?ref=${profile.referral_code}`}
                        </div>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/?ref=${profile.referral_code}`);
                            toast({
                              title: "Copied!",
                              description: "Referral link copied to clipboard."
                            });
                          }}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Share this code or link with friends. You will get a 5% commission when they make any purchase!
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Referral code not available
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions Card */}
            <Card className="md:col-span-2 lg:col-span-2">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                <Link to="/shop">
                  <Button variant="outline">Continue Shopping</Button>
                </Link>
                <Link to="/wishlist">
                  <Button variant="outline">View Wishlist</Button>
                </Link>
                <Link to="/cart">
                  <Button variant="outline">View Cart</Button>
                </Link>
                <Button
                  variant="outline"
                  className="text-destructive hover:text-destructive"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Withdraw History */}
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Withdraw History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {withdrawHistory.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">No withdraw requests found.</TableCell>
                      </TableRow>
                    ) : (
                      withdrawHistory.map((item: any) => (
                        <TableRow key={item.id}>
                          <TableCell>{new Date(item.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>{item.method} ({item.number})</TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-bold">৳{item.withdraw_tk}</span>
                              <span className="text-xs text-muted-foreground">{item.points_amount} pts</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={
                              item.status === 'COMPLETED' ? 'default' :
                                item.status === 'REJECTED' ? 'destructive' : 'secondary'
                            }>
                              {item.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Account;
