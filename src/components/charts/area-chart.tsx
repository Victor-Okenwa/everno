"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "~/components/ui/chart";
import type { ChartDataPoint, ChartConfig } from "./bar-chart";

interface CustomAreaChartProps {
  data: ChartDataPoint[];
  config: ChartConfig;
  xAxisKey: string;
  title?: string;
  group?: string;
  category?: string;
  description?: string;
  showLegend?: boolean;
  showGrid?: boolean;
  stacked?: boolean;
}

export function CustomAreaChart({
  data,
  config,
  xAxisKey,
  title,
  group,
  category,
  description,
  showLegend = true,
  showGrid = true,
  stacked = false,
}: CustomAreaChartProps) {
  const dataKeys = Object.keys(config).filter((key) => key !== xAxisKey);

  return (
    <div className="w-full">
      {title && <h3 className="mb-2 text-lg font-semibold">{title}</h3>}
      {description && (
        <p className="text-muted-foreground mb-4 text-sm">{description}</p>
      )}

      <ChartContainer config={config} className="min-h-[300px] w-full">
        <AreaChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          {showGrid && <CartesianGrid strokeDasharray="3 3" />}
          <XAxis
            dataKey={xAxisKey}
            tickLine={false}
            tickMargin={10}
            axisLine={false}
          />
          <YAxis tickLine={false} tickMargin={10} axisLine={false} />

          {dataKeys.map((key) => (
            <Area
              key={key}
              type="monotone"
              dataKey={key}
              stackId={stacked ? "1" : undefined}
              stroke={`var(--color-${key})`}
              fill={`var(--color-${key})`}
              fillOpacity={0.6}
            />
          ))}

          <ChartTooltip content={<ChartTooltipContent />} />
          {showLegend && <ChartLegend content={<ChartLegendContent />} />}
        </AreaChart>
      </ChartContainer>

      <div className="flex justify-end gap-1 *:border *:border-dashed *:px-2 *:py-1 *:text-xs *:rounded-sm *:capitalize">
        {group && <span>{group}</span>}
        {category && <span className="bg-primary text-background">{category}</span>}
      </div>
    </div>
  );
}
