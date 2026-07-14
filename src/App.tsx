import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from 'react';
import {
  Brush,
  ChevronRight,
  Gift,
  Heart,
  Instagram,
  Mail,
  Menu,
  Palette,
  Sparkles,
  Star,
  X,
} from 'lucide-react';

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

type RevealOptions = {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
};

const CONTACT = {
  email: 'hello@arthaushan.com',
  instagramHandle: '@ArtHausShan',
  instagramUrl: 'https://www.instagram.com/arthaushan/',
  // Add a real phone number here when available.
  // Example:
  // phoneDisplay: '+1 (647) 000-0000',
  // phoneHref: 'tel:+16470000000',
  phoneDisplay: '',
  phoneHref: '',
};

const LEGAL_LINKS = {
  // Add valid page URLs when these pages are published.
  privacy: '',
  terms: '',
};

const SERVICE_OPTIONS = [
  'Both Services',
  'Custom Favours & Treats',
  'Professional Face Painting',
] as const;

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const updatePreference = () => {
      setPrefersReducedMotion(mediaQuery.matches);
    };

    updatePreference();
    mediaQuery.addEventListener('change', updatePreference);

    return () => {
      mediaQuery.removeEventListener('change', updatePreference);
    };
  }, []);

  return prefersReducedMotion;
}

function useIntersectionObserver({
  threshold = 0.15,
  rootMargin = '0px 0px -40px 0px',
  once = true,
}: RevealOptions = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const elementRef = useRef<HTMLElement | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const element = elementRef.current;

    if (!element) return;

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      setIsIntersecting(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);

        if (entry.isIntersecting && once) {
          observer.unobserve(element);
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [once, prefersReducedMotion, rootMargin, threshold]);

  return [elementRef, isIntersecting] as const;
}

function encodeFormData(formData: FormData) {
  const params = new URLSearchParams();

  formData.forEach((value, key) => {
    params.append(key, String(value));
  });

  return params.toString();
}

