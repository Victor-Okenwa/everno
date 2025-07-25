/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

"use client";

import { useState, useEffect, useCallback, useRef, type JSX } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Trash2, Plus, AlertCircle } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  type Control,
  type FieldErrors,
  useFieldArray,
  useFormState,
  useWatch,
} from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "~/components/ui/form";
import { validateField } from "~/lib/chartValidation";
import { Alert, AlertDescription } from "../ui/alert";

const CHART_COLORS = [
  "#8884d8", // soft purple
  "#82ca9d", // mint green
  "#ffc658", // golden yellow
  "#ff7300", // bright orange
  "#00ff00", // lime green
  "#0088fe", // bright blue
  "#00c49f", // teal
  "#ffbb28", // warm yellow
  "#ff8042", // coral
  "#8dd1e1", // light cyan
  "#d81b60", // deep pink
  "#a1887f", // warm gray-brown
  "#4b5e40", // deep olive green
  "#b39ddb", // light lavender
  "#ff4081", // hot pink
  "#0288d1", // medium blue
];

interface CustomDataInputProps {
  chartType: string;
  control: Control<any>;
  name: string;
}

export function CustomDataInput({
  chartType,
  control,
  name,
}: CustomDataInputProps) {
  const [newColumnName, setNewColumnName] = useState("");
  const initializedChartType = useRef<string>("");
  const { errors } = useFormState({ control });

  const {
    fields: dataFields,
    append: appendData,
    remove: removeData,
    // update: updateData,
    replace: replaceData,
  } = useFieldArray({
    control,
    name: `${name}.data`,
  });

  const {
    // fields: columnFields,
    append: appendColumn,
    remove: removeColumn,
    // update: updateColumn,
    replace: replaceColumns,
  } = useFieldArray({
    control,
    name: `${name}.columns`,
  });

  const watchedColumns = useWatch({
    control,
    name: `${name}.columns`,
  });

  const watchedData = useWatch({
    control,
    name: `${name}.data`,
  });

  // Chart type specific configurations
  const getChartRequirements = useCallback((type: string) => {
    switch (type) {
      case "pie":
      case "donut":
        return {
          minColumns: 2,
          maxColumns: 2,
          suggestedColumns: [
            { name: "Category", color: CHART_COLORS[0] ?? "#8884d8" },
            { name: "Value", color: CHART_COLORS[1] ?? "#82ca9d" },
          ],
          description:
            "Add categories and their corresponding values. Each row represents a slice of the pie/donut.",
          useRowColors: true,
        };
      case "histogram":
        return {
          minColumns: 2,
          maxColumns: 10,
          suggestedColumns: [
            { name: "Range", color: CHART_COLORS[0] ?? "#8884d8" },
            { name: "Frequency", color: CHART_COLORS[1] ?? "#82ca9d" },
          ],
          description:
            "Add ranges/bins and their frequencies. Each row represents a bin in the histogram.",
          useRowColors: false,
        };
      case "bar":
      case "area":
      case "line":
        return {
          minColumns: 2,
          maxColumns: 10,
          suggestedColumns: [
            { name: "Month", color: CHART_COLORS[0] ?? "#8884d8" },
            { name: "Sales", color: CHART_COLORS[1] ?? "#82ca9d" },
            { name: "Profit", color: CHART_COLORS[2] ?? "#ffc658" },
          ],
          description:
            "Add an X-axis category and one or more data series. Each row represents a data point.",
          useRowColors: false,
        };
      default:
        return {
          minColumns: 2,
          maxColumns: 10,
          suggestedColumns: [
            { name: "Category", color: CHART_COLORS[0] ?? "#8884d8" },
            { name: "Value", color: CHART_COLORS[1] ?? "#82ca9d" },
          ],
          description: "Add your data columns and values.",
          useRowColors: false,
        };
    }
  }, []);

  const requirements = getChartRequirements(chartType);

  // Initialize only when chart type changes
  useEffect(() => {
    if (chartType && chartType !== initializedChartType.current) {
      initializedChartType.current = chartType;

      // Replace all columns with suggested ones
      replaceColumns(requirements.suggestedColumns);

      // Create initial data rows
      const initialRows = requirements.useRowColors
        ? [
            {
              id: "1",
              [requirements.suggestedColumns[0]!.name]: "",
              [requirements.suggestedColumns[1]!.name]: "",
              color: CHART_COLORS[0] ?? "#8884d8",
            },
          ]
        : [
            {
              id: "1",
              [requirements.suggestedColumns[0]!.name]: "",
              [requirements.suggestedColumns[1]!.name]: "",
              ...(requirements.suggestedColumns[2] && {
                [requirements.suggestedColumns[2].name]: "",
              }),
            },
          ];

      replaceData(initialRows);
    }
  }, [chartType, requirements, replaceColumns, replaceData]);

  // Ensure colors are always present for columns
  useEffect(() => {
    if (watchedColumns) {
      let needsUpdate = false;
      const updatedColumns = watchedColumns.map(
        (column: { color: string }, index: number) => {
          if (!column.color) {
            needsUpdate = true;
            return {
              ...column,
              color:
                CHART_COLORS[index % CHART_COLORS.length] ?? CHART_COLORS[0],
            };
          }
          return column;
        },
      );
      if (needsUpdate) {
        replaceColumns(updatedColumns);
      }
    }
  }, [watchedColumns, replaceColumns]);

  // Ensure colors are always present for row-color charts
  useEffect(() => {
    if (requirements.useRowColors && watchedData) {
      let needsUpdate = false;
      const updatedData = watchedData.map(
        (row: { color: string }, index: number) => {
          if (!row.color) {
            needsUpdate = true;
            return {
              ...row,
              color:
                CHART_COLORS[index % CHART_COLORS.length] ?? CHART_COLORS[0],
            };
          }
          return row;
        },
      );
      if (needsUpdate) {
        replaceData(updatedData);
      }
    }
  }, [watchedData, requirements.useRowColors, replaceData]);

  const addColumn = () => {
    if (
      newColumnName.trim() &&
      !watchedColumns?.some(
        (col: { name: string }) => col.name === newColumnName.trim(),
      ) &&
      watchedColumns?.length < requirements.maxColumns
    ) {
      const newCol = {
        name: newColumnName.trim(),
        color:
          CHART_COLORS[(watchedColumns?.length ?? 0) % CHART_COLORS.length] ??
          CHART_COLORS[0],
      };
      appendColumn(newCol);
      setNewColumnName("");
    }
  };

  const removeColumnHandler = (index: number) => {
    if (watchedColumns && watchedColumns.length > requirements.minColumns) {
      removeColumn(index);
    }
  };

  const addRow = () => {
    const newRow: Record<string, unknown> = { id: Date.now().toString() };
    watchedColumns?.forEach((col: { name: string }) => {
      newRow[col.name] = "";
    });
    if (requirements.useRowColors) {
      const colorIndex = dataFields.length % CHART_COLORS.length;
      newRow.color = CHART_COLORS[colorIndex] ?? "#8884d8";
    }
    appendData(newRow);
  };

  const removeRow = (index: number) => {
    if (dataFields.length > 1) {
      removeData(index);
    }
  };

  // Custom validation function for fields
  const createFieldValidator = (fieldPath: string) => (value: unknown) => {
    return validateField(
      value,
      fieldPath,
      (watchedColumns as never[]) ?? [],
      chartType,
    );
  };

  // Get form errors for this section
  const getFieldError = (fieldPath: string) => {
    const pathParts = fieldPath.split(".");
    let error = errors as FieldErrors;
    for (const part of pathParts) {
      error = error?.[part] as FieldErrors;
    }
    return error?.message;
  };

  // Check if there are any validation errors
  const hasErrors = () => {
    const chartDataErrors = (errors as { chartData: unknown })?.chartData;
    return !!chartDataErrors;
  };

  // Validate data in real-time
  const validateData = () => {
    // This will be handled by React Hook Form's validation
  };

  return (
    <div className="space-y-6">
      {/* Show validation errors */}
      {hasErrors() && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please fix the validation errors below before proceeding.
          </AlertDescription>
        </Alert>
      )}

      {/* Chart Requirements Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            {chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart
            Requirements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            {requirements.description}
          </p>
          {requirements.useRowColors && (
            <p className="text-muted-foreground mt-2 text-sm">
              <strong>Note:</strong> Each data row can have its own color for
              better visualization.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Column Management */}
      <Card
        className={
          getFieldError("chartData.columns") ? "border-destructive" : ""
        }
      >
        <CardHeader>
          <CardTitle className="text-sm font-medium">Data Columns</CardTitle>
          {getFieldError("chartData.columns") && (
            <p className="text-destructive text-sm">
              {getFieldError("chartData.columns") as JSX.Element}
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {watchedColumns?.length < requirements.maxColumns && (
            <div className="flex gap-2">
              <Input
                placeholder="Enter column name"
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addColumn()}
              />
              <Button onClick={addColumn} size="sm" type="button">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {watchedColumns?.map(
              (column: { name: string; color: string }, index: number) => (
                <div
                  key={`column-${column.name}-${index}`}
                  className={`bg-secondary flex items-center gap-2 rounded-md p-2 ${
                    getFieldError(`chartData.columns.${index}.name`)
                      ? "border-destructive border"
                      : ""
                  }`}
                >
                  <span className="text-sm font-medium">{column.name}</span>

                  {/* Fix the logical condition here - use || instead of ?? */}
                  {!requirements.useRowColors &&
                    (["pie", "donut"].includes(chartType) || index > 0) && (
                      <FormField
                        control={control}
                        name={`${name}.columns.${index}.color`}
                        render={({ field }) => (
                          <FormItem>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    type="button"
                                  >
                                    <div
                                      className="h-4 w-4 rounded border"
                                      style={{ backgroundColor: field.value }}
                                    />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-64">
                                <div className="grid grid-cols-5 gap-2">
                                  {CHART_COLORS.map((color, colorIndex) => (
                                    <button
                                      key={`column-color-${color}-${colorIndex}`}
                                      type="button"
                                      className="h-8 w-8 rounded border-2 border-transparent hover:border-gray-300"
                                      style={{ backgroundColor: color }}
                                      onClick={() => {
                                        field.onChange(color);
                                        validateData();
                                      }}
                                    />
                                  ))}
                                </div>
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                  {watchedColumns &&
                    watchedColumns.length > requirements.minColumns && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeColumnHandler(index)}
                        className="text-destructive hover:text-destructive h-6 w-6 p-0"
                        type="button"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                </div>
              ),
            )}
          </div>
        </CardContent>
      </Card>

      {/* Data Input Table */}
      {watchedColumns && watchedColumns.length >= requirements.minColumns && (
        <Card
          className={
            getFieldError("chartData.data") ? "border-destructive" : ""
          }
        >
          <CardHeader>
            <CardTitle className="text-sm font-medium">Data Input</CardTitle>
            {getFieldError("chartData.data") && (
              <p className="text-destructive text-sm">
                {getFieldError("chartData.data") as JSX.Element}
              </p>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Table Header */}
              <div
                className="grid gap-2"
                style={{
                  gridTemplateColumns: `repeat(${watchedColumns.length}, 1fr) ${requirements.useRowColors ? "auto" : ""} auto`,
                }}
              >
                {watchedColumns.map(
                  (column: { name: string; color: string }, index: number) => (
                    <Label
                      key={`header-${column.name}-${index}`}
                      className="text-sm font-medium"
                    >
                      {column.name}
                    </Label>
                  ),
                )}
                {requirements.useRowColors && (
                  <Label className="text-sm font-medium">Color</Label>
                )}
                <div></div>
              </div>

              {/* Data Rows */}
              {dataFields.map((field, rowIndex) => (
                <div
                  key={field.id}
                  className="grid items-center gap-2"
                  style={{
                    gridTemplateColumns: `repeat(${watchedColumns.length}, 1fr) ${requirements.useRowColors ? "auto" : ""} auto`,
                  }}
                >
                  {watchedColumns.map(
                    (
                      column: { name: string; color: string },
                      colIndex: number,
                    ) => (
                      <FormField
                        key={`${field.id}-${column.name}-${colIndex}`}
                        control={control}
                        name={`${name}.data.${rowIndex}.${column.name}`}
                        rules={{
                          validate: createFieldValidator(
                            `data.${rowIndex}.${column.name}`,
                          ),
                        }}
                        render={({ field: inputField, fieldState }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                placeholder={`Enter ${column.name.toLowerCase()}`}
                                className={
                                  fieldState.error ? "border-destructive" : ""
                                }
                                {...inputField}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  // Convert to number if it's a value column and valid number
                                  if (
                                    colIndex > 0 ||
                                    (requirements.useRowColors &&
                                      colIndex === 1)
                                  ) {
                                    const numValue = Number(value);
                                    if (!isNaN(numValue) && value !== "") {
                                      inputField.onChange(numValue);
                                      return;
                                    }
                                  }
                                  inputField.onChange(value);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ),
                  )}

                  {requirements.useRowColors && (
                    <FormField
                      control={control}
                      name={`${name}.data.${rowIndex}.color`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  type="button"
                                >
                                  <div
                                    className="h-6 w-6 rounded border"
                                    style={{
                                      backgroundColor: field.value,
                                    }}
                                  />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-64">
                                <div className="grid grid-cols-5 gap-2">
                                  {CHART_COLORS.map((color, colorIndex) => (
                                    <button
                                      key={`row-color-${color}-${colorIndex}`}
                                      type="button"
                                      className="h-8 w-8 rounded border-2 border-transparent hover:border-gray-300"
                                      style={{ backgroundColor: color }}
                                      onClick={() => {
                                        field.onChange(color);
                                        validateData();
                                      }}
                                    />
                                  ))}
                                </div>
                              </PopoverContent>
                            </Popover>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeRow(rowIndex)}
                    disabled={dataFields.length === 1}
                    className="text-destructive hover:text-destructive"
                    type="button"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <Button
                onClick={addRow}
                variant="outline"
                className="w-full bg-transparent"
                type="button"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Row
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
