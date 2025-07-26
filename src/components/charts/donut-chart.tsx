"use client";

import { Pie, PieChart, Cell } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "~/components/ui/chart";
import type { ChartDataPoint, ChartConfig } from "./bar-chart";

interface CustomDonutChartProps {
  data: ChartDataPoint[];
  config: ChartConfig;
  nameKey: string;
  valueKey: string;
  showLegend?: boolean;
}

export function CustomDonutChart({
  data,
  config,
  nameKey,
  valueKey,
  showLegend = true,
}: CustomDonutChartProps) {
  return (
    <div className="w-full">
      <ChartContainer config={config} className="min-h-[300px] w-full">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={120}
            paddingAngle={2}
            dataKey={valueKey}
            nameKey={nameKey}
          >
            {data.map((entry, index) => {
              // Use row-specific color if available, otherwise fall back to config color
              const rowColor = (entry as { color: string }).color;
              const categoryName = entry[nameKey] as string;
              const configColor = config[categoryName]?.color;
              const fallbackColor = `hsl(var(--chart-${(index % 5) + 1}))`;

              const finalColor = rowColor ?? configColor ?? fallbackColor;

              return (
                <Cell key={`cell-${categoryName}-${index}`} fill={finalColor} />
              );
            })}
          </Pie>
          <ChartTooltip content={<ChartTooltipContent />} />
          {showLegend && <ChartLegend content={<ChartLegendContent />} />}
        </PieChart>
      </ChartContainer>
    </div>
  );
}
