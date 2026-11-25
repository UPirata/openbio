import { GradientButton } from '@/components/ui/gradient-button';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

export default async function NotFound() {
  const t = await getTranslations('notFound');
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="animate-fade-up text-center">
        <span className="text-6xl">😢</span>
        <h1 className="mt-6 font-cal text-4xl">{t('title')}</h1>
        <p className="mt-2 text-muted-foreground">{t('description')}</p>
        <Link href="/" className="mt-8 inline-block">
          <GradientButton>{t('goHome')}</GradientButton>
        </Link>
      </div>
    </div>
  );
}
