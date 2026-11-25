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
import { cn } from '@/lib/utils';
import type { WeatherBentoSchema } from '@/types';
import { Locate, Pencil } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import type * as z from 'zod';

type BentoData = z.infer<typeof WeatherBentoSchema>;

export const WEATHER_CARD_SIZES = ['2x2', '4x2'] as const;

type WeatherData = {
  temp: number;
  feelsLike: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
};

const WEATHER_EMOJI: Record<string, string> = {
  '0': '☀️',
  '1': '🌤️',
  '2': '⛅',
  '3': '☁️',
  '45': '🌫️',
  '48': '🌫️',
  '51': '🌧️',
  '53': '🌧️',
  '55': '🌧️',
  '61': '🌧️',
  '63': '🌧️',
  '65': '🌧️',
  '71': '🌨️',
  '73': '🌨️',
  '75': '🌨️',
  '80': '🌦️',
  '81': '🌦️',
  '82': '🌦️',
  '95': '⛈️',
  '96': '⛈️',
  '99': '⛈️',
};

/** Open-Meteo weather codes → keys in the `weather` messages namespace. */
const WEATHER_DESC: Record<string, string> = {
  '0': 'clearSky',
  '1': 'mostlyClear',
  '2': 'partlyCloudy',
  '3': 'overcast',
  '45': 'foggy',
  '48': 'rimeFog',
  '51': 'lightDrizzle',
  '53': 'drizzle',
  '55': 'heavyDrizzle',
  '61': 'lightRain',
  '63': 'rain',
  '65': 'heavyRain',
  '71': 'lightSnow',
  '73': 'snow',
  '75': 'heavySnow',
  '80': 'lightShowers',
  '81': 'showers',
  '82': 'heavyShowers',
  '95': 'thunderstorm',
  '96': 'thunderstormHail',
  '99': 'severeThunderstorm',
};

function useWeather(lat: number, lng: number) {
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    if (!lat && !lng) {
      return;
    }
    let cancelled = false;

    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m`
    )
      .then((r) => r.json())
      .then((data) => {
        if (cancelled || !data.current) {
          return;
        }
        const code = String(data.current.weather_code);
        setWeather({
          temp: Math.round(data.current.temperature_2m),
          feelsLike: Math.round(data.current.apparent_temperature),
          description: WEATHER_DESC[code] ?? 'unknown',
          icon: WEATHER_EMOJI[code] ?? '🌡️',
          humidity: data.current.relative_humidity_2m,
          windSpeed: Math.round(data.current.wind_speed_10m),
        });
      })
      .catch(() => {
        // Weather API may fail
      });

    return () => {
      cancelled = true;
    };
  }, [lat, lng]);

  return weather;
}

function useReverseGeocode(lat: number, lng: number) {
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    if (!lat && !lng) {
      return;
    }
    let cancelled = false;

    fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=10`
    )
      .then((r) => r.json())
      .then((data) => {
        if (cancelled || !data.address) {
          return;
        }
        const city =
          data.address.city ||
          data.address.town ||
          data.address.village ||
          data.address.state;
        setName(city ?? null);
      })
      .catch(() => {
        /* ignore reverse geocode failures */
      });

    return () => {
      cancelled = true;
    };
  }, [lat, lng]);

  return name;
}

function CompactWeather({
  weather,
  locationName,
}: {
  weather: WeatherData;
  locationName?: string;
}) {
  const tw = useTranslations('weather');
  return (
    <div className="flex h-full w-full flex-col justify-between p-5">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-3xl">{weather.icon}</span>
        </div>
        <span className="font-cal text-3xl">{weather.temp}°</span>
      </div>
      <div className="space-y-0.5">
        <p className="font-cal text-sm leading-tight">
          {tw(weather.description)}
        </p>
        {locationName && (
          <p className="truncate text-muted-foreground text-xs">
            {locationName}
          </p>
        )}
      </div>
    </div>
  );
}

function WideWeather({
  weather,
  locationName,
}: {
  weather: WeatherData;
  locationName?: string;
}) {
  const t = useTranslations('cards');
  const tw = useTranslations('weather');
  return (
    <div className="flex h-full w-full items-center gap-6 p-6">
      <div className="flex items-center gap-4">
        <span className="text-4xl">{weather.icon}</span>
        <div>
          <span className="font-cal text-4xl">{weather.temp}°C</span>
          <p className="text-muted-foreground text-xs">
            {t('feelsLike')} {weather.feelsLike}°
          </p>
        </div>
      </div>
      <div className="h-10 w-px bg-border" />
      <div className="space-y-1">
        <p className="font-cal text-sm">{tw(weather.description)}</p>
        {locationName && (
          <p className="text-muted-foreground text-xs">{locationName}</p>
        )}
        <div className="flex gap-3 text-muted-foreground text-xs">
          <span>💧 {weather.humidity}%</span>
          <span>💨 {weather.windSpeed} km/h</span>
        </div>
      </div>
    </div>
  );
}

