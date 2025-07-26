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
  showLegend?: boolean;
  showGrid?: boolean;
  stacked?: boolean;
}

export function CustomAreaChart({
  data,
  config,
  xAxisKey,
  showLegend = true,
  showGrid = true,
  stacked = false,
}: CustomAreaChartProps) {
  const dataKeys = Object.keys(config).filter((key) => key !== xAxisKey);

  return (
    <div className="w-full">
      <ChartContainer config={config} className="min-h-[300px] h-5 w-full">
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
    </div>
  );
}
