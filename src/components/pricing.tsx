'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from '@/components/ui/use-toast';
import { authClient } from '@/lib/auth-client';
import { getErrorMessage } from '@/lib/errors';
import { PLANS } from '@/lib/plans';
import { withRedirect } from '@/lib/redirect';
import type { RouterOutputs } from '@/trpc/react';
import { Check, HelpCircle, Loader, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useState, useTransition } from 'react';
import Confetti from 'react-dom-confetti';

type Billing = 'monthly' | 'annually';

const TIER_ORDER = ['free', 'pro', 'business'];

/** Price per month. Annual plans are shown as their true monthly cost. */
function formatMonthlyPrice(amount: number, billing: Billing): string {
  const monthly = billing === 'annually' ? amount / 12 : amount;
  // $90 a year is $7.50 a month; rounding it to $8 overstates the price.
  return Number.isInteger(monthly) ? String(monthly) : monthly.toFixed(2);
}

function getPlanAction(
  currentPlan: string,
  plan: string
): 'currentPlan' | 'upgrade' | 'downgrade' {
  if (currentPlan === plan) {
    return 'currentPlan';
  }
  return TIER_ORDER.indexOf(plan) > TIER_ORDER.indexOf(currentPlan)
    ? 'upgrade'
    : 'downgrade';
}

export const PricingCards = ({
  billing,
  user,
}: {
  billing: Billing;
  user?: RouterOutputs['user']['me'];
}) => {
  const [isPending, startTransition] = useTransition();
  const t = useTranslations('pricing');
  const tp = useTranslations('plans');

  // Someone already paying changes or cancels their plan in Polar's portal.
  // Sending them through checkout again would start a second subscription
  // alongside the first and bill them for both.
  const hasSubscription = !!user && user.plan !== 'free';

  const handleCheckout = (plan: string) => {
    startTransition(async () => {
      try {
        if (hasSubscription || plan === 'free') {
          await authClient.customer.portal();
        } else {
          const slug = `${plan}-${billing === 'monthly' ? 'monthly' : 'yearly'}`;
          await authClient.checkoutEmbed({ slug });
        }
      } catch (err) {
        toast({
          title: t('billingError'),
          description: getErrorMessage(err),
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <div
      id="pricing"
      className="flex w-full flex-col gap-6 md:grid md:grid-cols-3"
    >
      {PLANS.map((plan) => (
        <div
          key={plan.name}
          className="flex w-full flex-col rounded-lg border border-border bg-background px-6 py-3 md:px-8"
        >
          <p className="font-cal text-lg">{tp(`${plan.slug}.name`)}</p>

          <p className="mt-0.5 text-muted-foreground text-sm">
            {tp(`${plan.slug}.description`)}
          </p>

          <p className="mt-3 font-cal text-4xl">
            ${formatMonthlyPrice(plan.price[billing].amount, billing)}
          </p>

          <p className="mt-1 text-muted-foreground text-xs">
            {t('perMonth')}
            {billing === 'annually' && t('billedAnnually')}
          </p>

          <div className="mt-3 flex w-full flex-col gap-1.5 text-left">
            {plan.features.map((f, idx) => (
              <span key={idx} className="inline-flex items-center text-sm">
                {f.notAvailable ? (
                  <X
                    className="mr-2.5 inline-block shrink-0 text-muted-foreground"
                    size={14}
                  />
                ) : (
                  <Check
                    className="mr-2.5 inline-block shrink-0 text-green-500"
                    size={14}
                  />
                )}
                {tp(`${plan.slug}.features.${idx}`)}
                {f.tooltip && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="ml-2">
                        <HelpCircle
                          className="inline-block text-muted-foreground"
                          size={16}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{tp(`${plan.slug}.tooltips.${idx}`)}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </span>
            ))}
          </div>

          <div className="my-auto" />

          {user ? (
            <Button
              className="mt-4"
              disabled={user.plan === plan.slug || isPending}
              onClick={() => {
                handleCheckout(plan.slug);
              }}
            >
              {isPending && (
                <Loader className="mr-2 inline-block animate-spin" size={16} />
              )}
              {t(getPlanAction(user.plan, plan.slug))}
            </Button>
          ) : (
            // Signed out (the landing page): every plan starts with an account.
            <Button
              asChild
              className="mt-4"
              variant={plan.slug === 'free' ? 'outline' : 'default'}
            >
              <Link
                href={
                  plan.slug === 'free'
                    ? '/claim-link'
                    : withRedirect('/app/sign-up', '/app?tab=settings')
                }
              >
                {plan.slug === 'free'
                  ? t('getStarted')
                  : t('getPlan', { plan: tp(`${plan.slug}.name`) })}
              </Link>
            </Button>
          )}

          {plan.footer && (
            <p className="mt-4 text-muted-foreground text-xs">{plan.footer}</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default function Pricing() {
  const [billing, setBilling] = useState<Billing>('monthly');
  const t = useTranslations('pricing');

  return (
    <div className="flex w-full flex-col">
      <h1 className="font-cal text-3xl md:text-5xl">
        {t('titleLine1')}
        <br />
        {t('titleLine2')}
      </h1>

      <p className="mt-4 text-lg md:text-xl">{t('subtitle')}</p>

      <Tabs
        defaultValue="monthly"
        value={billing}
        onValueChange={(v) => setBilling(v as Billing)}
        className="mt-8 flex w-full flex-col items-center"
      >
        <Confetti
          active={billing === 'annually'}
          config={{ elementCount: 250, spread: 100 }}
        />
        <TabsList className="w-max">
          <TabsTrigger value="monthly">{t('monthly')}</TabsTrigger>
          <TabsTrigger value="annually" className="gap-x-2">
            {t('annually')}
            <Badge>{t('twoMonthsFree')}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="monthly" className="mt-4 w-full">
          <PricingCards billing="monthly" />
        </TabsContent>

        <TabsContent value="annually" className="mt-4 w-full">
          <PricingCards billing="annually" />
        </TabsContent>

        <div className="mt-6 flex w-full flex-col rounded-lg border border-border bg-background px-3 py-3 text-center md:px-8">
          <p className="font-cal text-2xl">{t('enterprise')}</p>

          <p className="mt-1 text-muted-foreground">{t('enterpriseDesc')}</p>

          <Button asChild className="mx-auto mt-5 w-max">
            <Link
              href="https://cal.com/vanxh/30min"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('scheduleCall')}
            </Link>
          </Button>
        </div>
      </Tabs>
    </div>
  );
}
