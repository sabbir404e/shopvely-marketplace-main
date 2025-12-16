import React, { useState } from 'react';
import { Mail, Phone, Clock, Send, MessageSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';

const Contact: React.FC = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: t('contact.form.errorTitle'),
        description: t('contact.form.errorDesc'),
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast({
      title: t('contact.form.successTitle'),
      description: t('contact.form.successDesc'),
    });

    setFormData({ name: '', email: '', subject: '', message: '' });
    setIsSubmitting(false);
  };

  const contactInfo = [
    { icon: Mail, label: t('contact.info.email'), value: 'support@shopvely.com', href: 'mailto:support@shopvely.com' },
    { icon: Phone, label: t('contact.info.call'), value: '01797832574', href: 'tel:+8801797832574' },
    { icon: Clock, label: t('contact.info.hours'), value: t('contact.info.hoursValue'), href: '#' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-hero py-12 lg:py-20">
          <div className="container-main text-center">
            <h1 className="text-3xl lg:text-5xl font-extrabold text-secondary-foreground mb-4">
              {t('contact.hero.title')}
            </h1>
            <p className="text-secondary-foreground/80 max-w-2xl mx-auto">
              {t('contact.hero.subtitle')}
            </p>
          </div>
        </section>

        {/* Contact Info Cards */}
        <section className="py-8 -mt-8">
          <div className="container-main">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {contactInfo.map((item, index) => (
                <a
                  key={index}
                  href={item.href}
                  className="p-6 bg-card rounded-xl border border-border hover:shadow-lg transition-shadow flex items-start gap-4"
                >
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{item.label}</h3>
                    <p className="text-muted-foreground text-sm">{item.value}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form */}
        <section className="py-12 lg:py-16">
          <div className="container-main">
            <div className="max-w-2xl mx-auto">
              {/* Form */}
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <MessageSquare className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold text-foreground">{t('contact.form.title')}</h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        {t('contact.form.name')} <span className="text-destructive">*</span>
                      </label>
                      <Input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder={t('contact.form.name')}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        {t('contact.form.email')} <span className="text-destructive">*</span>
                      </label>
                      <Input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder={t('contact.form.email')}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      {t('contact.form.subject')}
                    </label>
                    <Input
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder={t('contact.form.subjectPlaceholder')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      {t('contact.form.message')} <span className="text-destructive">*</span>
                    </label>
                    <Textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder={t('contact.form.messagePlaceholder')}
                      rows={5}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="btn-primary gap-2 w-full sm:w-auto"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? t('contact.form.sending') : t('contact.form.send')}
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