export default function App() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [formStatus, setFormStatus] = useState<FormStatus>('idle');
  const [serviceInterest, setServiceInterest] =
    useState<(typeof SERVICE_OPTIONS)[number]>('Both Services');

  const [heroRef, isHeroVisible] = useIntersectionObserver({ threshold: 0.1 });
  const [aboutRef, isAboutVisible] = useIntersectionObserver({ threshold: 0.18 });
  const [servicesHeaderRef, isServicesHeaderVisible] =
    useIntersectionObserver({ threshold: 0.18 });
  const [service1Ref, isService1Visible] =
    useIntersectionObserver({ threshold: 0.18 });
  const [service2Ref, isService2Visible] =
    useIntersectionObserver({ threshold: 0.18 });
  const [contactRef, isContactVisible] =
    useIntersectionObserver({ threshold: 0.1 });

  const minimumEventDate = useMemo(
    () => new Date().toISOString().split('T')[0],
    [],
  );

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);

    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setIsMobileMenuOpen(false);
    }
  };

  const chooseServiceAndScroll = (
    service: (typeof SERVICE_OPTIONS)[number],
  ) => {
    setServiceInterest(service);
    scrollToSection('contact');
  };

  const handleFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.currentTarget;
    setFormStatus('submitting');

    try {
      const formData = new FormData(form);

      const response = await fetch('/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: encodeFormData(formData),
      });

      if (!response.ok) {
        throw new Error(`Form submission failed with status ${response.status}`);
      }

      form.reset();
      setServiceInterest('Both Services');
      setFormStatus('success');
    } catch (error) {
      console.error('Unable to submit inquiry:', error);
      setFormStatus('error');
    }
  };

  const fadeUpClass =
    'transition-all duration-700 ease-out motion-reduce:transition-none';
  const getVisibleClass = (isVisible: boolean) =>
    isVisible
      ? 'opacity-100 translate-y-0'
      : 'opacity-0 translate-y-8 motion-reduce:opacity-100 motion-reduce:translate-y-0';

  const navItems = ['Home', 'About', 'Services', 'Contact'];

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#fbfaf8] font-sans text-stone-800 selection:bg-pink-200 selection:text-pink-950">
      <style
        dangerouslySetInnerHTML={{
          __html: `
            html {
              scroll-behavior: smooth;
            }

            @keyframes ambient-drift {
              0% {
                transform: translate3d(0, 0, 0) scale(1);
              }
              100% {
                transform: translate3d(18px, -14px, 0) scale(1.04);
              }
            }

            .ambient-drift {
              animation: ambient-drift 14s ease-in-out infinite alternate;
            }

            @media (prefers-reduced-motion: reduce) {
              html {
                scroll-behavior: auto;
              }

              *,
              *::before,
              *::after {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                scroll-behavior: auto !important;
                transition-duration: 0.01ms !important;
              }
            }
          `,
        }}
      />

      <nav
        aria-label="Primary navigation"
        className={`fixed inset-x-0 top-0 z-50 border-b transition-all duration-300 ${
          isScrolled
            ? 'border-stone-200/70 bg-white/92 py-3 shadow-sm backdrop-blur-xl'
            : 'border-transparent bg-transparent py-5'
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => scrollToSection('home')}
              aria-label="Go to the Art Haus Shan home section"
              className="group rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-4"
            >
              <span className="flex items-center text-2xl font-black tracking-tight md:text-3xl">
                <span className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                  Art
                </span>
                <span className="ml-1.5 text-stone-950">Haus</span>
                <span className="ml-1.5 hidden bg-gradient-to-r from-cyan-500 to-teal-500 bg-clip-text text-transparent sm:inline">
                  Shan
                </span>
              </span>
            </button>

            <div className="hidden items-center gap-8 md:flex">
              {navItems.map((item) => (
                <button
                  type="button"
                  key={item}
                  onClick={() => scrollToSection(item.toLowerCase())}
                  className="relative rounded-sm py-2 text-sm font-semibold text-stone-600 transition-colors after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:origin-left after:scale-x-0 after:bg-pink-500 after:transition-transform hover:text-pink-600 hover:after:scale-x-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-4"
                >
                  {item}
                </button>
              ))}

              <button
                type="button"
                onClick={() => scrollToSection('contact')}
                className="rounded-full bg-stone-950 px-6 py-2.5 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-pink-600 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-4 motion-reduce:transform-none"
              >
                Book Now
              </button>
            </div>

            <button
              type="button"
              aria-label={
                isMobileMenuOpen
                  ? 'Close navigation menu'
                  : 'Open navigation menu'
              }
              aria-controls="mobile-navigation"
              aria-expanded={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen((current) => !current)}
              className="rounded-lg p-2 text-stone-700 transition hover:bg-stone-100 hover:text-pink-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2 md:hidden"
            >
              {isMobileMenuOpen ? <X size={27} /> : <Menu size={27} />}
            </button>
          </div>
        </div>

        <div
          id="mobile-navigation"
          className={`absolute left-0 top-full w-full overflow-hidden border-t border-stone-100 bg-white shadow-xl transition-all duration-300 md:hidden ${
            isMobileMenuOpen
              ? 'max-h-96 py-4 opacity-100'
              : 'pointer-events-none max-h-0 py-0 opacity-0'
          }`}
        >
          <div className="flex flex-col gap-1 px-4">
            {navItems.map((item) => (
              <button
                type="button"
                key={item}
                onClick={() => scrollToSection(item.toLowerCase())}
                className="rounded-xl px-4 py-3 text-left text-lg font-semibold text-stone-700 transition hover:bg-pink-50 hover:text-pink-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500"
              >
                {item}
              </button>
            ))}

            <button
              type="button"
              onClick={() => scrollToSection('contact')}
              className="mt-2 rounded-xl bg-stone-950 px-4 py-3 text-left text-lg font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500"
            >
              Book Now
            </button>
          </div>
        </div>
      </nav>

      <main>
        <section
          id="home"
          ref={heroRef}
          className="relative flex min-h-[88vh] scroll-mt-24 items-center overflow-hidden bg-white pb-20 pt-32 lg:pb-28 lg:pt-44"
        >
          <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden">
            <div className="ambient-drift absolute -right-24 -top-28 h-[430px] w-[430px] rounded-full bg-pink-200/45 blur-3xl" />
            <div className="ambient-drift absolute -left-28 top-1/3 h-[360px] w-[360px] rounded-full bg-cyan-200/40 blur-3xl [animation-delay:1.5s]" />
            <div className="absolute bottom-[-180px] left-1/3 h-[430px] w-[430px] rounded-full bg-purple-200/35 blur-3xl" />
          </div>

          <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl text-center">
              <div
                className={`${fadeUpClass} ${getVisibleClass(
                  isHeroVisible,
                )}`}
              >
                <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-pink-100 bg-white/80 px-5 py-2.5 shadow-sm backdrop-blur-md">
                  <Brush size={18} className="text-pink-500" aria-hidden="true" />
                  <span className="text-sm font-bold uppercase tracking-[0.14em] text-stone-700">
                    Bringing Creativity to Life
                  </span>
                </div>
              </div>

              <h1
                className={`text-5xl font-black leading-[1.06] tracking-tight text-stone-950 sm:text-6xl md:text-8xl ${fadeUpClass} ${getVisibleClass(
                  isHeroVisible,
                )} delay-100`}
              >
                Make Your Event
                <br />
                <span className="relative inline-block bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent">
                  Unforgettable
                  <span
                    aria-hidden="true"
                    className="absolute -bottom-1 left-0 -z-10 h-3 w-full rounded-full bg-cyan-200/45"
                  />
                </span>
              </h1>

              <p
                className={`mx-auto mb-10 mt-8 max-w-2xl text-lg font-medium leading-relaxed text-stone-600 md:text-2xl ${fadeUpClass} ${getVisibleClass(
                  isHeroVisible,
                )} delay-200`}
              >
                Custom party favours, bespoke treats, and vibrant face painting
                thoughtfully created for celebrations of every size.
              </p>

              <div
                className={`flex flex-col items-center justify-center gap-4 sm:flex-row ${fadeUpClass} ${getVisibleClass(
                  isHeroVisible,
                )} delay-300`}
              >
                <button
                  type="button"
                  onClick={() => scrollToSection('services')}
                  className="group flex w-full items-center justify-center rounded-full bg-stone-950 px-8 py-4 text-lg font-bold text-white shadow-xl transition hover:-translate-y-1 hover:bg-pink-600 hover:shadow-pink-500/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-4 motion-reduce:transform-none sm:w-auto"
                >
                  Explore Services
                  <ChevronRight
                    size={20}
                    aria-hidden="true"
                    className="ml-2 transition-transform group-hover:translate-x-1 motion-reduce:transform-none"
                  />
                </button>

                <button
                  type="button"
                  onClick={() => scrollToSection('contact')}
                  className="w-full rounded-full border-2 border-stone-200 bg-white px-8 py-4 text-lg font-bold text-stone-950 shadow-sm transition hover:-translate-y-1 hover:border-cyan-400 hover:bg-cyan-50 hover:text-cyan-700 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-4 motion-reduce:transform-none sm:w-auto"
                >
                  Get a Quote
                </button>
              </div>
            </div>
          </div>
        </section>

        <section
          id="about"
          ref={aboutRef}
          className="scroll-mt-20 overflow-hidden bg-white py-24"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-2 lg:gap-16">
              <div
                className={`relative ${fadeUpClass} ${getVisibleClass(
                  isAboutVisible,
                )}`}
              >
                <div className="group relative aspect-[4/5] overflow-hidden rounded-[2rem] border-8 border-white shadow-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1530103862676-de8c9debad1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=85"
                    alt="A joyful, colourful celebration"
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04] motion-reduce:transform-none"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/55 via-transparent to-transparent" />
                </div>

                <div className="absolute -bottom-5 -right-3 hidden max-w-xs rounded-2xl border border-stone-100 bg-white p-5 shadow-xl sm:block md:-right-8">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-pink-100 text-pink-600">
                      <Heart size={23} fill="currentColor" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-2xl font-black text-stone-950">100%</p>
                      <p className="text-xs font-bold uppercase tracking-wider text-stone-500">
                        Passion & Care
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className={`${fadeUpClass} ${getVisibleClass(
                  isAboutVisible,
                )} delay-150`}
              >
                <div className="mb-4 flex items-center gap-2">
                  <Star
                    className="text-yellow-400"
                    size={19}
                    fill="currentColor"
                    aria-hidden="true"
                  />
                  <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-stone-400">
                    Our Story
                  </h2>
                </div>

                <h3 className="mb-6 text-4xl font-black leading-tight text-stone-950 md:text-5xl">
                  A personalized touch for every{' '}
                  <span className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                    celebration.
                  </span>
                </h3>

                <p className="mb-5 text-lg font-medium leading-relaxed text-stone-600">
                  At Art Haus Shan, every event is a canvas waiting to be brought
                  to life. We turn your inspiration into thoughtful, vibrant
                  details that feel uniquely yours.
                </p>

                <p className="mb-9 text-lg font-medium leading-relaxed text-stone-600">
                  From bespoke party favours and custom treats to professional
                  face painting, creativity and care are poured into every part
                  of the experience.
                </p>

                <div className="grid grid-cols-1 gap-6 border-t border-stone-200 pt-8 sm:grid-cols-2">
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <Gift className="text-purple-500" size={23} aria-hidden="true" />
                      <h4 className="text-2xl font-black text-stone-950">
                        Unique
                      </h4>
                    </div>
                    <p className="text-sm font-medium leading-relaxed text-stone-500">
                      Custom-designed details tailored to your theme and vision.
                    </p>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <Sparkles
                        className="text-cyan-500"
                        size={23}
                        aria-hidden="true"
                      />
                      <h4 className="text-2xl font-black text-stone-950">
                        Memorable
                      </h4>
                    </div>
                    <p className="text-sm font-medium leading-relaxed text-stone-500">
                      Creative experiences designed to delight guests of all ages.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="services"
          className="relative scroll-mt-20 overflow-hidden bg-[#fbfaf8] py-24"
        >
          <div
            aria-hidden="true"
            className="absolute right-0 top-20 h-64 w-64 rounded-full bg-yellow-100/50 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="absolute bottom-20 left-0 h-64 w-64 rounded-full bg-cyan-100/50 blur-3xl"
          />

          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div
              ref={servicesHeaderRef}
              className={`mx-auto mb-14 max-w-3xl text-center ${fadeUpClass} ${getVisibleClass(
                isServicesHeaderVisible,
              )}`}
            >
              <h2 className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-purple-500">
                What We Do
              </h2>
              <h3 className="mb-6 text-4xl font-black text-stone-950 md:text-5xl">
                Our Creative Services
              </h3>
              <p className="text-lg font-medium leading-relaxed text-stone-600 md:text-xl">
                Thoughtful services designed to elevate your event and leave a
                lasting impression.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <article
                ref={service1Ref}
                className={`group rounded-[2rem] border border-stone-100 bg-white p-7 shadow-lg shadow-stone-200/50 transition duration-500 hover:-translate-y-2 hover:border-purple-100 hover:shadow-2xl motion-reduce:transform-none md:p-10 ${fadeUpClass} ${getVisibleClass(
                  isService1Visible,
                )}`}
              >
                <div className="mb-7 flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-100 text-purple-600">
                  <Gift size={31} aria-hidden="true" />
                </div>

                <h4 className="mb-4 text-3xl font-black text-stone-950">
                  Custom Favours & Treats
                </h4>

                <p className="mb-7 font-medium leading-relaxed text-stone-600">
                  Personalized treats and takeaway gifts designed to coordinate
                  beautifully with your event theme and add a polished finishing
                  touch.
                </p>

                <div className="mb-7 h-56 overflow-hidden rounded-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1513885045260-6b3086b24c17?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=85"
                    alt="A selection of custom party treats and favours"
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04] motion-reduce:transform-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={() =>
                    chooseServiceAndScroll('Custom Favours & Treats')
                  }
                  className="inline-flex items-center rounded-full border border-purple-200 px-5 py-2.5 font-bold text-purple-700 transition hover:bg-purple-600 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
                >
                  Request this service
                  <ChevronRight size={18} className="ml-1.5" aria-hidden="true" />
                </button>
              </article>

              <article
                ref={service2Ref}
                className={`group rounded-[2rem] border border-stone-100 bg-white p-7 shadow-lg shadow-stone-200/50 transition duration-500 hover:-translate-y-2 hover:border-cyan-100 hover:shadow-2xl motion-reduce:transform-none md:p-10 ${fadeUpClass} ${getVisibleClass(
                  isService2Visible,
                )} delay-100`}
              >
                <div className="mb-7 flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-600">
                  <Palette size={31} aria-hidden="true" />
                </div>

                <h4 className="mb-4 text-3xl font-black text-stone-950">
                  Professional Face Painting
                </h4>

                <p className="mb-7 font-medium leading-relaxed text-stone-600">
                  Vibrant designs created with high-quality, skin-safe products
                  for birthdays, community events, festivals, and celebrations
                  of every kind.
                </p>

                <div className="mb-7 h-56 overflow-hidden rounded-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1596443423588-349f485db1f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=85"
                    alt="A face painting artist creating a colourful design"
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04] motion-reduce:transform-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={() =>
                    chooseServiceAndScroll('Professional Face Painting')
                  }
                  className="inline-flex items-center rounded-full border border-cyan-200 px-5 py-2.5 font-bold text-cyan-700 transition hover:bg-cyan-600 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2"
                >
                  Request this service
                  <ChevronRight size={18} className="ml-1.5" aria-hidden="true" />
                </button>
              </article>
            </div>
          </div>
        </section>

        <section
          id="contact"
          ref={contactRef}
          className="scroll-mt-20 overflow-hidden bg-white py-24"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div
              className={`relative overflow-hidden rounded-[2.25rem] border border-stone-800 bg-stone-950 p-7 text-white shadow-2xl md:p-14 lg:p-16 ${fadeUpClass} ${getVisibleClass(
                isContactVisible,
              )}`}
            >
              <div
                aria-hidden="true"
                className="absolute -right-24 -top-36 h-96 w-96 rounded-full bg-pink-500/25 blur-[110px]"
              />
              <div
                aria-hidden="true"
                className="absolute -bottom-36 -left-24 h-96 w-96 rounded-full bg-cyan-500/20 blur-[110px]"
              />

              <div className="relative z-10 grid grid-cols-1 items-center gap-14 lg:grid-cols-2">
                <div>
                  <h2 className="mb-6 text-4xl font-black leading-tight md:text-5xl lg:text-6xl">
                    Let&apos;s Create
                    <br />
                    <span className="bg-gradient-to-r from-yellow-300 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                      Magic Together
                    </span>
                  </h2>

                  <p className="mb-10 max-w-md text-lg font-medium leading-relaxed text-stone-300">
                    Tell us about your celebration, theme, and ideas. We&apos;ll
                    follow up to discuss availability and prepare a personalized
                    quote.
                  </p>

                  <div className="space-y-5">
                    <a
                      href={`mailto:${CONTACT.email}`}
                      className="group flex max-w-md items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition hover:-translate-y-0.5 hover:border-pink-400/40 hover:bg-pink-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 motion-reduce:transform-none"
                    >
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-pink-400">
                        <Mail size={23} aria-hidden="true" />
                      </span>
                      <span>
                        <span className="block text-xs font-bold uppercase tracking-wider text-stone-400">
                          Email
                        </span>
                        <span className="block break-all text-lg font-bold text-white group-hover:text-pink-300">
                          {CONTACT.email}
                        </span>
                      </span>
                    </a>

                    <a
                      href={CONTACT.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex max-w-md items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition hover:-translate-y-0.5 hover:border-purple-400/40 hover:bg-purple-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 motion-reduce:transform-none"
                    >
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-purple-400">
                        <Instagram size={23} aria-hidden="true" />
                      </span>
                      <span>
                        <span className="block text-xs font-bold uppercase tracking-wider text-stone-400">
                          Instagram
                        </span>
                        <span className="block text-lg font-bold text-white group-hover:text-purple-300">
                          {CONTACT.instagramHandle}
                        </span>
                      </span>
                    </a>
                  </div>
                </div>

                <div className="rounded-[1.75rem] bg-white p-6 text-stone-800 shadow-2xl sm:p-8 md:p-10">
                  <div aria-live="polite" aria-atomic="true">
                    {formStatus === 'success' ? (
                      <div className="flex min-h-[480px] flex-col items-center justify-center py-12 text-center">
                        <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600">
                          <Sparkles size={34} aria-hidden="true" />
                        </div>
                        <h3 className="mb-3 text-3xl font-black text-stone-950">
                          Inquiry Sent
                        </h3>
                        <p className="max-w-sm text-lg font-medium leading-relaxed text-stone-600">
                          Thank you for reaching out. We&apos;ll be in touch to
                          discuss your event.
                        </p>
                        <button
                          type="button"
                          onClick={() => setFormStatus('idle')}
                          className="mt-7 rounded-full border border-stone-300 px-6 py-3 font-bold text-stone-800 transition hover:border-pink-400 hover:bg-pink-50 hover:text-pink-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2"
                        >
                          Send another inquiry
                        </button>
                      </div>
                    ) : (
                      <form
                        name="quote-request"
                        method="POST"
                        data-netlify="true"
                        netlify-honeypot="bot-field"
                        onSubmit={handleFormSubmit}
                        className="space-y-5"
                      >
                        <input
                          type="hidden"
                          name="form-name"
                          value="quote-request"
                        />

                        <p className="hidden">
                          <label>
                            Do not fill this out if you are human:
                            <input name="bot-field" />
                          </label>
                        </p>

                        <div className="mb-7">
                          <h3 className="text-3xl font-black text-stone-950">
                            Request a Quote
                          </h3>
                          <div className="mt-2 h-1 w-20 rounded-full bg-gradient-to-r from-pink-500 to-cyan-500" />
                        </div>

                        <div>
                          <label
                            htmlFor="name"
                            className="mb-1.5 block text-sm font-bold text-stone-700"
                          >
                            Name
                          </label>
                          <input
                            id="name"
                            name="name"
                            type="text"
                            required
                            autoComplete="name"
                            className="w-full rounded-xl border-2 border-stone-200 bg-stone-50 px-4 py-3.5 font-medium outline-none transition hover:bg-white focus:border-pink-500 focus:bg-white focus:ring-0"
                            placeholder="Your full name"
                          />
                        </div>

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                          <div>
                            <label
                              htmlFor="email"
                              className="mb-1.5 block text-sm font-bold text-stone-700"
                            >
                              Email
                            </label>
                            <input
                              id="email"
                              name="email"
                              type="email"
                              required
                              autoComplete="email"
                              className="w-full rounded-xl border-2 border-stone-200 bg-stone-50 px-4 py-3.5 font-medium outline-none transition hover:bg-white focus:border-cyan-500 focus:bg-white focus:ring-0"
                              placeholder="you@email.com"
                            />
                          </div>

                          <div>
                            <label
                              htmlFor="event-date"
                              className="mb-1.5 block text-sm font-bold text-stone-700"
                            >
                              Event Date
                            </label>
                            <input
                              id="event-date"
                              name="eventDate"
                              type="date"
                              min={minimumEventDate}
                              className="w-full rounded-xl border-2 border-stone-200 bg-stone-50 px-4 py-3.5 font-medium text-stone-600 outline-none transition hover:bg-white focus:border-purple-500 focus:bg-white focus:ring-0"
                            />
                          </div>
                        </div>

                        <div>
                          <label
                            htmlFor="service"
                            className="mb-1.5 block text-sm font-bold text-stone-700"
                          >
                            Service Interested In
                          </label>
                          <select
                            id="service"
                            name="service"
                            value={serviceInterest}
                            onChange={(event) =>
                              setServiceInterest(
                                event.target
                                  .value as (typeof SERVICE_OPTIONS)[number],
                              )
                            }
                            className="w-full cursor-pointer rounded-xl border-2 border-stone-200 bg-stone-50 px-4 py-3.5 font-medium text-stone-700 outline-none transition hover:bg-white focus:border-pink-500 focus:bg-white focus:ring-0"
                          >
                            {SERVICE_OPTIONS.map((service) => (
                              <option key={service} value={service}>
                                {service}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label
                            htmlFor="event-details"
                            className="mb-1.5 block text-sm font-bold text-stone-700"
                          >
                            Event Details
                          </label>
                          <textarea
                            id="event-details"
                            name="eventDetails"
                            rows={4}
                            required
                            className="w-full resize-none rounded-xl border-2 border-stone-200 bg-stone-50 px-4 py-3.5 font-medium outline-none transition hover:bg-white focus:border-cyan-500 focus:bg-white focus:ring-0"
                            placeholder="Tell us about your theme, guest count, location, and vision..."
                          />
                        </div>

                        {formStatus === 'error' && (
                          <div
                            role="alert"
                            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
                          >
                            Your inquiry could not be sent. Please try again or
                            email us directly at {CONTACT.email}.
                          </div>
                        )}

                        <button
                          type="submit"
                          disabled={formStatus === 'submitting'}
                          className="w-full rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 py-4 text-lg font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-pink-500/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-65 motion-reduce:transform-none"
                        >
                          {formStatus === 'submitting'
                            ? 'Sending Inquiry...'
                            : 'Send Inquiry'}
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-stone-100 bg-white py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-7 px-4 sm:px-6 md:flex-row lg:px-8">
          <button
            type="button"
            onClick={() => scrollToSection('home')}
            className="group rounded-lg text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-4 md:text-left"
          >
            <span className="mb-2 flex justify-center text-2xl font-black tracking-tight md:justify-start">
              <span className="text-pink-500">Art</span>
              <span className="ml-1 text-stone-950">Haus</span>
              <span className="ml-1 text-cyan-500">Shan</span>
            </span>
            <span className="block max-w-xs text-sm font-medium leading-relaxed text-stone-500">
              Bringing creativity to life through custom party favours and
              professional face painting.
            </span>
          </button>

          <div className="flex items-center gap-3">
            <a
              href={CONTACT.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit Art Haus Shan on Instagram"
              className="rounded-full p-3 text-stone-400 transition hover:bg-pink-50 hover:text-pink-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500"
            >
              <Instagram size={25} aria-hidden="true" />
            </a>

            <a
              href={`mailto:${CONTACT.email}`}
              aria-label={`Email Art Haus Shan at ${CONTACT.email}`}
              className="rounded-full p-3 text-stone-400 transition hover:bg-cyan-50 hover:text-cyan-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
            >
              <Mail size={25} aria-hidden="true" />
            </a>
          </div>
        </div>

        <div className="mx-auto mt-10 flex max-w-7xl flex-col items-center justify-between gap-4 border-t border-stone-100 px-4 pt-7 text-center text-sm font-medium text-stone-400 sm:px-6 md:flex-row md:text-left lg:px-8">
          <p>
            &copy; {new Date().getFullYear()} Art Haus Shan. All rights reserved.
          </p>

          {(LEGAL_LINKS.privacy || LEGAL_LINKS.terms) && (
            <div className="flex gap-6">
              {LEGAL_LINKS.privacy && (
                <a
                  href={LEGAL_LINKS.privacy}
                  className="transition hover:text-stone-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-500"
                >
                  Privacy Policy
                </a>
              )}

              {LEGAL_LINKS.terms && (
                <a
                  href={LEGAL_LINKS.terms}
                  className="transition hover:text-stone-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-500"
                >
                  Terms of Service
                </a>
              )}
            </div>
          )}
        </div>
      </footer>
    </div>
  );
}