/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
"use client";

import type React from "react";

import type { ClassValue } from "class-variance-authority/types";
import type { Control, FieldValues, Path } from "react-hook-form";
import { useState, useRef, useEffect } from "react";
import { Palette, Pipette, RotateCcw, Check, ChevronDown } from "lucide-react";

import { cn, splitCamelCaseToWords } from "~/lib/utils";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Slider } from "~/components/ui/slider";

type ColorFormat = "hex" | "rgb" | "hsl";
type ColorPickerVariant = "default" | "compact" | "inline";

interface ColorValue {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
}

interface CustomColorPickerProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  placeholder?: string;
  description?: string;
  format?: ColorFormat;
  variant?: ColorPickerVariant;
  showPresets?: boolean;
  showEyedropper?: boolean;
  showRecentColors?: boolean;
  allowTransparent?: boolean;
  presetColors?: string[];
  isNotLabeled?: boolean;
  disabled?: boolean;
  hidden?: boolean;
  readOnly?: boolean;
  onColorChange?: (color: string) => void;
  fieldClassName?: ClassValue;
  labelClassName?: ClassValue;
  inputClassName?: ClassValue;
  popoverContentClassName?: ClassValue;
  previewClassName?: ClassValue;
}

// Default preset colors
const DEFAULT_PRESET_COLORS = [
  "#FF0000",
  "#FF8000",
  "#FFFF00",
  "#80FF00",
  "#00FF00",
  "#00FF80",
  "#00FFFF",
  "#0080FF",
  "#0000FF",
  "#8000FF",
  "#FF00FF",
  "#FF0080",
  "#800000",
  "#804000",
  "#808000",
  "#408000",
  "#008000",
  "#008040",
  "#008080",
  "#004080",
  "#000080",
  "#400080",
  "#800080",
  "#800040",
  "#400000",
  "#402000",
  "#404000",
  "#204000",
  "#004000",
  "#004020",
  "#004040",
  "#002040",
  "#000040",
  "#200040",
  "#400040",
  "#400020",
  "#000000",
  "#404040",
  "#808080",
  "#C0C0C0",
  "#FFFFFF",
];

// Color utility functions
const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: Number.parseInt(result[1]!, 16),
        g: Number.parseInt(result[2]!, 16),
        b: Number.parseInt(result[3]!, 16),
      }
    : { r: 0, g: 0, b: 0 };
};

