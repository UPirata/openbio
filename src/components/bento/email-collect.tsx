'use client';

import CardOverlay from '@/components/bento/overlay';
import { useCardSize } from '@/components/bento/use-card-size';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { useSaveBento } from '@/hooks/use-save-bento';
import { getErrorMessage } from '@/lib/errors';
import { cn } from '@/lib/utils';
import { api } from '@/trpc/react';
import type { EmailCollectBentoSchema } from '@/types';
import { Check, Mail, Pencil, Send } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import type * as z from 'zod';

type BentoData = z.infer<typeof EmailCollectBentoSchema>;

export const EMAIL_COLLECT_CARD_SIZES = ['2x2', '4x2', '4x4'] as const;

function SubscribeForm({
  bento,
  linkId,
  compact,
}: {
  bento: BentoData;
  linkId?: string;
  compact?: boolean;
}) {
  const t = useTranslations('cards');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const { mutate: subscribe, isPending } =
    api.profileLink.subscribe.useMutation({
      onSuccess: () => {
        setSubmitted(true);
        setEmail('');
        toast({
          title: t('subscribed'),
          description: t('subscribedDesc'),
        });
      },
      onError: (err) => {
        toast({
          title: t('error'),
          description: getErrorMessage(err),
        });
      },
    });

  const heading = bento.heading || t('stayInTouch');
  const description = bento.description || t('getNotified');
  const buttonText = bento.buttonText || t('subscribe');

  if (submitted) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-5 text-center">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <Check className="h-5 w-5 text-primary" />
        </div>
        <p className="font-cal text-sm">{t('youreSubscribed')}</p>
        <p className="text-muted-foreground text-xs">
          {t('thanksSubscribing')}
        </p>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex h-full w-full flex-col p-5">
        <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-muted/50">
          <Mail className="h-5 w-5 text-foreground" />
        </div>
        <div className="mt-auto space-y-2">
          <p className="font-cal text-sm leading-tight">{heading}</p>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (email && linkId) {
                subscribe({ linkId, email });
              }
            }}
          >
            <Input
              type="email"
              aria-label={t('emailAddress')}
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-8 rounded-lg text-xs"
              required
            />
            <Button
              type="submit"
              size="sm"
              className="h-8 shrink-0 rounded-lg px-2"
              disabled={isPending || !linkId}
              aria-label={t('subscribe')}
            >
              <Send className="h-3.5 w-3.5" />
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col justify-center gap-3 p-6">
      <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-muted/50">
        <Mail className="h-5 w-5 text-foreground" />
      </div>
      <div className="space-y-1">
        <p className="font-cal text-base leading-tight">{heading}</p>
        <p className="text-muted-foreground text-xs">{description}</p>
      </div>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (email && linkId) {
            subscribe({ linkId, email });
          }
        }}
      >
        <Input
          type="email"
          aria-label={t('emailAddress')}
          placeholder="you@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-xl"
          required
        />
        <Button
          type="submit"
          className="shrink-0 rounded-xl"
          disabled={isPending || !linkId}
        >
          {buttonText}
        </Button>
      </form>
    </div>
  );
}

export default function EmailCollectCard({
  bento,
  editable,
}: {
  bento: BentoData;
  editable?: boolean;
}) {
  const t = useTranslations('cards');
  const params = useParams<{ link: string }>();
  const [editOpen, setEditOpen] = useState(false);
  const [heading, setHeading] = useState(bento.heading ?? '');
  const [description, setDescription] = useState(bento.description ?? '');
  const [buttonText, setButtonText] = useState(bento.buttonText ?? '');

  const { data: profileLink } = api.profileLink.getByLink.useQuery({
    link: params.link,
  });
  const { saveBento, isPending: isSaving } = useSaveBento();

  const handleSave = async () => {
    const saved = await saveBento({
      ...bento,
      heading: heading || undefined,
      description: description || undefined,
      buttonText: buttonText || undefined,
    });
    if (!saved) {
      return;
    }
    setEditOpen(false);
  };

  const cardSize = useCardSize(bento);

  return (
    <>
      <div
        className={cn(
          'group relative z-0 h-full w-full select-none rounded-2xl border border-border bg-card shadow-sm',
          editable
            ? 'transition-transform duration-200 ease-in-out md:cursor-move'
            : 'hover:-translate-y-0.5 transition-all duration-200 hover:border-border/80 hover:shadow-md'
        )}
      >
        {editable && (
          <CardOverlay bento={bento} allowedSizes={EMAIL_COLLECT_CARD_SIZES} />
        )}

        {/* biome-ignore lint/nursery/noStaticElementInteractions: stops drag propagation so form inputs are usable */}
        <div
          role="presentation"
          className="relative z-10 h-full"
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <SubscribeForm
            bento={bento}
            linkId={profileLink?.id}
            compact={cardSize === '2x2'}
          />
        </div>

        {editable && (
          <button
            type="button"
            aria-label={t('editCard')}
            className="absolute top-3 right-3 z-50 cursor-pointer rounded-lg border border-border/50 bg-background/90 p-1.5 text-muted-foreground opacity-0 shadow-md backdrop-blur-sm transition-all hover:bg-accent hover:text-accent-foreground focus-visible:opacity-100 group-hover:opacity-100"
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              setEditOpen(true);
            }}
          >
            <Pencil className="h-4 w-4" />
          </button>
        )}
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-cal text-xl">
              {t('editEmailCollect')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ec-heading" className="font-medium text-sm">
                {t('heading')}
              </Label>
              <Input
                id="ec-heading"
                placeholder={t('stayInTouch')}
                value={heading}
                onChange={(e) => setHeading(e.target.value)}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ec-desc" className="font-medium text-sm">
                {t('description')}
              </Label>
              <Input
                id="ec-desc"
                placeholder={t('getNotified')}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ec-btn" className="font-medium text-sm">
                {t('buttonText')}
              </Label>
              <Input
                id="ec-btn"
                placeholder={t('subscribe')}
                value={buttonText}
                onChange={(e) => setButtonText(e.target.value)}
                className="rounded-xl"
              />
            </div>

            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full rounded-xl"
            >
              {isSaving ? t('saving') : t('save')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
