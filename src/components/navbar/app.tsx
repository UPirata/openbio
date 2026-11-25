'use client';

import { UserMenu } from '@/components/dashboard/user-menu';
import { LanguageSwitcher } from '@/components/language-switcher';
import { NavbarShell } from '@/components/navbar/shared';

export default function AppNavbar() {
  return (
    <NavbarShell>
      <LanguageSwitcher />
      <UserMenu />
    </NavbarShell>
  );
}
