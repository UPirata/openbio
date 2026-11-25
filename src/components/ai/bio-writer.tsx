'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { api } from '@/trpc/react';
import { useCompletion } from '@ai-sdk/react';
import { Loader2, Sparkles, Wand2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { type ReactNode, useState } from 'react';

const TONES = [
  { value: 'casual' },
  { value: 'professional' },
  { value: 'creative' },
  { value: 'minimal' },
] as const;

export default function BioWriter({
  name,
  links,
  onGenerated,
  children,
}: {
  name: string;
  links?: string[];
  onGenerated: (bio: string) => void;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const tr = useTranslations('ai');
  const tc = useTranslations('common');
  const [tone, setTone] = useState<(typeof TONES)[number]['value']>('casual');
  const [context, setContext] = useState('');

  const { data: credits } = api.ai.getCredits.useQuery(undefined, {
    enabled: open,
  });

  const { completion, isLoading, complete } = useCompletion({
    api: '/api/ai/generate',
    onError: (err) => {
      toast({
        title: tc('error'),
        description: err.message,
        variant: 'destructive',
      });
    },
  });

  const handleGenerate = () => {
    complete('generate', {
      body: { type: 'bio', name, links, tone, context: context || undefined },
    });
  };

  const handleApply = () => {
    onGenerated(completion);
    setOpen(false);
    toast({
      title: tr('bioUpdated'),
      description: tr('bioUpdatedDesc'),
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-cal text-xl">
            <Sparkles className="h-4 w-4 text-violet-500" />
            {tr('bioWriter')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {credits && (
            <p className="text-muted-foreground text-xs">
              {tr('creditsRemaining', {
                remaining: credits.remaining,
                limit: credits.limit,
              })}
            </p>
          )}

          <div className="space-y-2">
            <Label className="font-medium text-sm">{tr('tone')}</Label>
            <div className="flex gap-2">
              {TONES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setTone(t.value)}
                  className={`rounded-lg px-3 py-1.5 font-medium text-xs transition-colors ${
                    tone === t.value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-accent'
                  }`}
                >
                  {tr(`tones.${t.value}`)}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ai-context" className="font-medium text-sm">
              {tr('aboutYou')}{' '}
              <span className="font-normal text-muted-foreground">
                {tr('optional')}
              </span>
            </Label>
            <Input
              id="ai-context"
              placeholder={tr('contextPlaceholder')}
              value={context}
              onChange={(e) => setContext(e.target.value)}
              className="rounded-xl"
            />
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isLoading || (credits?.remaining ?? 0) < 1}
            className="w-full rounded-xl"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="mr-2 h-4 w-4" />
            )}
            {isLoading ? tr('generating') : tr('generateBio')}
          </Button>

          {completion && (
            <div className="space-y-3">
              <div className="rounded-xl border border-border bg-muted/50 p-4">
                <p className="text-sm leading-relaxed">{completion}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl"
                  onClick={handleGenerate}
                  disabled={isLoading}
                >
                  {tr('regenerate')}
                </Button>
                <Button
                  className="flex-1 rounded-xl"
                  onClick={handleApply}
                  disabled={isLoading}
                >
                  {tr('apply')}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
