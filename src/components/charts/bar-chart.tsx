"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "~/components/ui/chart";

export type ChartDataPoint = Record<string, string | number>;

export type ChartConfig = Record<
  string,
  {
    label: string;
    color: string;
  }
>;

interface CustomBarChartProps {
  data: ChartDataPoint[];
  config: ChartConfig;
  xAxisKey: string;
  showLegend?: boolean;
  showGrid?: boolean;
}

export function CustomBarChart({
  data,
  config,
  xAxisKey,
  showLegend = true,
  showGrid = true,
}: CustomBarChartProps) {
  // Get all data keys except the x-axis key
  const dataKeys = Object.keys(config).filter((key) => key !== xAxisKey);

  return (
    <div className="w-full">
      <ChartContainer config={config} className="min-h-[300px] w-full">
        <BarChart
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
            <Bar
              key={key}
              dataKey={key}
              fill={`var(--color-${key})`}
              radius={[4, 4, 0, 0]}
            />
          ))}

          <ChartTooltip content={<ChartTooltipContent />} />
          {showLegend && <ChartLegend content={<ChartLegendContent />} />}
        </BarChart>
      </ChartContainer>
    </div>
  );
}
