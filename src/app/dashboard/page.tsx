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
import { MoreHorizontal } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import type { Chart } from "~/server/db/zod-schemas/chart";

const ITEMS_PER_PAGE = 12;

export default function Dashboard() {
  const router = useRouter();
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Infinite query for charts
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = api.chart.getAll.useInfiniteQuery(
    {
      limit: ITEMS_PER_PAGE,
      sortBy: "updatedAt",
      sortOrder: "desc",
    },
    {
      getNextPageParam: (lastPage) => {
        const { pagination } = lastPage;
        return pagination.hasMore
          ? pagination.offset + pagination.limit
          : undefined;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  );

  const allCharts = data?.pages.flatMap((page) => page.charts) ?? [];

  // Loading state for initial load
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
          <ChartSkeleton key={index} />
        ))}
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Failed to load charts
          </h3>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {error?.message || "An unexpected error occurred"}
          </p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }
  if (allCharts.length === 0) {
    return (
      <div className="flex flex-wrap gap-5 px-2 max-sm:flex-col">
        {Array.from({ length: 5 }).map((_, index) => (
          <PlaceholderChart key={index} />
        ))}
        ;
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {allCharts.map((chart, index) => (
        <Card
          key={index}
          className="group cursor-pointer transition-shadow duration-200 hover:shadow-lg"
          // onClick={() => handleView(chart._id)}
        >
          <CardHeader className="pb-3">
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
                    variant="ghost"
                    size="sm"
                    className="opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {/* <DropdownMenuItem onClick={() => handleView(chart._id)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleEdit(chart._id)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDuplicate(chart._id, chart.title)}
                      disabled={duplicateChartMutation.isPending}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDelete(chart._id, chart.title)}
                      className="text-destructive"
                      disabled={deleteChartMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem> */}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>

          <CardContent className="h-fit pt-0">
            {/* Chart Preview */}
            <div className="bg-muted/20 overflow mb-4 rounded-lg">
              <ChartPreview
                chart={chart as unknown as Chart}
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
                    new Date(
                      (chart as unknown as { updatedAt: string }).updatedAt,
                    ),
                    {
                      addSuffix: true,
                    },
                  )}
                </span>
              </div>

              {chart.metadata && (
                <div className="text-muted-foreground text-xs">
                  {chart.metadata.totalRows} rows •{" "}
                  {chart.metadata.totalColumns} columns
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
