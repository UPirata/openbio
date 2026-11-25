'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { getErrorMessage } from '@/lib/errors';
import { api } from '@/trpc/react';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { type ReactNode, useState } from 'react';

/** Confirms, then permanently deletes a profile page. */
export function DeleteLinkDialog({
  link,
  children,
}: {
  link: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const t = useTranslations('linkCard');
  const tc = useTranslations('common');
  const router = useRouter();
  const utils = api.useUtils();

  const { mutate: deleteLink, isPending } = api.profileLink.delete.useMutation({
    onSuccess: async () => {
      setOpen(false);
      toast({
        title: t('deleted'),
        description: t('deletedDesc', { link }),
      });
      await utils.profileLink.getAll.invalidate();
      // The dashboard list is server-rendered.
      router.refresh();
    },
    onError: (err) => {
      toast({
        title: t('deleteError'),
        description: getErrorMessage(err),
        variant: 'destructive',
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={(next) => !isPending && setOpen(next)}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-cal text-xl">
            {t('deleteTitle')}
          </DialogTitle>
          <DialogDescription>
            {t.rich('deleteDesc', {
              link,
              b: (chunks) => (
                <span className="font-medium text-foreground">{chunks}</span>
              ),
            })}
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-end gap-3">
          <Button
            variant="outline"
            className="rounded-xl px-6"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            {tc('cancel')}
          </Button>
          <Button
            variant="destructive"
            className="rounded-xl px-6"
            onClick={() => deleteLink({ link })}
            disabled={isPending}
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {t('deletePage')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
