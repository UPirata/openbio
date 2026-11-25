import EmailDigestToggle from '@/components/email-digest-toggle';
import ManageBillingButton from '@/components/manage-billing-button';
import { PricingCards } from '@/components/pricing';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { auth } from '@/lib/auth';
import type { RouterOutputs } from '@/trpc/react';
import { getLocale, getTranslations } from 'next-intl/server';
import { headers } from 'next/headers';

export default async function UserSettings({
  user,
}: {
  user: NonNullable<RouterOutputs['user']['me']>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  const t = await getTranslations('settings');
  const tp = await getTranslations('pricing');
  const locale = await getLocale();

  return (
    <div className="flex w-full flex-col gap-y-6">
      <div className="flex flex-col gap-y-6 rounded-lg border border-border bg-background px-4 py-4 md:px-6 md:py-6">
        <div className="space-y-2">
          <Label>{t('avatar')}</Label>

          <Avatar>
            <AvatarImage src={session?.user?.image ?? undefined} />
            <AvatarFallback className="uppercase">
              {user.name?.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="space-y-2">
          <Label>{t('email')}</Label>

          <Input value={user.email} readOnly className="w-max" />
        </div>

        <div className="space-y-2">
          <Label>{t('name')}</Label>

          <Input value={user.name} readOnly className="w-max" />
        </div>

        <div className="space-y-2">
          <EmailDigestToggle defaultEnabled={user.emailDigest} />
        </div>

        <div className="flex flex-col space-y-2">
          <Label>{t('plan')}</Label>

          <span className="text-sm">
            {t.rich('subscribedTo', {
              plan: user.plan,
              badge: (chunks) => (
                <Badge className="mx-1 lowercase">{chunks}</Badge>
              ),
            })}
          </span>

          {user.plan !== 'free' && (
            <div className="flex flex-col gap-2 pt-2">
              {user.subscriptionEndsAt && (
                <p className="text-muted-foreground text-xs">
                  {t('paidThrough', {
                    date: user.subscriptionEndsAt.toLocaleDateString(locale, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    }),
                  })}
                </p>
              )}
              <ManageBillingButton />
            </div>
          )}

          <Tabs
            defaultValue="monthly"
            className="mt-8 flex w-full flex-col items-center"
          >
            <TabsList className="w-full md:mr-auto md:w-max">
              <TabsTrigger value="monthly">{tp('monthly')}</TabsTrigger>
              <TabsTrigger value="annually" className="gap-x-2">
                {tp('annually')}
                <Badge>{tp('twoMonthsFree')}</Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="monthly" className="mt-4 w-full">
              <PricingCards billing="monthly" user={user} />
            </TabsContent>

            <TabsContent value="annually" className="mt-4 w-full">
              <PricingCards billing="annually" user={user} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
