"use client";
import { useRouter } from "next/navigation";
import { PlaceholderChart } from "~/components/placeholder-chart";
import { api } from "~/trpc/react";
import { useRef } from "react";
import { ChartSkeleton } from "~/components/chart-skeleton";
import { Button } from "~/components/ui/button";
import { ChartCard } from "~/components/chart-card";
import type { Chart } from "~/server/db/zod-schemas/chart";

const ITEMS_PER_PAGE = 3;

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
    <div className="flex flex-wrap justify-between gap-6 space-y-6 px-2 *:flex-1 max-sm:flex-col">
      {allCharts.map((chart, index) => (
        <div key={index}>
          <ChartCard chart={chart as unknown as Chart} />
        </div>
      ))}
    </div>
  );
}
