import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { cn } from '@/lib/utils';

interface FAQItem {
    question: string;
    answer: string;
    category: string;
}

const FAQs: React.FC = () => {
    const { t } = useTranslation();
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const [activeCategory, setActiveCategory] = useState<string>('all');

    const faqs: FAQItem[] = [
        // Shipping & Delivery
        { category: 'shipping', question: t('faqs.shipping.q1'), answer: t('faqs.shipping.a1') },
        { category: 'shipping', question: t('faqs.shipping.q2'), answer: t('faqs.shipping.a2') },
        { category: 'shipping', question: t('faqs.shipping.q3'), answer: t('faqs.shipping.a3') },
        // Orders & Returns
        { category: 'orders', question: t('faqs.orders.q1'), answer: t('faqs.orders.a1') },
        { category: 'orders', question: t('faqs.orders.q2'), answer: t('faqs.orders.a2') },
        { category: 'orders', question: t('faqs.orders.q3'), answer: t('faqs.orders.a3') },
        // Payment
        { category: 'payment', question: t('faqs.payment.q1'), answer: t('faqs.payment.a1') },
        { category: 'payment', question: t('faqs.payment.q2'), answer: t('faqs.payment.a2') },
        { category: 'payment', question: t('faqs.payment.q3'), answer: t('faqs.payment.a3') },
        // Account
        { category: 'account', question: t('faqs.account.q1'), answer: t('faqs.account.a1') },
        { category: 'account', question: t('faqs.account.q2'), answer: t('faqs.account.a2') },
    ];

    const categories = [
        { id: 'all', label: t('faqs.categories.all') },
        { id: 'shipping', label: t('faqs.categories.shipping') },
        { id: 'orders', label: t('faqs.categories.orders') },
        { id: 'payment', label: t('faqs.categories.payment') },
        { id: 'account', label: t('faqs.categories.account') },
    ];

    const filteredFaqs = faqs.filter(faq => {
        const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
        return matchesCategory;
    });

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header />

            <main className="flex-1">
                {/* Hero */}
                <section className="bg-gradient-hero py-12 lg:py-20">
                    <div className="container-main text-center">
                        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
                            <HelpCircle className="h-8 w-8 text-primary" />
                        </div>
                        <h1 className="text-3xl lg:text-5xl font-extrabold text-secondary-foreground mb-4">
                            {t('faqs.hero.title')}
                        </h1>
                        <p className="text-secondary-foreground/80 max-w-2xl mx-auto">
                            {t('faqs.hero.subtitle')}
                        </p>
                    </div>
                </section>

                {/* FAQ Content */}
                <section className="py-12 lg:py-16">
                    <div className="container-main">
                        {/* Category Filters */}
                        <div className="flex flex-wrap gap-2 justify-center mb-8">
                            {categories.map((category) => (
                                <button
                                    key={category.id}
                                    onClick={() => setActiveCategory(category.id)}
                                    className={cn(
                                        "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                                        activeCategory === category.id
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                                    )}
                                >
                                    {category.label}
                                </button>
                            ))}
                        </div>

                        {/* FAQ List */}
                        <div className="max-w-3xl mx-auto space-y-4">
                            {filteredFaqs.length > 0 ? (
                                filteredFaqs.map((faq, index) => (
                                    <div
                                        key={index}
                                        className="border border-border rounded-xl overflow-hidden bg-card"
                                    >
                                        <button
                                            onClick={() => toggleFAQ(index)}
                                            className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 hover:bg-muted/50 transition-colors"
                                        >
                                            <span className="font-semibold text-foreground">{faq.question}</span>
                                            <ChevronDown
                                                className={cn(
                                                    "h-5 w-5 text-muted-foreground transition-transform flex-shrink-0",
                                                    openIndex === index && "rotate-180"
                                                )}
                                            />
                                        </button>
                                        {openIndex === index && (
                                            <div className="px-6 pb-4 text-muted-foreground">
                                                {faq.answer}
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12">
                                    <p className="text-muted-foreground">{t('faqs.noResults')}</p>
                                </div>
                            )}
                        </div>

                        {/* Contact CTA */}
                        <div className="mt-12 text-center p-8 bg-muted/50 rounded-2xl max-w-2xl mx-auto">
                            <h3 className="text-xl font-bold text-foreground mb-2">
                                {t('faqs.stillHaveQuestions')}
                            </h3>
                            <p className="text-muted-foreground mb-4">
                                {t('faqs.contactCta')}
                            </p>
                            <a
                                href="/contact"
                                className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                            >
                                {t('faqs.contactButton')}
                            </a>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default FAQs;
