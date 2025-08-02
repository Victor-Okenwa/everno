"use client";
import { useRouter } from "next/navigation";
import { PlaceholderChart } from "~/components/placeholder-chart";
import { api } from "~/trpc/react";
import { useRef } from "react";
import { ChartSkeleton } from "~/components/chart-skeleton";
import { Button } from "~/components/ui/button";
import { ChartPreview } from "~/components/chart-preview";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Edit, Eye, MoreHorizontal, Trash2 } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import type { Chart } from "~/server/db/zod-schemas/chart";

interface ChartCardProps {
  chart: Chart;
}

export function ChartCard({ chart }: ChartCardProps) {
  return (
    <Card
      className="cursor-pointer transition-shadow duration-200 hover:shadow-lg"
      // onClick={() => handleView(chart._id)}
    >
      <CardHeader className="full pb-3">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <CardTitle className="truncate text-base font-semibold">
              {chart.title}
            </CardTitle>
            <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">
              {chart.description}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="text-foreground"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
              // onClick={() => handleView(chart._id)}
              >
                <Eye className="mr-2 h-4 w-4" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem
              // onClick={() => handleEdit(chart._id)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                // onClick={() => handleDelete(chart._id, chart.title)}
                className="text-destructive"
                // disabled={deleteChartMutation.isPending}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="h-fit pt-0">
        {/* Chart Preview */}
        <div className="bg-muted/20 overflow mb-4 rounded-lg">
          <ChartPreview
            chart={chart}
            height={10}
            showLegend={true}
            showGrid={false}
          />
        </div>

        {/* Chart Metadata */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {chart.type}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {chart.category}
            </Badge>
            {chart.isPublic && (
              <Badge variant="default" className="text-xs">
                Public
              </Badge>
            )}
          </div>

          <div className="text-muted-foreground flex items-center justify-between text-xs">
            <span>{chart.group}</span>
            <span>
              {formatDistanceToNow(
                new Date((chart as unknown as { updatedAt: string }).updatedAt),
                {
                  addSuffix: true,
                },
              )}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
