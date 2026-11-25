'use client';

import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/use-toast';
import { api } from '@/trpc/react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

export default function EmailDigestToggle({
  defaultEnabled,
}: {
  defaultEnabled: boolean;
}) {
  const [enabled, setEnabled] = useState(defaultEnabled);
  const t = useTranslations('settings');

  const { mutate } = api.user.updateEmailDigest.useMutation({
    onSuccess: (data) => {
      setEnabled(data.emailDigest);
      toast({
        title: data.emailDigest ? t('digestEnabled') : t('digestDisabled'),
        description: data.emailDigest ? t('digestOn') : t('digestOff'),
      });
    },
  });

  return (
    <div className="flex items-center justify-between">
      <div className="space-y-0.5">
        <Label htmlFor="email-digest">{t('digestLabel')}</Label>
        <p className="text-muted-foreground text-xs">{t('digestHelp')}</p>
      </div>
      <Switch
        id="email-digest"
        checked={enabled}
        onCheckedChange={(checked) => mutate({ enabled: checked })}
      />
    </div>
  );
}
