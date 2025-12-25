import React from 'react';
import { Truck, Clock, MapPin, Package, Shield, HelpCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Link } from 'react-router-dom';

import { useLocation } from 'react-router-dom';

const ShippingPolicy: React.FC = () => {
    const { t } = useTranslation();
    const location = useLocation();

    React.useEffect(() => {
        if (location.hash) {
            try {
                const element = document.querySelector(location.hash);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
            } catch (e) {
                // Ignore invalid selectors
            }
        }
    }, [location]);

    const shippingInfo = [
        {
            icon: Truck,
            title: t('policies.shipping.delivery.title'),
            description: t('policies.shipping.delivery.desc'),
        },
        {
            icon: Clock,
            title: t('policies.shipping.time.title'),
            description: t('policies.shipping.time.desc'),
        },
        {
            icon: MapPin,
            title: t('policies.shipping.coverage.title'),
            description: t('policies.shipping.coverage.desc'),
        },
        {
            icon: Package,
            title: t('policies.shipping.tracking.title'),
            description: t('policies.shipping.tracking.desc'),
        },
    ];

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header />

            <main className="flex-1">
                {/* Hero */}
                <section id="shipping-policy-hero" className="bg-gradient-hero py-12 lg:py-20 scroll-mt-24">
                    <div className="container-main text-center">
                        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
                            <Truck className="h-8 w-8 text-primary" />
                        </div>
                        <h1 className="text-3xl lg:text-5xl font-extrabold text-secondary-foreground mb-4">
                            {t('policies.shipping.title')}
                        </h1>
                        <p className="text-secondary-foreground/80 max-w-2xl mx-auto">
                            {t('policies.shipping.subtitle')}
                        </p>
                    </div>
                </section>

                {/* Shipping Info Cards */}
                <section className="py-12 lg:py-16">
                    <div className="container-main">
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                            {shippingInfo.map((item, index) => (
                                <div
                                    key={index}
                                    className="p-6 bg-card rounded-xl border border-border hover:shadow-lg transition-shadow"
                                >
                                    <div className="p-3 bg-primary/10 rounded-xl w-fit mb-4">
                                        <item.icon className="h-6 w-6 text-primary" />
                                    </div>
                                    <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                                    <p className="text-muted-foreground text-sm">{item.description}</p>
                                </div>
                            ))}
                        </div>

                        {/* Detailed Policy */}
                        <div className="max-w-3xl mx-auto space-y-8">
                            <div className="bg-card p-6 rounded-xl border border-border">
                                <h2 className="text-xl font-bold text-foreground mb-4">{t('policies.shipping.domestic.title')}</h2>
                                <div className="space-y-4 text-muted-foreground">
                                    <p>{t('policies.shipping.domestic.p1')}</p>
                                    <ul className="list-disc pl-6 space-y-2">
                                        <li>{t('policies.shipping.domestic.li1')}</li>
                                        <li>{t('policies.shipping.domestic.li2')}</li>
                                        <li>{t('policies.shipping.domestic.li3')}</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="bg-card p-6 rounded-xl border border-border">
                                <h2 className="text-xl font-bold text-foreground mb-4">{t('policies.shipping.free.title')}</h2>
                                <div className="space-y-4 text-muted-foreground">
                                    <p>{t('policies.shipping.free.p1')}</p>
                                    <div className="bg-primary/10 p-4 rounded-lg">
                                        <p className="font-medium text-primary">{t('policies.shipping.free.highlight')}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-card p-6 rounded-xl border border-border">
                                <h2 className="text-xl font-bold text-foreground mb-4">{t('policies.shipping.charges.title')}</h2>
                                <div className="space-y-4 text-muted-foreground">
                                    <p>{t('policies.shipping.charges.p1')}</p>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b border-border">
                                                    <th className="text-left py-2 font-semibold text-foreground">{t('policies.shipping.table.location')}</th>
                                                    <th className="text-left py-2 font-semibold text-foreground">{t('policies.shipping.table.time')}</th>
                                                    <th className="text-left py-2 font-semibold text-foreground">{t('policies.shipping.table.cost')}</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr className="border-b border-border/50">
                                                    <td className="py-2">{t('policies.shipping.table.dhaka')}</td>
                                                    <td className="py-2">1-3 {t('policies.shipping.table.days')}</td>
                                                    <td className="py-2">৳60</td>
                                                </tr>
                                                <tr className="border-b border-border/50">
                                                    <td className="py-2">{t('policies.shipping.table.suburban')}</td>
                                                    <td className="py-2">3-5 {t('policies.shipping.table.days')}</td>
                                                    <td className="py-2">৳100</td>
                                                </tr>
                                                <tr>
                                                    <td className="py-2">{t('policies.shipping.table.outside')}</td>
                                                    <td className="py-2">5-7 {t('policies.shipping.table.days')}</td>
                                                    <td className="py-2">৳120</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            {/* Contact CTA */}
                            <div className="text-center p-8 bg-muted/50 rounded-2xl">
                                <HelpCircle className="h-10 w-10 text-primary mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-foreground mb-2">
                                    {t('policies.shipping.questions.title')}
                                </h3>
                                <p className="text-muted-foreground mb-4">
                                    {t('policies.shipping.questions.desc')}
                                </p>
                                <Link
                                    to="/contact"
                                    className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                                >
                                    {t('policies.shipping.questions.button')}
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

export default ShippingPolicy;
