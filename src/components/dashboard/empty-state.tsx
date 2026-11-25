import { GradientButton } from '@/components/ui/gradient-button';
import { Sparkles } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

export async function EmptyState() {
  const t = await getTranslations('dashboard');
  return (
    <div className="flex flex-col items-center rounded-2xl border border-border border-dashed bg-card p-12 text-center">
      <div className="mb-4 rounded-full bg-muted p-4">
        <Sparkles className="h-8 w-8 text-foreground" />
      </div>
      <h3 className="font-cal text-xl">{t('noPages')}</h3>
      <p className="mt-1 text-muted-foreground text-sm">{t('createFirst')}</p>
      <Link href="/claim-link" className="mt-6">
        <GradientButton>{t('createPage')}</GradientButton>
      </Link>
    </div>
  );
}
