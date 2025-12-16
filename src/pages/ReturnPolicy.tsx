import React from 'react';
import { RotateCcw, CheckCircle, XCircle, AlertCircle, HelpCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Link } from 'react-router-dom';

const ReturnPolicy: React.FC = () => {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header />

            <main className="flex-1">
                {/* Hero */}
                <section className="bg-gradient-hero py-12 lg:py-20">
                    <div className="container-main text-center">
                        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
                            <RotateCcw className="h-8 w-8 text-primary" />
                        </div>
                        <h1 className="text-3xl lg:text-5xl font-extrabold text-secondary-foreground mb-4">
                            {t('policies.return.title')}
                        </h1>
                        <p className="text-secondary-foreground/80 max-w-2xl mx-auto">
                            {t('policies.return.subtitle')}
                        </p>
                    </div>
                </section>

                {/* Policy Content */}
                <section className="py-12 lg:py-16">
                    <div className="container-main">
                        <div className="max-w-3xl mx-auto space-y-8">

                            {/* Eligibility */}
                            <div className="bg-card p-6 rounded-xl border border-border">
                                <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                    {t('policies.return.eligible.title')}
                                </h2>
                                <div className="space-y-4 text-muted-foreground">
                                    <p>{t('policies.return.eligible.desc')}</p>
                                    <ul className="list-disc pl-6 space-y-2">
                                        <li>{t('policies.return.eligible.li1')}</li>
                                        <li>{t('policies.return.eligible.li2')}</li>
                                        <li>{t('policies.return.eligible.li3')}</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Non-returnable */}
                            <div className="bg-card p-6 rounded-xl border border-border">
                                <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                                    <XCircle className="h-5 w-5 text-destructive" />
                                    {t('policies.return.nonReturnable.title')}
                                </h2>
                                <div className="space-y-4 text-muted-foreground">
                                    <p>{t('policies.return.nonReturnable.desc')}</p>
                                    <ul className="list-disc pl-6 space-y-2">
                                        <li>{t('policies.return.nonReturnable.li1')}</li>
                                        <li>{t('policies.return.nonReturnable.li2')}</li>
                                        <li>{t('policies.return.nonReturnable.li3')}</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Process */}
                            <div className="bg-card p-6 rounded-xl border border-border">
                                <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                                    <AlertCircle className="h-5 w-5 text-blue-500" />
                                    {t('policies.return.process.title')}
                                </h2>
                                <div className="space-y-4 text-muted-foreground">
                                    <ol className="list-decimal pl-6 space-y-4">
                                        <li>
                                            <strong>{t('policies.return.process.step1Title')}</strong>
                                            <p className="text-sm mt-1">{t('policies.return.process.step1Desc')}</p>
                                        </li>
                                        <li>
                                            <strong>{t('policies.return.process.step2Title')}</strong>
                                            <p className="text-sm mt-1">{t('policies.return.process.step2Desc')}</p>
                                        </li>
                                        <li>
                                            <strong>{t('policies.return.process.step3Title')}</strong>
                                            <p className="text-sm mt-1">{t('policies.return.process.step3Desc')}</p>
                                        </li>
                                    </ol>
                                </div>
                            </div>

                            {/* Contact CTA */}
                            <div className="text-center p-8 bg-muted/50 rounded-2xl">
                                <HelpCircle className="h-10 w-10 text-primary mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-foreground mb-2">
                                    {t('policies.return.questions.title')}
                                </h3>
                                <p className="text-muted-foreground mb-4">
                                    {t('policies.return.questions.desc')}
                                </p>
                                <Link
                                    to="/contact"
                                    className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                                >
                                    {t('policies.return.questions.button')}
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

export default ReturnPolicy;
