import React from 'react';
import { useTranslation } from 'react-i18next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/home/HeroSection';
import CategorySection from '@/components/home/CategorySection';
import FeaturedProducts from '@/components/home/FeaturedProducts';

const Index: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <CategorySection />
        <FeaturedProducts />

        {/* CTA Banner */}
        <section className="py-12 lg:py-16 bg-background">
          <div className="container-main">
            <div className="relative overflow-hidden rounded-2xl bg-secondary p-8 lg:p-12">
              <div className="relative z-10 max-w-lg">
                <h2 className="text-2xl lg:text-4xl font-bold text-secondary-foreground mb-4">
                  {t('hero.earnRewards')}
                </h2>
                <p className="text-secondary-foreground/80 mb-6">
                  {t('hero.joinLoyalty')}
                </p>
                <div className="flex gap-4">
                  <a href="/account" className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
                    {t('hero.joinNow')}
                  </a>
                </div>
              </div>
              {/* Decorative */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
              <div className="absolute bottom-0 right-20 w-64 h-64 bg-accent/20 rounded-full translate-y-1/2 blur-3xl" />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
