"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart";
import type { ChartDataPoint, ChartConfig } from "./bar-chart";

interface CustomHistogramProps {
  data: ChartDataPoint[];
  config: ChartConfig;
  xAxisKey: string;
  valueKey: string;
  title?: string;
  description?: string;
  group?: string;
  category?: string;
  showGrid?: boolean;
  binWidth?: number;
}

export function CustomHistogram({
  data,
  config,
  xAxisKey,
  valueKey,
  showGrid = true,
}: CustomHistogramProps) {
  return (
    <div className="w-full">
      <ChartContainer config={config} className="min-h-[300px] w-full">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          barCategoryGap={0}
        >
          {showGrid && <CartesianGrid strokeDasharray="3 3" />}
          <XAxis
            dataKey={xAxisKey}
            tickLine={false}
            tickMargin={10}
            axisLine={false}
          />
          <YAxis tickLine={false} tickMargin={10} axisLine={false} />

          <Bar
            dataKey={valueKey}
            fill={`var(--color-${valueKey})`}
            radius={[2, 2, 0, 0]}
            maxBarSize={50}
          />

          <ChartTooltip content={<ChartTooltipContent />} />
        </BarChart>
      </ChartContainer>
    </div>
  );
}
