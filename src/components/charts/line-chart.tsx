"use client";

import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "~/components/ui/chart";
import type { ChartDataPoint, ChartConfig } from "./bar-chart";

interface CustomLineChartProps {
  data: ChartDataPoint[];
  config: ChartConfig;
  xAxisKey: string;
  title?: string;
  description?: string;
  group?: string;
  category?: string;
  showLegend?: boolean;
  showGrid?: boolean;
}

export function CustomLineChart({
  data,
  config,
  xAxisKey,
  title,
  description,
  group,
  category,
  showLegend = true,
  showGrid = true,
}: CustomLineChartProps) {
  const dataKeys = Object.keys(config).filter((key) => key !== xAxisKey);

  return (
    <div className="w-full">
      {title && <h3 className="mb-2 text-lg font-semibold">{title}</h3>}
      {description && (
        <p className="text-muted-foreground mb-4 text-sm">{description}</p>
      )}

      <ChartContainer config={config} className="min-h-[300px] w-full">
        <LineChart
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
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={`var(--color-${key})`}
              strokeWidth={2}
              dot={{ fill: `var(--color-${key})`, strokeWidth: 2, r: 4 }}
            />
          ))}

          <ChartTooltip content={<ChartTooltipContent />} />
          {showLegend && <ChartLegend content={<ChartLegendContent />} />}
        </LineChart>
      </ChartContainer>

      <div className="flex justify-end gap-1 *:rounded-sm *:border *:border-dashed *:px-2 *:py-1 *:text-xs *:capitalize">
        {group && <span>{group}</span>}
        {category && (
          <span className="bg-primary text-background">{category}</span>
        )}
      </div>
    </div>
  );
}
