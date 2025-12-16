import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { User, Mail, Phone, Star, Gift, Copy, LogOut, Shield, Loader2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const Account: React.FC = () => {
  const { user, profile, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

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
                  Loyalty Points
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
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    Earn points with every purchase. 100 points = ৳50 discount!
                  </p>
                </div>
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
                      Share this code or link with friends. You both get 50 points when they make their first purchase!
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
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Account;
