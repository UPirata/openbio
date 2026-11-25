import Pricing from '@/components/pricing';
import { GradientButton } from '@/components/ui/gradient-button';
import { PillBadge } from '@/components/ui/pill-badge';
import { BarChart3, Code2, Link2, Moon, Share2, Sparkles } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { BsTwitterX } from 'react-icons/bs';
import { FaGithub } from 'react-icons/fa';

const features = [
  {
    icon: Link2,
    key: 'bento',
  },
  {
    icon: BarChart3,
    key: 'analytics',
  },
  {
    icon: Share2,
    key: 'social',
  },
  {
    icon: Sparkles,
    key: 'custom',
  },
  {
    icon: Moon,
    key: 'dark',
  },
  {
    icon: Code2,
    key: 'open',
  },
];

export default async function Page() {
  const t = await getTranslations('home');

  return (
    <div className="flex flex-col items-center">
      {/* Hero */}
      <section className="flex w-full max-w-5xl flex-col items-center px-4 pt-32 pb-20 text-center">
        <Link
          href="https://x.com/Vanxhh/status/2041086066632044841"
          target="_blank"
          rel="noopener noreferrer"
        >
          <PillBadge className="animate-fade-up gap-2 transition-colors hover:bg-accent">
            <BsTwitterX className="h-3 w-3" />
            {t('launchBadge')}
            <span className="text-muted-foreground">→</span>
          </PillBadge>
        </Link>

        <h1
          className="mt-6 animate-fade-up font-cal text-5xl leading-tight md:text-7xl"
          style={{ animationDelay: '0.1s' }}
        >
          {t('heroLine1')}
          <br />
          {t('heroLine2')}
        </h1>

        <p
          className="mt-4 max-w-lg animate-fade-up text-lg text-muted-foreground"
          style={{ animationDelay: '0.2s' }}
        >
          {t('subtitle')}
        </p>

        <div
          className="mt-8 flex animate-fade-up flex-col items-center gap-3 sm:flex-row"
          style={{ animationDelay: '0.3s' }}
        >
          <Link href="/claim-link">
            <GradientButton size="lg">{t('claim')}</GradientButton>
          </Link>
          <Link href="/github" target="_blank" rel="noopener noreferrer">
            <button
              className="inline-flex items-center gap-x-2 rounded-full border border-border bg-background px-6 py-3 font-medium text-base shadow-sm transition-all duration-200 hover:scale-105 hover:shadow-md active:scale-95"
              type="button"
            >
              <FaGithub className="h-5 w-5" />
              {t('star')}
            </button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="w-full max-w-5xl px-4 py-20">
        <h2 className="text-center font-cal text-3xl md:text-4xl">
          {t('featuresTitle')}
        </h2>
        <p className="mt-2 text-center text-muted-foreground">
          {t('featuresSubtitle')}
        </p>

        <div className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.key}
              className="group rounded-2xl border border-border/50 bg-card p-6 shadow-md transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
            >
              <div className="mb-3 inline-flex rounded-xl bg-muted p-2.5">
                <feature.icon className="h-5 w-5 text-foreground" />
              </div>
              <h3 className="font-cal text-lg">
                {t(`features.${feature.key}Title`)}
              </h3>
              <p className="mt-1 text-muted-foreground text-sm">
                {t(`features.${feature.key}Desc`)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="w-full max-w-5xl px-4 py-20">
        <Pricing />
      </section>
    </div>
  );
}
