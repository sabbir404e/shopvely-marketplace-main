import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, Truck, HeartHandshake, Trophy, Users, Target, ArrowRight } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';

import abdulWadudImage from '@/assets/team/abdul_wadud.jpg';
import sabbirHossainImage from '@/assets/team/sabbir_hossain.jpg';
import abuSayeedImage from '@/assets/team/abu_sayeed_v2.jpg';
import tusarAhmedNayeemImage from '@/assets/team/tusar_ahmed_nayeem.jpg';
import shariarHossainSunImage from '@/assets/team/shariar_hossain_sun.png';
import mdAzomHossainImage from '@/assets/team/md_azom_hossain.png';
import shopvelyStoreImage from '@/assets/about/shopvely-store.jpg';

import { useLocation } from 'react-router-dom';

const About: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();

  React.useEffect(() => {
    if (location.hash) {
      const element = document.querySelector(location.hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location]);

  const values = [
    {
      icon: ShieldCheck,
      title: t('about.values.quality.title'),
      description: t('about.values.quality.description'),
    },
    {
      icon: Truck,
      title: t('about.values.delivery.title'),
      description: t('about.values.delivery.description'),
    },
    {
      icon: HeartHandshake,
      title: t('about.values.customer.title'),
      description: t('about.values.customer.description'),
    },
    {
      icon: Trophy,
      title: t('about.values.price.title'),
      description: t('about.values.price.description'),
    },
  ];

  const stats = [
    { value: '10K+', label: t('about.stats.customers') },
    { value: '500+', label: t('about.stats.products') },
    { value: '200+', label: t('about.stats.brands') },
    { value: '99%', label: t('about.stats.satisfaction') },
  ];

  const team = [
    {
      name: 'Abdul Wadud',
      role: t('about.team.roles.ceo'),
      image: abdulWadudImage,
      details: [
        'Bachelor Degree & Post Graduation Completed from Rajshahi College, Department of Management, Rajshahi',
        'Contact 01796952446'
      ]
    },
    {
      name: 'Md. Sabbir Hossain',
      role: t('about.team.roles.cto'),
      image: sabbirHossainImage,
      details: [
        'Studying CSE at Pabna University of Science and Technology, Pabna',
        'Contact 01786981164'
      ]
    },
    {
      name: 'Md. Abu Sayeed',
      role: t('about.team.roles.brandAmbassador'),
      image: abuSayeedImage,
      details: [
        'Studying Islamic History at New Government Degree College, Rajshahi',
        'Contact 0 1317445169'
      ]
    },
    {
      name: 'Tusar Ahmed Nayeem',
      role: t('about.team.roles.marketingExecutive'),
      image: tusarAhmedNayeemImage,
      details: [
        'Studying Chemistry at Jagannath University, Dhaka',
        'Contact 01859861241'
      ]
    },
    {
      name: 'Shariar Hossain Sun',
      role: t('about.team.roles.marketingExecutive'),
      image: shariarHossainSunImage,
      details: [
        'Studying Diploma in Electrical Engineering at Chapainawabganj Polytechnic Institute, Chapainawabganj',
        'Contact 01317448654'
      ]
    },
    {
      name: 'Md. Azom Hossain Babul',
      role: t('about.team.roles.marketingExecutive'),
      image: mdAzomHossainImage,
      details: [
        'Studying Diploma in Civil Engineering at Bogura Polytechnic Institute, Bogura',
        'Contact 01744945758'
      ]
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-hero py-16 lg:py-24">
          <div className="container-main text-center">
            <h1 className="text-3xl lg:text-5xl font-extrabold text-secondary-foreground mb-4">
              {t('about.title')} <span className="text-primary">ShopVely</span>
            </h1>
            <p className="text-secondary-foreground/80 max-w-2xl mx-auto text-lg">
              {t('about.subtitle')}
            </p>
          </div>
        </section>

        {/* Story */}
        <section id="about-shopvely" className="py-12 lg:py-16 scroll-mt-24">
          <div className="container-main">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div>
                <span className="text-primary font-semibold text-sm uppercase tracking-wider">{t('about.story.label')}</span>
                <h2 className="text-2xl lg:text-4xl font-bold text-foreground mt-2 mb-4">
                  {t('about.story.title')}
                </h2>
                <p className="text-muted-foreground mb-4">
                  {t('about.story.p1')}
                </p>
                <p className="text-muted-foreground mb-6">
                  {t('about.story.p2')}
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    <span className="text-foreground font-medium">{t('about.story.customerFocused')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    <span className="text-foreground font-medium">{t('about.story.communityDriven')}</span>
                  </div>
                </div>
              </div>
              <div className="relative">
                <img
                  src={shopvelyStoreImage}
                  alt="ShopVely Team"
                  className="rounded-2xl shadow-xl"
                />
                <div className="absolute -bottom-6 -left-6 bg-primary text-primary-foreground p-6 rounded-xl shadow-lg">
                  <p className="text-4xl font-bold">1+</p>
                  <p className="text-sm opacity-90">{t('about.story.yearsExcellence')}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-12 bg-muted/50">
          <div className="container-main">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <p className="text-3xl lg:text-4xl font-bold text-primary mb-1">{stat.value}</p>
                  <p className="text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-12 lg:py-16">
          <div className="container-main">
            <div className="text-center mb-10">
              <span className="text-primary font-semibold text-sm uppercase tracking-wider">{t('about.values.label')}</span>
              <h2 className="text-2xl lg:text-4xl font-bold text-foreground mt-2">{t('about.values.title')}</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <div
                  key={index}
                  className="p-6 bg-card rounded-xl border border-border hover:shadow-lg transition-shadow"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                    <value.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-foreground mb-2">{value.title}</h3>
                  <p className="text-muted-foreground text-sm">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-12 lg:py-16 bg-muted/30">
          <div className="container-main">
            <div className="text-center mb-10">
              <span className="text-primary font-semibold text-sm uppercase tracking-wider">{t('about.team.label')}</span>
              <h2 className="text-2xl lg:text-4xl font-bold text-foreground mt-2">{t('about.team.title')}</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {team.map((member, index) => (
                <div key={index} className="text-center">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-card shadow-lg"
                  />
                  <h3 className="font-bold text-foreground">{member.name}</h3>
                  <p className="text-muted-foreground text-sm mb-2">{member.role}</p>
                  {/* @ts-ignore */}
                  {member.details && member.details.map((detail, i) => (
                    <p key={i} className="text-muted-foreground text-xs mt-1">{detail}</p>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 lg:py-16">
          <div className="container-main">
            <div className="bg-secondary rounded-2xl p-8 lg:p-12 text-center">
              <h2 className="text-2xl lg:text-3xl font-bold text-secondary-foreground mb-4">
                {t('about.cta.title')}
              </h2>
              <p className="text-secondary-foreground/80 mb-6 max-w-lg mx-auto">
                {t('about.cta.subtitle')}
              </p>
              <Link to="/shop#shop-hero">
                <Button size="lg" className="btn-primary gap-2">
                  {t('about.cta.button')}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
