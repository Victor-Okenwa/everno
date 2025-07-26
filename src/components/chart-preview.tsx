"use client";

import { useMemo } from "react";
import type { Chart } from "~/server/db/zod-schemas/chart";
import { CustomAreaChart } from "./charts/area-chart";
import { CustomBarChart } from "./charts/bar-chart";
import { CustomLineChart } from "./charts/line-chart";
import { CustomPieChart } from "./charts/pie-chart";
import { CustomDonutChart } from "./charts/donut-chart";
import { CustomHistogram } from "./charts/histogram";

interface ChartPreviewProps {
  chart: Chart;
  height?: number;
  showLegend?: boolean;
  showGrid?: boolean;
  className?: string;
}

export function ChartPreview({
  chart,
  height = 300,
  showLegend = true,
  showGrid = true,
  className,
}: ChartPreviewProps) {
  // Prepare chart data and config
  const { data, config, axisKeys } = useMemo(() => {
    const { columns, data: chartData } = chart.chartData;

    // Create config from columns
    const config: Record<string, { label: string; color: string }> = {};
    columns.forEach((col) => {
      config[col.name] = {
        label: col.name,
        color: col.color,
      };
    });

    // Determine axis keys
    const axisKeys = {
      xAxisKey: columns[0]?.name ?? "",
      valueKeys: columns.slice(1).map((col) => col.name),
    };

    return { data: chartData, config, axisKeys };
  }, [chart.chartData]);

  // Common props for all chart types
  const commonProps = {
    data,
    config,
    title: "", // Don't show title in preview
    description: "", // Don't show description in preview
    showLegend,
    showGrid,
    className,
  };

  // Render appropriate chart type
  const renderChart = () => {
    switch (chart.type) {
        case "bar":
          return <CustomBarChart {...commonProps} xAxisKey={axisKeys.xAxisKey} />
        case "area":
          return <CustomAreaChart {...commonProps} xAxisKey={axisKeys.xAxisKey} />
        case "line":
          return <CustomLineChart {...commonProps} xAxisKey={axisKeys.xAxisKey} />
        case "pie":
          return <CustomPieChart {...commonProps} nameKey={axisKeys.xAxisKey} valueKey={axisKeys.valueKeys[0] ?? ""} />
        case "donut":
          return <CustomDonutChart {...commonProps} nameKey={axisKeys.xAxisKey} valueKey={axisKeys.valueKeys[0] ?? ""} />
        case "histogram":
          return <CustomHistogram {...commonProps} xAxisKey={axisKeys.xAxisKey} valueKey={axisKeys.valueKeys[0] ?? ""} />
        // default:
        //   return <CustomBarChart {...commonProps} xAxisKey={axisKeys.xAxisKey} />
      default:
        return (
          <div className="text-muted-foreground flex h-full items-center justify-center">
            Unsupported chart type
          </div>
        );
    }
  };

  return (
    <div className={className} style={{  }}>
      {renderChart()}
    </div>
  );
}
