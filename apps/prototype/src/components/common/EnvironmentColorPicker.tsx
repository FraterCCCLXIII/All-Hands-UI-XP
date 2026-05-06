import { useState } from 'react';

import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

function expandShortHex(hex: string): string {
  const h = hex.replace('#', '');
  if (h.length === 3) {
    return (
      '#' +
      h
        .split('')
        .map((c) => c + c)
        .join('')
    );
  }
  return '#' + h;
}

function normalizeHex(input: string, fallback: string): string {
  let s = input.trim();
  if (!s.startsWith('#')) s = `#${s}`;
  if (s.length === 4) s = expandShortHex(s);
  if (!/^#[0-9a-fA-F]{6}$/.test(s)) return fallback;
  return `#${s.slice(1).toLowerCase()}`;
}

function hexToRgb(hex: string): [number, number, number] | null {
  const s = normalizeHex(hex, '#000000');
  const m = /^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(s);
  if (!m) return null;
  return [parseInt(m[1]!, 16), parseInt(m[2]!, 16), parseInt(m[3]!, 16)];
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b]
    .map((x) => clamp(Math.round(x), 0, 255).toString(16).padStart(2, '0'))
    .join('')}`;
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  const l = (max + min) / 2;
  let s = 0;
  if (d !== 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
    }
    h /= 6;
  }
  return { h: h * 360, s, l };
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h = ((h % 360) + 360) % 360;
  h /= 360;
  let r: number;
  let g: number;
  let b: number;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

/** Curated palette aligned with backend / environment accents in the prototype. */
const PRESET_COLORS = [
  '#64748b',
  '#3b82f6',
  '#0ea5e9',
  '#06b6d4',
  '#22c55e',
  '#eab308',
  '#f59e0b',
  '#ef4444',
  '#ec4899',
  '#a855f7',
  '#6366f1',
  '#0d9488',
] as const;

export interface EnvironmentColorPickerProps {
  value: string;
  onChange: (hex: string) => void;
  fallbackHex?: string;
  /** `id` for the swatch trigger button (for `<label htmlFor>`). */
  swatchId?: string;
}

/**
 * Theme-aware color control: circular swatch + “Select” opens a popover with presets and a hue slider (no native `<input type="color">`).
 */
export function EnvironmentColorPicker({
  value,
  onChange,
  fallbackHex = '#3b82f6',
  swatchId = 'environment-color-swatch',
}: EnvironmentColorPickerProps) {
  const display = normalizeHex(value, fallbackHex);
  const [open, setOpen] = useState(false);

  const rgb = hexToRgb(display) ?? hexToRgb(fallbackHex)!;
  const { h, s, l } = rgbToHsl(rgb[0], rgb[1], rgb[2]);

  const applyHue = (hue: number) => {
    const [r, g, b] = hslToRgb(hue, s, l);
    onChange(rgbToHex(r, g, b));
  };

  const selectPreset = (hex: string) => {
    onChange(normalizeHex(hex, fallbackHex));
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <div className="flex items-center gap-2">
        <PopoverTrigger asChild>
          <button
            id={swatchId}
            type="button"
            className={cn(
              'h-10 w-10 shrink-0 rounded-full border border-border bg-background p-0',
              'transition-[transform,box-shadow] hover:scale-105 hover:ring-2 hover:ring-ring/40 hover:shadow-sm',
              'outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
              'data-[state=open]:ring-2 data-[state=open]:ring-ring data-[state=open]:ring-offset-2 data-[state=open]:ring-offset-background'
            )}
            style={{ backgroundColor: display }}
            aria-label="Open environment color picker"
          />
        </PopoverTrigger>
        <Button type="button" variant="outline" className="h-10 shrink-0 px-4" onClick={() => setOpen(true)}>
          Select
        </Button>
        <Input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={fallbackHex}
          className="h-10 w-28 shrink-0 font-mono text-sm"
        />
      </div>

      <PopoverContent
        align="start"
        sideOffset={8}
        hugContent
        className={cn(
          'z-[140] border-border bg-popover p-3 text-popover-foreground shadow-md',
          'max-h-none overflow-visible'
        )}
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <div className="flex w-[220px] flex-col gap-3">
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Presets</p>
            <div className="grid grid-cols-6 gap-2">
              {PRESET_COLORS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  className={cn(
                    'h-7 w-7 shrink-0 rounded-full border-2 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                    display.toLowerCase() === preset.toLowerCase() ? 'border-foreground shadow-sm' : 'border-border'
                  )}
                  style={{ backgroundColor: preset }}
                  onClick={() => selectPreset(preset)}
                  aria-label={`Use color ${preset}`}
                  aria-pressed={display.toLowerCase() === preset.toLowerCase()}
                />
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Hue</p>
            <div
              className="rounded-md px-0.5 py-1"
              style={{
                background:
                  'linear-gradient(to right, hsl(0,70%,50%), hsl(60,70%,50%), hsl(120,70%,50%), hsl(180,70%,50%), hsl(240,70%,50%), hsl(300,70%,50%), hsl(360,70%,50%))',
              }}
            >
              <input
                type="range"
                min={0}
                max={360}
                step={1}
                value={Math.round(h)}
                onChange={(event) => applyHue(Number(event.target.value))}
                className={cn(
                  'h-2 w-full cursor-pointer appearance-none rounded-full bg-transparent',
                  '[&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-border [&::-webkit-slider-thumb]:bg-card [&::-webkit-slider-thumb]:shadow',
                  '[&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-border [&::-moz-range-thumb]:bg-card [&::-moz-range-thumb]:shadow'
                )}
                aria-label="Adjust hue"
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