function WeatherContent({
  hasLocation,
  weather,
  editable,
  cardSize,
  displayLocation,
}: {
  hasLocation: boolean;
  weather: WeatherData | null;
  editable?: boolean;
  cardSize: string;
  displayLocation?: string;
}) {
  const t = useTranslations('cards');
  if (!hasLocation || !weather) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 rounded-2xl bg-muted/30">
        <span className="text-2xl">🌤️</span>
        <p className="text-muted-foreground text-xs">
          {editable && t('setLocation')}
          {!editable && !weather && t('loading')}
        </p>
      </div>
    );
  }
  if (cardSize === '4x2') {
    return <WideWeather weather={weather} locationName={displayLocation} />;
  }
  return <CompactWeather weather={weather} locationName={displayLocation} />;
}

export default function WeatherCard({
  bento,
  editable,
}: {
  bento: BentoData;
  editable?: boolean;
}) {
  const t = useTranslations('cards');
  const [editOpen, setEditOpen] = useState(false);
  const [latitude, setLatitude] = useState(String(bento.latitude || ''));
  const [longitude, setLongitude] = useState(String(bento.longitude || ''));
  const [locationName, setLocationName] = useState(bento.locationName ?? '');
  const [locating, setLocating] = useState(false);

  const weather = useWeather(bento.latitude, bento.longitude);
  const geocodedName = useReverseGeocode(bento.latitude, bento.longitude);
  const displayLocation = bento.locationName || geocodedName;

  const { saveBento, isPending } = useSaveBento();

  const handleUseMyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast({
        title: t('geoUnsupported'),
        description: t('geoUnsupportedDesc'),
      });
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(String(position.coords.latitude));
        setLongitude(String(position.coords.longitude));
        setLocating(false);
        toast({
          title: t('locationUpdated'),
          description: t('coordsFilled'),
        });
      },
      (err) => {
        setLocating(false);
        const msgs: Record<number, string> = {
          1: t('geoDenied'),
          2: t('geoUnavailable'),
          3: t('geoTimeout'),
        };
        toast({
          title: t('geoFailed'),
          description: msgs[err.code] ?? t('unknownError'),
        });
      },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  }, [t]);

  const handleSave = async () => {
    const lat = Number.parseFloat(latitude);
    const lng = Number.parseFloat(longitude);
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return;
    }

    const saved = await saveBento({
      ...bento,
      latitude: lat,
      longitude: lng,
      locationName: locationName || undefined,
    });
    if (!saved) {
      return;
    }
    setEditOpen(false);
  };

  const cardSize = useCardSize(bento);
  const hasLocation = bento.latitude !== 0 || bento.longitude !== 0;

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
          <CardOverlay bento={bento} allowedSizes={WEATHER_CARD_SIZES} />
        )}

        <WeatherContent
          hasLocation={hasLocation}
          weather={weather}
          editable={editable}
          cardSize={cardSize}
          displayLocation={displayLocation ?? undefined}
        />

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
              {t('editWeather')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Button
              type="button"
              variant="outline"
              className="w-full rounded-xl"
              disabled={locating}
              onClick={handleUseMyLocation}
            >
              <Locate className="mr-2 h-4 w-4" />
              {locating ? t('gettingLocation') : t('useMyLocation')}
            </Button>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="w-lat" className="font-medium text-sm">
                  {t('latitude')}
                </Label>
                <Input
                  id="w-lat"
                  placeholder="28.5355"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="w-lng" className="font-medium text-sm">
                  {t('longitude')}
                </Label>
                <Input
                  id="w-lng"
                  placeholder="77.3910"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="w-name" className="font-medium text-sm">
                {t('locationName')}
              </Label>
              <Input
                id="w-name"
                placeholder={t('autoDetected')}
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                className="rounded-xl"
              />
            </div>

            <Button
              onClick={handleSave}
              disabled={isPending}
              className="w-full rounded-xl"
            >
              {isPending ? t('saving') : t('save')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
