import React from 'react';
import { Shield, Lock, Eye, Database, HelpCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Link } from 'react-router-dom';

const PrivacyPolicy: React.FC = () => {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header />

            <main className="flex-1">
                {/* Hero */}
                <section className="bg-gradient-hero py-12 lg:py-20">
                    <div className="container-main text-center">
                        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
                            <Shield className="h-8 w-8 text-primary" />
                        </div>
                        <h1 className="text-3xl lg:text-5xl font-extrabold text-secondary-foreground mb-4">
                            {t('policies.privacy.title')}
                        </h1>
                        <p className="text-secondary-foreground/80 max-w-2xl mx-auto">
                            {t('policies.privacy.subtitle')}
                        </p>
                    </div>
                </section>

                {/* Policy Content */}
                <section className="py-12 lg:py-16">
                    <div className="container-main">
                        <div className="max-w-3xl mx-auto space-y-8">

                            <div className="bg-card p-6 rounded-xl border border-border">
                                <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                                    <Database className="h-5 w-5 text-primary" />
                                    {t('policies.privacy.collection.title')}
                                </h2>
                                <p className="text-muted-foreground mb-4">{t('policies.privacy.collection.desc')}</p>
                                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                                    <li>{t('policies.privacy.collection.li1')}</li>
                                    <li>{t('policies.privacy.collection.li2')}</li>
                                    <li>{t('policies.privacy.collection.li3')}</li>
                                </ul>
                            </div>

                            <div className="bg-card p-6 rounded-xl border border-border">
                                <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                                    <Eye className="h-5 w-5 text-primary" />
                                    {t('policies.privacy.usage.title')}
                                </h2>
                                <p className="text-muted-foreground mb-4">{t('policies.privacy.usage.desc')}</p>
                                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                                    <li>{t('policies.privacy.usage.li1')}</li>
                                    <li>{t('policies.privacy.usage.li2')}</li>
                                </ul>
                            </div>

                            <div className="bg-card p-6 rounded-xl border border-border">
                                <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                                    <Lock className="h-5 w-5 text-primary" />
                                    {t('policies.privacy.security.title')}
                                </h2>
                                <p className="text-muted-foreground">{t('policies.privacy.security.desc')}</p>
                            </div>

                            {/* Contact CTA */}
                            <div className="text-center p-8 bg-muted/50 rounded-2xl">
                                <HelpCircle className="h-10 w-10 text-primary mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-foreground mb-2">
                                    {t('policies.privacy.questions.title')}
                                </h3>
                                <p className="text-muted-foreground mb-4">
                                    {t('policies.privacy.questions.desc')}
                                </p>
                                <Link
                                    to="/contact"
                                    className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                                >
                                    {t('policies.privacy.questions.button')}
                                </Link>
                            </div>

                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default PrivacyPolicy;
