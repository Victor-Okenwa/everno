import { z } from "zod";

// Chart column schema
export const ChartColumnSchema = z.object({
  name: z.string().min(1, "Column name is required"),
  color: z.string().min(1, "Column color is required"),
  type: z.enum(["string", "number"]).default("string"),
});

// Chart data row schema - flexible to handle dynamic columns
export const ChartDataRowSchema = z.record(
  z.string(),
  z.union([z.string(), z.number()]),
);

// Chart configuration schema
export const ChartConfigSchema = z.object({
  columns: z.array(ChartColumnSchema).min(2, "At least 2 columns are required"),
  data: z.array(ChartDataRowSchema).min(1, "At least one data row is required"),
});

// Main chart schema
export const ChartSchema = z.object({
  _id: z.string().optional(),
  title: z.string().min(3, "Chart title must be at least 3 characters"),
  description: z
    .string()
    .min(5, "Chart description must be at least 5 characters"),
  type: z.enum(["bar", "area", "line", "pie", "donut", "histogram"]),
  category: z.string().min(1, "Category is required"),
  group: z.string().min(1, "Group is required"),
  chartData: ChartConfigSchema,
  userId: z.string().min(1, "User ID is required"),
  //   createdAt: z.date().default(() => new Date()),
  //   updatedAt: z.date().default(() => new Date()),
  isPublic: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  metadata: z
    .object({
      totalRows: z.number(),
      totalColumns: z.number(),
      dataSize: z.number(), // in bytes
      lastModified: z.date(),
    })
    .optional(),
});

export type Chart = z.infer<typeof ChartSchema>;
export type ChartColumn = z.infer<typeof ChartColumnSchema>;
export type ChartDataRow = z.infer<typeof ChartDataRowSchema>;
export type ChartConfig = z.infer<typeof ChartConfigSchema>;
