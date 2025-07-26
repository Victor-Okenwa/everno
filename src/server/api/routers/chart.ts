import z from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { ChartConfigSchema } from "~/server/db/zod-schemas/chart";
import { validateChartData } from "~/lib/chartValidation";
import { TRPCError } from "@trpc/server";
import ChartModel from "~/server/db/models/chart";

const CreateChartInputSchema = z.object({
  title: z.string().min(3, "Chart title must be at least 3 characters"),
  description: z
    .string()
    .min(5, "Chart description must be at least 5 characters"),
  type: z.enum(["bar", "area", "line", "pie", "donut", "histogram"]),
  category: z.string().min(1, "Category is required"),
  group: z.string().min(1, "Group is required"),
  isPublic: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  chartData: ChartConfigSchema,
});

const GetChartsInputSchema = z.object({
  limit: z.number().min(1).max(100).default(10),
  cursor: z.any(),
  offset: z.number().min(0).default(0),
  group: z.string().optional(),
  category: z.string().optional(),
  type: z.enum(["bar", "area", "line", "pie", "donut", "histogram"]).optional(),
  search: z.string().optional(),
  sortBy: z.enum(["createdAt", "updatedAt", "title"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const chartRouter = createTRPCRouter({
  create: protectedProcedure
    .input(CreateChartInputSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        // console.log(input, ctx.user);
        const validation = validateChartData(input.chartData, input.type);

        if (!validation.isValid) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: validation.error ?? "Invalid chart data",
          });
        }

        // Filter out empty rows
        const validData = input.chartData.data.filter((row) =>
          input.chartData.columns.some((col) => {
            const val = row[col.name];
            return val !== "" && val !== null && val !== undefined;
          }),
        );

        if (validData.length === 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "At least one complete data row is required",
          });
        }

        // Create chart document
        const chartData = {
          ...input,
          chartData: {
            ...input.chartData,
            data: validData,
          },
          userId: ctx.user.id as string,
        };

        const chart = new ChartModel(chartData);
        await chart.save();

        return {
          success: true,
          chart: chart.toObject(),
          message: "Chart created successfully",
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        console.error("Error creating chart:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create chart",
        });
      }
    }),
  // Get charts with filtering and pagination
  getAll: protectedProcedure
    .input(GetChartsInputSchema)
    .query(async ({ ctx, input }) => {
      try {
        const {
          limit,
          offset,
          group,
          category,
          type,
          search,
          sortBy,
          sortOrder,
        } = input;
        const filter: {
          userId: string;
          group?: string;
          category?: string;
          type?: string;
          $text?: { $search: string };
        } = { userId: ctx.user.id as string };

        if (group) filter.group = group;
        if (category) filter.category = category;
        if (type) filter.type = type;
        if (search) {
          filter.$text = { $search: search };
        }

        // Build sort object
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sort: any = {};
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        sort[sortBy] = sortOrder === "asc" ? 1 : -1;
        // Execute query with pagination
        const [charts, total] = await Promise.all([
          ChartModel.find(filter)
            .sort(sort as string)
            .skip(offset)
            .limit(limit)
            .lean(),
          ChartModel.countDocuments(filter),
        ]);

        return {
          charts,
          pagination: {
            total,
            limit,
            offset,
            hasMore: offset + limit < total,
          },
        };
      } catch (error) {
        console.error("Error fetching charts:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch charts",
        });
      }
    }),
});
