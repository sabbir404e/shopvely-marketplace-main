import React from 'react';
import { FileText, CheckSquare, ShieldAlert, UserCheck, HelpCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Link } from 'react-router-dom';

const TermsConditions: React.FC = () => {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header />

            <main className="flex-1">
                {/* Hero */}
                <section className="bg-gradient-hero py-12 lg:py-20">
                    <div className="container-main text-center">
                        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
                            <FileText className="h-8 w-8 text-primary" />
                        </div>
                        <h1 className="text-3xl lg:text-5xl font-extrabold text-secondary-foreground mb-4">
                            {t('policies.terms.title')}
                        </h1>
                        <p className="text-secondary-foreground/80 max-w-2xl mx-auto">
                            {t('policies.terms.subtitle')}
                        </p>
                    </div>
                </section>

                {/* Policy Content */}
                <section className="py-12 lg:py-16">
                    <div className="container-main">
                        <div className="max-w-3xl mx-auto space-y-8">

                            <div className="bg-card p-6 rounded-xl border border-border">
                                <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                                    <CheckSquare className="h-5 w-5 text-primary" />
                                    {t('policies.terms.acceptance.title')}
                                </h2>
                                <p className="text-muted-foreground">{t('policies.terms.acceptance.desc')}</p>
                            </div>

                            <div className="bg-card p-6 rounded-xl border border-border">
                                <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                                    <UserCheck className="h-5 w-5 text-primary" />
                                    {t('policies.terms.usage.title')}
                                </h2>
                                <div className="space-y-4 text-muted-foreground">
                                    <p>{t('policies.terms.usage.desc')}</p>
                                    <ul className="list-disc pl-6 space-y-2">
                                        <li>{t('policies.terms.usage.li1')}</li>
                                        <li>{t('policies.terms.usage.li2')}</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="bg-card p-6 rounded-xl border border-border">
                                <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                                    <ShieldAlert className="h-5 w-5 text-primary" />
                                    {t('policies.terms.liability.title')}
                                </h2>
                                <p className="text-muted-foreground">{t('policies.terms.liability.desc')}</p>
                            </div>

                            {/* Contact CTA */}
                            <div className="text-center p-8 bg-muted/50 rounded-2xl">
                                <HelpCircle className="h-10 w-10 text-primary mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-foreground mb-2">
                                    {t('policies.terms.questions.title')}
                                </h3>
                                <p className="text-muted-foreground mb-4">
                                    {t('policies.terms.questions.desc')}
                                </p>
                                <Link
                                    to="/contact"
                                    className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                                >
                                    {t('policies.terms.questions.button')}
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

export default TermsConditions;
