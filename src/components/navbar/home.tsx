'use client';

import { LanguageSwitcher } from '@/components/language-switcher';
import { NavbarShell } from '@/components/navbar/shared';
import { GradientButton } from '@/components/ui/gradient-button';
import { useSession } from '@/lib/auth-client';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function HomeNavbar() {
  const { data: session } = useSession();
  const t = useTranslations('nav');

  return (
    <NavbarShell>
      <Link
        href="/explore"
        className="text-muted-foreground text-sm transition-colors hover:text-foreground"
      >
        {t('explore')}
      </Link>
      {!session && (
        <Link
          href="/app/sign-in"
          className="text-muted-foreground text-sm transition-colors hover:text-foreground"
        >
          {t('signIn')}
        </Link>
      )}
      <LanguageSwitcher />
      <Link href={session ? '/app' : '/claim-link'}>
        <GradientButton size="sm">
          {session ? t('goToApp') : t('getStarted')}
        </GradientButton>
      </Link>
    </NavbarShell>
  );
}
