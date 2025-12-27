import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

import { useTranslation } from 'react-i18next';

const Auth: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(searchParams.get('mode') !== 'signup');

  useEffect(() => {
    setIsLogin(searchParams.get('mode') !== 'signup');

    // Auto-fill referral code
    const refCode = searchParams.get('ref') || localStorage.getItem('referralCode');
    if (refCode && !isLogin) {
      setFormData(prev => ({ ...prev, referralCode: refCode }));
    }
  }, [searchParams, isLogin]);

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    referralCode: ''
  });

  const { user, signIn, signUp, signInWithGoogle, signInWithFacebook, resetPassword } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isResetLoading, setIsResetLoading] = useState(false);

  // Schema defined inside component to use translations
  const loginSchema = z.object({
    email: z.string().email(t('auth.validation.validEmail')),
    password: z.string().min(6, t('auth.validation.passwordLength'))
  });

  const signupSchema = z.object({
    fullName: z.string().min(2, t('auth.validation.nameLength')).max(100, t('auth.validation.nameTooLong')),
    email: z.string().email(t('auth.validation.validEmail')),
    password: z.string().min(6, t('auth.validation.passwordLength')),
    confirmPassword: z.string(),
    referralCode: z.string().optional()
  }).refine((data) => data.password === data.confirmPassword, {
    message: t('auth.validation.passwordMismatch'),
    path: ["confirmPassword"]
  });

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      toast({
        title: t('review.error'),
        description: t('auth.validation.validEmail'),
        variant: "destructive"
      });
      return;
    }

    setIsResetLoading(true);
    try {
      const { error } = await resetPassword(resetEmail);
      if (error) {
        toast({
          title: t('review.error'),
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Check your email",
          description: "We have sent a password reset link to your email address.",
        });
        setIsResetOpen(false);
        setResetEmail('');
      }
    } catch (error) {
      toast({
        title: t('review.error'),
        description: "Something went wrong",
        variant: "destructive"
      });
    } finally {
      setIsResetLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      if (isLogin) {
        const result = loginSchema.safeParse({
          email: formData.email,
          password: formData.password
        });

        if (!result.success) {
          const fieldErrors: Record<string, string> = {};
          result.error.errors.forEach(err => {
            if (err.path[0]) {
              fieldErrors[err.path[0] as string] = err.message;
            }
          });
          setErrors(fieldErrors);
          setIsLoading(false);
          return;
        }

        const { error } = await signIn(formData.email, formData.password);

        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast({
              title: "Login failed",
              description: "Invalid email or password. Please try again.",
              variant: "destructive"
            });
          } else {
            toast({
              title: "Login failed",
              description: error.message,
              variant: "destructive"
            });
          }
        } else {
          toast({
            title: t('auth.loginTitle'),
            description: "You have successfully logged in."
          });
          navigate('/');
        }
      } else {
        const result = signupSchema.safeParse(formData);

        if (!result.success) {
          const fieldErrors: Record<string, string> = {};
          result.error.errors.forEach(err => {
            if (err.path[0]) {
              fieldErrors[err.path[0] as string] = err.message;
            }
          });
          setErrors(fieldErrors);
          setIsLoading(false);
          return;
        }

        const { error } = await signUp(formData.email, formData.password, formData.fullName, formData.referralCode);

        if (error) {
          if (error.message.includes('already registered')) {
            toast({
              title: "Account exists",
              description: "An account with this email already exists. Please login instead.",
              variant: "destructive"
            });
            setIsLogin(true);
          } else {
            toast({
              title: "Sign up failed",
              description: error.message,
              variant: "destructive"
            });
          }
        } else {
          toast({
            title: "Account created!",
            description: "Please check your email to verify your account."
          });
        }
      }
    } catch (error) {
      toast({
        title: t('review.error'),
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await signInWithGoogle();
      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Google Login failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleFacebookLogin = async () => {
    try {
      const { error } = await signInWithFacebook();
      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Facebook Login failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md animate-fade-in">
          <CardHeader className="space-y-1 text-center">
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4 self-start">
              <ArrowLeft className="h-4 w-4" />
              {t('auth.backToHome')}
            </Link>
            <CardTitle className="text-2xl font-bold">
              {isLogin ? t('auth.loginTitle') : t('auth.signupTitle')}
            </CardTitle>
            <CardDescription>
              {isLogin
                ? t('auth.enterCredentials')
                : t('auth.fillDetails')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="fullName">{t('auth.fullName')}</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    placeholder="John Doe"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className={errors.fullName ? 'border-destructive' : ''}
                  />
                  {errors.fullName && (
                    <p className="text-sm text-destructive">{errors.fullName}</p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">{t('auth.email')}</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={errors.email ? 'border-destructive' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t('auth.password')}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
                {isLogin && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setIsResetOpen(true)}
                      className="text-sm text-primary hover:underline"
                    >
                      {t('auth.forgotPassword')}
                    </button>
                  </div>
                )}
              </div>

              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{t('auth.confirmPassword')}</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={errors.confirmPassword ? 'border-destructive' : ''}
                  />
                  {errors.confirmPassword && (
                    <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                  )}
                </div>
              )}

              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="referralCode">{t('auth.referralCode') || "Referral Code (Optional)"}</Label>
                  <Input
                    id="referralCode"
                    name="referralCode"
                    placeholder="Enter referral code"
                    value={formData.referralCode || ''}
                    onChange={handleInputChange}
                  />
                </div>
              )}

              <Button type="submit" className="w-full btn-primary" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLogin ? t('auth.loginButton') : t('auth.signupButton')}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">{t('auth.orContinue')}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Button variant="outline" type="button" onClick={handleGoogleLogin} className="w-full relative">
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt="Google"
                  className="w-5 h-5 mr-2 absolute left-4"
                />
                {t('auth.continueGoogle')}
              </Button>
              <Button variant="outline" type="button" onClick={handleFacebookLogin} className="w-full relative">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/b/b8/2021_Facebook_icon.svg"
                  alt="Facebook"
                  className="w-5 h-5 mr-2 absolute left-4"
                />
                {t('auth.continueFacebook')}
              </Button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                {isLogin ? t('auth.noAccount') : t('auth.haveAccount')}
                <button
                  type="button"
                  onClick={() => {
                    const newMode = isLogin ? 'signup' : 'login';
                    const newParams = new URLSearchParams(searchParams);
                    newParams.set('mode', newMode);
                    setSearchParams(newParams);

                    setErrors({});
                    setFormData(prev => ({
                      ...prev,
                      fullName: '',
                      email: '',
                      password: '',
                      confirmPassword: '',
                      referralCode: prev.referralCode
                    }));
                  }}
                  className="ml-1 text-primary hover:underline font-medium"
                >
                  {isLogin ? t('auth.signupButton') : t('auth.loginButton')}
                </button>
              </p>
            </div>
          </CardContent>
        </Card>

        <Dialog open={isResetOpen} onOpenChange={setIsResetOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('auth.resetPasswordTitle')}</DialogTitle>
              <DialogDescription>
                {t('auth.resetPasswordDesc')}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">{t('auth.email')}</Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="name@example.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  disabled={isResetLoading}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsResetOpen(false)} disabled={isResetLoading}>
                  {t('common.cancel')}
                </Button>
                <Button type="submit" disabled={isResetLoading}>
                  {isResetLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t('auth.sendResetLink')}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </main>
      <Footer />
    </div>
  );
};

export default Auth;