const rgbToHex = (r: number, g: number, b: number): string => {
  return (
    "#" +
    [r, g, b]
      .map((x) => {
        const hex = Math.round(x).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
  );
};

const rgbToHsl = (
  r: number,
  g: number,
  b: number,
): { h: number; s: number; l: number } => {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
};

const hslToRgb = (
  h: number,
  s: number,
  l: number,
): { r: number; g: number; b: number } => {
  h /= 360;
  s /= 100;
  l /= 100;

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  if (s === 0) {
    return { r: l * 255, g: l * 255, b: l * 255 };
  }

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const r = hue2rgb(p, q, h + 1 / 3);
  const g = hue2rgb(p, q, h);
  const b = hue2rgb(p, q, h - 1 / 3);

  return { r: r * 255, g: g * 255, b: b * 255 };
};

const parseColor = (color: string): ColorValue => {
  const hex = color.startsWith("#") ? color : `#${color}`;
  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  return { hex, rgb, hsl };
};

const formatColor = (color: ColorValue, format: ColorFormat): string => {
  switch (format) {
    case "rgb":
      return `rgb(${Math.round(color.rgb.r)}, ${Math.round(color.rgb.g)}, ${Math.round(color.rgb.b)})`;
    case "hsl":
      return `hsl(${Math.round(color.hsl.h)}, ${Math.round(color.hsl.s)}%, ${Math.round(color.hsl.l)}%)`;
    default:
      return color.hex;
  }
};

// Color Picker Component
interface ColorPickerProps {
  initialColor: string;
  format: ColorFormat;
  showPresets: boolean;
  showEyedropper: boolean;
  presetColors: string[];
  onColorSelect: (color: string) => void;
  onCancel: () => void;
  popoverContentClassName?: ClassValue;
}

const ColorPicker: React.FC<ColorPickerProps> = ({
  initialColor,
  format,
  showPresets,
  showEyedropper,
  presetColors,
  onColorSelect,
  onCancel,
  popoverContentClassName,
}) => {
  const [currentColor, setCurrentColor] = useState<ColorValue>(() =>
    parseColor(initialColor || "#000000"),
  );
  const [recentColors, setRecentColors] = useState<string[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hueCanvasRef = useRef<HTMLCanvasElement>(null);

  // Initialize color wheel canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const hueCanvas = hueCanvasRef.current;
    if (!canvas || !hueCanvas) return;

    const ctx = canvas.getContext("2d");
    const hueCtx = hueCanvas.getContext("2d");
    if (!ctx || !hueCtx) return;

    // Draw color wheel
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;

    const imageData = ctx.createImageData(canvas.width, canvas.height);
    const data = imageData.data;

    for (let x = 0; x < canvas.width; x++) {
      for (let y = 0; y < canvas.height; y++) {
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= radius) {
          const angle = Math.atan2(dy, dx);
          const hue = ((angle * 180) / Math.PI + 360) % 360;
          const saturation = (distance / radius) * 100;
          const lightness = 50;

          const rgb = hslToRgb(hue, saturation, lightness);
          const index = (y * canvas.width + x) * 4;

          data[index] = rgb.r;
          data[index + 1] = rgb.g;
          data[index + 2] = rgb.b;
          data[index + 3] = 255;
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);

    // Draw hue bar
    const gradient = hueCtx.createLinearGradient(0, 0, hueCanvas.width, 0);
    for (let i = 0; i <= 360; i += 60) {
      const rgb = hslToRgb(i, 100, 50);
      gradient.addColorStop(i / 360, `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`);
    }
    hueCtx.fillStyle = gradient;
    hueCtx.fillRect(0, 0, hueCanvas.width, hueCanvas.height);
  }, []);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const dx = x - centerX;
    const dy = y - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const radius = Math.min(centerX, centerY) - 10;

    if (distance <= radius) {
      const angle = Math.atan2(dy, dx);
      const hue = ((angle * 180) / Math.PI + 360) % 360;
      const saturation = (distance / radius) * 100;
      const lightness = currentColor.hsl.l;

      const rgb = hslToRgb(hue, saturation, lightness);
      const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
      const newColor = {
        hex,
        rgb,
        hsl: { h: hue, s: saturation, l: lightness },
      };
      setCurrentColor(newColor);
    }
  };

  const handleHueClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = hueCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const hue = (x / canvas.width) * 360;

    const rgb = hslToRgb(hue, currentColor.hsl.s, currentColor.hsl.l);
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    const newColor = { hex, rgb, hsl: { ...currentColor.hsl, h: hue } };
    setCurrentColor(newColor);
  };

  const handlePresetClick = (color: string) => {
    const newColor = parseColor(color);
    setCurrentColor(newColor);
  };

  const handleEyedropper = async () => {
    if ("EyeDropper" in window) {
      try {
        // @ts-expect-error - EyeDropper is not in TypeScript types yet
        const eyeDropper = new EyeDropper();
        const result = await eyeDropper.open();
        const newColor = parseColor(result.sRGBHex as unknown as string);
        setCurrentColor(newColor);
      } catch (e) {
        console.log("Eyedropper cancelled or failed", e);
      }
    }
  };

  const handleConfirm = () => {
    const formattedColor = formatColor(currentColor, format);

    // Add to recent colors
    setRecentColors((prev) => {
      const newRecent = [
        currentColor.hex,
        ...prev.filter((c) => c !== currentColor.hex),
      ].slice(0, 8);
      return newRecent;
    });

    onColorSelect(formattedColor);
  };

  return (
    <div className={cn("w-80 p-4", popoverContentClassName)}>
      <Tabs defaultValue="wheel" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="wheel">Wheel</TabsTrigger>
          <TabsTrigger value="sliders">Sliders</TabsTrigger>
          {showPresets && <TabsTrigger value="presets">Presets</TabsTrigger>}
        </TabsList>

        <TabsContent value="wheel" className="space-y-4">
          <div className="flex flex-col items-center space-y-3">
            <canvas
              ref={canvasRef}
              width={200}
              height={200}
              className="cursor-crosshair rounded-lg border"
              onClick={handleCanvasClick}
            />
            <canvas
              ref={hueCanvasRef}
              width={200}
              height={20}
              className="cursor-crosshair rounded border"
              onClick={handleHueClick}
            />
          </div>
        </TabsContent>

        <TabsContent value="sliders" className="space-y-4">
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Hue</label>
              <Slider
                value={[currentColor.hsl.h]}
                onValueChange={([h]: [h: number]) => {
                  const rgb = hslToRgb(
                    h,
                    currentColor.hsl.s,
                    currentColor.hsl.l,
                  );
                  const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
                  setCurrentColor({
                    hex,
                    rgb,
                    hsl: { ...currentColor.hsl, h },
                  });
                }}
                max={360}
                step={1}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Saturation</label>
              <Slider
                value={[currentColor.hsl.s]}
                onValueChange={([s]: [s: number]) => {
                  const rgb = hslToRgb(
                    currentColor.hsl.h,
                    s,
                    currentColor.hsl.l,
                  );
                  const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
                  setCurrentColor({
                    hex,
                    rgb,
                    hsl: { ...currentColor.hsl, s },
                  });
                }}
                max={100}
                step={1}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Lightness</label>
              <Slider
                value={[currentColor.hsl.l]}
                onValueChange={([l]: [l: number]) => {
                  const rgb = hslToRgb(
                    currentColor.hsl.h,
                    currentColor.hsl.s,
                    l,
                  );
                  const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
                  setCurrentColor({
                    hex,
                    rgb,
                    hsl: { ...currentColor.hsl, l },
                  });
                }}
                max={100}
                step={1}
                className="w-full"
              />
            </div>
          </div>
        </TabsContent>

        {showPresets && (
          <TabsContent value="presets" className="space-y-4">
            <div className="grid grid-cols-8 gap-2">
              {presetColors.map((color, index) => (
                <button
                  key={index}
                  className="h-8 w-8 rounded border-2 border-gray-200 transition-colors hover:border-gray-400"
                  style={{ backgroundColor: color }}
                  onClick={() => handlePresetClick(color)}
                  title={color}
                />
              ))}
            </div>
            {recentColors.length > 0 && (
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Recent Colors
                </label>
                <div className="grid grid-cols-8 gap-2">
                  {recentColors.map((color, index) => (
                    <button
                      key={index}
                      className="h-8 w-8 rounded border-2 border-gray-200 transition-colors hover:border-gray-400"
                      style={{ backgroundColor: color }}
                      onClick={() => handlePresetClick(color)}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        )}
      </Tabs>

      <div className="mt-4 flex items-center justify-between border-t pt-4">
        <div className="flex items-center space-x-2">
          <div
            className="h-8 w-8 rounded border-2 border-gray-200"
            style={{ backgroundColor: currentColor.hex }}
          />
          <Input
            value={currentColor.hex}
            onChange={(e) => {
              try {
                const newColor = parseColor(e.target.value);
                setCurrentColor(newColor);
              } catch (e) {
                console.log(e);
              }
            }}
            className="w-20 text-xs"
            placeholder="#000000"
          />
        </div>

        <div className="flex items-center space-x-2">
          {showEyedropper && "EyeDropper" in window && (
            <Button variant="outline" size="icon" onClick={handleEyedropper}>
              <Pipette className="h-4 w-4" />
            </Button>
          )}
          <Button variant="outline" size="icon" onClick={onCancel}>
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button size="icon" onClick={handleConfirm}>
            <Check className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default function CustomColorPicker<T extends FieldValues>({
  control,
  name,
  label = "",
  placeholder = "Select color",
  description = "",
  format = "hex",
  variant = "default",
  showPresets = true,
  showEyedropper = true,
//   showRecentColors = true,
//   allowTransparent = false,
  presetColors = DEFAULT_PRESET_COLORS,
  isNotLabeled = false,
  disabled = false,
  hidden = false,
  readOnly = false,
  onColorChange,
  fieldClassName = "",
  labelClassName = "",
  inputClassName = "",
  popoverContentClassName = "",
  previewClassName = "",
}: CustomColorPickerProps<T>) {
  const [open, setOpen] = useState(false);

  const renderColorInput = (field: any, fieldState: any) => {
    const currentColor = field.value ?? "#000000";

    const handleColorSelect = (color: string) => {
      field.onChange(color);
      onColorChange?.(color);
      setOpen(false);
    };

    const handleCancel = () => {
      setOpen(false);
    };

    if (variant === "inline") {
      return (
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <div
              className={cn(
                "h-10 w-10 cursor-pointer rounded-lg border-2 border-gray-200",
                previewClassName,
              )}
              style={{ backgroundColor: currentColor }}
              onClick={() => !disabled && !readOnly && setOpen(true)}
            />
            <Input
              value={currentColor}
              onChange={(e) => {
                field.onChange(e.target.value);
                onColorChange?.(e.target.value);
              }}
              placeholder={placeholder}
              disabled={disabled}
              readOnly={readOnly}
              className={cn(inputClassName)}
            />
          </div>
          {open && (
            <ColorPicker
              initialColor={currentColor}
              format={format}
              showPresets={showPresets}
              showEyedropper={showEyedropper}
              presetColors={presetColors}
              onColorSelect={handleColorSelect}
              onCancel={handleCancel}
              popoverContentClassName={popoverContentClassName}
            />
          )}
        </div>
      );
    }

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "border-input bg-background hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring w-full justify-start rounded-lg border px-3 py-2 text-left font-normal shadow-sm transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
              inputClassName,
              {
                "border-destructive bg-destructive/10 text-destructive-foreground":
                  fieldState.error,
                "text-muted-foreground": !field.value,
              },
            )}
            disabled={disabled || readOnly}
          >
            <div className="flex flex-1 items-center space-x-3">
              <div
                className={cn(
                  "h-6 w-6 flex-shrink-0 rounded border-2 border-gray-200",
                  previewClassName,
                )}
                style={{ backgroundColor: currentColor }}
              />
              <span className="truncate">{field.value ?? placeholder}</span>
            </div>
            {variant === "compact" ? (
              <Palette className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            ) : (
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <ColorPicker
            initialColor={currentColor}
            format={format}
            showPresets={showPresets}
            showEyedropper={showEyedropper}
            presetColors={presetColors}
            onColorSelect={handleColorSelect}
            onCancel={handleCancel}
            popoverContentClassName={popoverContentClassName}
          />
        </PopoverContent>
      </Popover>
    );
  };

  return (
    <FormField
      control={control}
      name={name}
      disabled={disabled}
      render={({ field, fieldState }) => (
        <FormItem
          className={cn("space-y-[0.2px]", fieldClassName)}
          hidden={hidden}
        >
          {!isNotLabeled && (
            <FormLabel
              className={cn(
                "text-foreground text-sm font-medium capitalize",
                labelClassName,
              )}
            >
              {label ?? splitCamelCaseToWords(name)}
            </FormLabel>
          )}

          <FormControl>{renderColorInput(field, fieldState)}</FormControl>

          {fieldState.error ? (
            <FormMessage className={cn("text-destructive text-sm")} />
          ) : (
            <FormDescription className="text-sm">{description}</FormDescription>
          )}
        </FormItem>
      )}
    />
  );
}
