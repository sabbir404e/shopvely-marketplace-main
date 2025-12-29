import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSettings } from '@/context/SettingsContext';
import { Mail, Phone, MapPin, MessageCircle, Clock } from 'lucide-react';
import codLogo from '@/assets/payments/cod.png';
import bkashLogo from '@/assets/payments/bkash.png';
import nagadLogo from '@/assets/payments/nagad.png';
import rocketLogo from '@/assets/payments/rocket.png';
import upayLogo from '@/assets/payments/upay.png';
import visaLogo from '@/assets/payments/visa.png';
import dutchbanglaLogo from '@/assets/payments/dutchbangla.png';
import mastercardLogo from '@/assets/payments/mastercard.png';
import facebookLogo from '@/assets/social/facebook.png';
import instagramLogo from '@/assets/social/instagram.png';
import youtubeLogo from '@/assets/social/youtube.png';
import twitterLogo from '@/assets/social/twitter.png';
import tiktokLogo from '@/assets/social/tiktok.png';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const whatsappNumber = '+8801786981164';
  const { t } = useTranslation();
  const { settings } = useSettings();

  return (
    <footer className="bg-secondary text-secondary-foreground">
      {/* Floating WhatsApp Button */}
      <a
        href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#25D366] text-white px-4 py-3 rounded-full shadow-lg hover:bg-[#128C7E] transition-colors group"
        aria-label="Contact on WhatsApp"
      >
        <MessageCircle className="h-6 w-6" />
        <span className="hidden group-hover:inline-block font-medium">Chat with us</span>
      </a>

      {/* Main Footer Content */}
      <div className="container-main py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h2 className="text-2xl font-extrabold mb-4">
              <span className="text-primary">{settings.storeName.substring(0, 4)}</span>
              {settings.storeName.substring(4)}
            </h2>
            <p className="text-secondary-foreground/70 text-sm mb-4">
              {t('footer.tagline')}
            </p>
            <div className="flex gap-3">
              <a href="https://www.facebook.com/ShopVely" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                <img src={facebookLogo} alt="Facebook" className="h-8 w-8 object-contain" />
              </a>
              <a href="https://www.instagram.com/shopvely.official" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                <img src={instagramLogo} alt="Instagram" className="h-8 w-8 object-contain" />
              </a>
              <a href="https://www.youtube.com/@ShopVely" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                <img src={youtubeLogo} alt="YouTube" className="h-8 w-8 object-contain" />
              </a>
              <a href="https://x.com/shop_vely" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                <img src={twitterLogo} alt="Twitter" className="h-8 w-8 object-contain" />
              </a>
              <a href="https://www.tiktok.com/@shopvelyofficial" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                <img src={tiktokLogo} alt="TikTok" className="h-8 w-8 object-contain" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-4">{t('footer.quickLinks')}</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/#home-hero" className="text-secondary-foreground/70 hover:text-primary text-sm transition-colors">
                  {t('common.home')}
                </Link>
              </li>
              <li>
                <Link to="/shop#shop-hero" className="text-secondary-foreground/70 hover:text-primary text-sm transition-colors">
                  {t('common.shop')}
                </Link>
              </li>
              <li>
                <Link to="/about#about-shopvely" className="text-secondary-foreground/70 hover:text-primary text-sm transition-colors">
                  {t('common.about')}
                </Link>
              </li>
              <li>
                <Link to="/contact#get-in-touch" className="text-secondary-foreground/70 hover:text-primary text-sm transition-colors">
                  {t('common.contact')}
                </Link>
              </li>
              <li>
                <Link to="/faqs#faq-hero" className="text-secondary-foreground/70 hover:text-primary text-sm transition-colors">
                  {t('footer.faq')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-bold mb-4">{t('footer.customerService')}</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/shipping-policy#shipping-policy-hero" className="text-secondary-foreground/70 hover:text-primary text-sm transition-colors">
                  {t('footer.shippingPolicy')}
                </Link>
              </li>
              <li>
                <Link to="/return-policy#return-policy-hero" className="text-secondary-foreground/70 hover:text-primary text-sm transition-colors">
                  {t('footer.returnPolicy')}
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy#privacy-policy-hero" className="text-secondary-foreground/70 hover:text-primary text-sm transition-colors">
                  {t('footer.privacyPolicy')}
                </Link>
              </li>
              <li>
                <Link to="/terms#terms-hero" className="text-secondary-foreground/70 hover:text-primary text-sm transition-colors">
                  {t('footer.termsConditions')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-bold mb-4">{t('footer.contactUs')}</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-secondary-foreground/70 text-sm">{t('footer.phone')}</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-secondary-foreground/70 text-sm">{settings.supportEmail}</span>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-primary flex-shrink-0" />
                <div className="flex flex-col">
                  <span className="text-secondary-foreground font-medium text-sm">{t('footer.workingHours')}</span>
                  <span className="text-secondary-foreground/70 text-sm">{t('footer.workingHoursValue')}</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Payment Methods & Copyright */}
      <div className="border-t border-secondary-foreground/10">
        <div className="container-main py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-secondary-foreground/60 text-sm">
              © {currentYear} {settings.storeName}. {t('footer.allRightsReserved')}.
            </p>
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-secondary-foreground/60 text-sm">{t('footer.paymentMethods')}:</span>
              <div className="flex items-center gap-2 flex-wrap">
                <img src={codLogo} alt="Cash on Delivery" className="h-8 object-contain bg-white rounded p-1" />
                <img src={bkashLogo} alt="bKash" className="h-8 object-contain bg-white rounded p-1" />
                <img src={nagadLogo} alt="Nagad" className="h-8 object-contain bg-white rounded p-1" />
                <img src={rocketLogo} alt="Rocket" className="h-8 object-contain bg-white rounded p-1" />
                <img src={upayLogo} alt="Upay" className="h-8 object-contain bg-white rounded p-1" />
                <img src={visaLogo} alt="Visa" className="h-8 object-contain bg-white rounded p-1" />
                <img src={dutchbanglaLogo} alt="Dutch-Bangla Bank" className="h-8 object-contain bg-white rounded p-1" />
                <img src={mastercardLogo} alt="Mastercard" className="h-8 object-contain bg-white rounded p-1" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
