import '@/styles/globals.css';
import ClientProviders from '@/app/client-providers';
import {
  defaultMetadata,
  ogMetadata,
  twitterMetadata,
} from '@/app/shared-metadata';
import Background from '@/components/background';
import { TailwindIndicator } from '@/components/tailwind-indicator';
import { Toaster } from '@/components/ui/toaster';
import { Analytics } from '@vercel/analytics/react';
import type { Metadata, Viewport } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale } from 'next-intl/server';
import { Geist } from 'next/font/google';
import LocalFont from 'next/font/local';
import type { ReactNode } from 'react';

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-sans',
});

const calSans = LocalFont({
  src: '../../public/fonts/CalSans-SemiBold.ttf',
  variable: '--font-calsans',
});

export const metadata: Metadata = {
  ...defaultMetadata,
  twitter: {
    ...twitterMetadata,
  },
  openGraph: {
    ...ogMetadata,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  // No maximumScale: capping it stops people who need larger text from
  // pinch-zooming.
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const locale = await getLocale();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${geist.variable} ${calSans.variable} font-sans`}>
        <Background />

        <NextIntlClientProvider>
          <ClientProviders>{children}</ClientProviders>
        </NextIntlClientProvider>

        <Toaster />
        <TailwindIndicator />
        <Analytics />
      </body>
    </html>
  );
}
