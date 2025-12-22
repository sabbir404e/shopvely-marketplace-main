import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, Shield, CreditCard, Headphones, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import useEmblaCarousel from 'embla-carousel-react';
import { cn } from '@/lib/utils';
import { useSettings } from '@/context/SettingsContext';

const HeroSection: React.FC = () => {
  const { settings } = useSettings();
  const slides = settings.bannerSlides || []; // Fallback to empty array if undefined

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);

    // Auto-play
    const autoplay = setInterval(() => {
      emblaApi.scrollNext();
    }, 5000);

    return () => {
      emblaApi.off('select', onSelect);
      clearInterval(autoplay);
    };
  }, [emblaApi, onSelect]);

  const features = [
    { icon: Truck, title: 'Free Shipping', desc: 'On orders over ৳5,000' },
    { icon: Shield, title: 'Secure Payment', desc: '100% secure checkout' },
    { icon: CreditCard, title: 'Easy Returns', desc: '30-day return policy' },
    { icon: Headphones, title: '24/7 Support', desc: 'Dedicated support team' },
  ];

  const getTitleSize = (text: string) => {
    const length = text.length;
    if (length < 20) return 'text-3xl sm:text-4xl lg:text-5xl';
    if (length < 40) return 'text-2xl sm:text-3xl lg:text-4xl';
    return 'text-xl sm:text-2xl lg:text-3xl';
  };

  return (
    <section className="relative overflow-hidden">
      {/* Carousel */}
      <div className="relative">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {slides.map((slide) => (
              <div key={slide.id} className="flex-[0_0_100%] min-w-0">
                <div className={cn("bg-gradient-to-br min-h-[350px] lg:h-[450px] relative overflow-hidden", slide.bgClass)}>
                  <div className="container-main h-full py-8 lg:py-12">
                    <div className="grid lg:grid-cols-2 gap-6 items-center h-full">
                      {/* Content */}
                      <div className="relative z-10">
                        <span className="inline-block px-4 py-2 bg-primary/20 text-primary-foreground rounded-full text-sm font-medium mb-3">
                          {slide.badge}
                        </span>
                        <h1 className={cn("font-extrabold text-secondary-foreground mb-3 leading-tight transition-all duration-300", getTitleSize(slide.title + slide.highlight))}>
                          {slide.title}
                          <br />
                          <span className="text-primary">{slide.highlight}</span>
                        </h1>
                        <p className="text-secondary-foreground/80 text-base lg:text-lg mb-6 max-w-lg">
                          {slide.description}
                        </p>

                        {/* Discount Badge */}
                        <div className="inline-block mb-6">
                          <span className="px-5 py-2 bg-accent text-accent-foreground font-bold text-lg rounded-full animate-pulse">
                            {slide.discount}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-3">
                          <Link to={slide.category ? `/shop?category=${slide.category}` : '/shop'}>
                            <Button size="lg" className="btn-primary gap-2 text-base px-6 shadow-glow">
                              Shop Now
                              <ArrowRight className="h-5 w-5" />
                            </Button>
                          </Link>
                        </div>
                      </div>

                      {/* Hero Image */}
                      <div className="relative block mt-6 lg:mt-0">
                        <div className="relative z-10">
                          <img
                            src={slide.image}
                            alt={slide.title}
                            className="rounded-2xl shadow-2xl object-cover w-full max-h-[320px]"
                          />
                        </div>
                        {/* Decorative Elements */}
                        <div className="absolute -top-6 -right-6 w-28 h-28 bg-primary/30 rounded-full blur-3xl" />
                        <div className="absolute -bottom-6 -left-6 w-36 h-36 bg-accent/30 rounded-full blur-3xl" />
                      </div>
                    </div>
                  </div>

                  {/* Decorative Pattern */}
                  <div className="absolute inset-0 opacity-5 pointer-events-none">
                    <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <circle cx="1" cy="1" r="1" fill="currentColor" />
                      </pattern>
                      <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={scrollPrev}
          className="absolute left-2 lg:left-4 top-1/2 -translate-y-1/2 z-20 p-2 lg:p-3 bg-card/80 hover:bg-card rounded-full shadow-lg transition-all hover:scale-110"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-5 w-5 lg:h-6 lg:w-6 text-foreground" />
        </button>
        <button
          onClick={scrollNext}
          className="absolute right-2 lg:right-4 top-1/2 -translate-y-1/2 z-20 p-2 lg:p-3 bg-card/80 hover:bg-card rounded-full shadow-lg transition-all hover:scale-110"
          aria-label="Next slide"
        >
          <ChevronRight className="h-5 w-5 lg:h-6 lg:w-6 text-foreground" />
        </button>

        {/* Dots Navigation */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={cn(
                "w-2.5 h-2.5 rounded-full transition-all duration-300",
                selectedIndex === index
                  ? "bg-primary w-8"
                  : "bg-card/60 hover:bg-card"
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Features Bar */}
      <div className="bg-card border-y border-border">
        <div className="container-main py-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="flex items-center gap-3 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="p-2.5 bg-primary/10 rounded-xl">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground text-sm">{feature.title}</h4>
                  <p className="text-muted-foreground text-xs">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
