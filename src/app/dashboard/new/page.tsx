"use client";

import { useState } from "react";
import {
  AreaChart,
  ArrowLeft,
  BarChart,
  BarChart3,
  Check,
  ChevronsUpDown,
  Donut,
  PieChart,
  AlertCircle,
} from "lucide-react";
import z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import CustomInputField from "~/components/form/custom-input-field";
import { Textarea } from "~/components/ui/textarea";
import CustomSelectField from "~/components/form/custom-select-field";
import { api } from "~/trpc/react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { ChartDataStep } from "~/components/chart-data-step";
import { validateChartData } from "~/lib/chartValidation";
import { Alert, AlertDescription } from "~/components/ui/alert";

const category = [
  { label: "Entertainment", value: "entertainment" },
  { label: "Finance", value: "finance" },
  { label: "Health", value: "health" },
  { label: "Education", value: "education" },
  { label: "Technology", value: "technology" },
  { label: "Sports", value: "sports" },
  { label: "Politics", value: "politics" },
  { label: "Environment", value: "environment" },
  { label: "Travel", value: "travel" },
  { label: "Food", value: "food" },
  { label: "Lifestyle", value: "lifestyle" },
  { label: "Science", value: "science" },
  { label: "Business", value: "business" },
  { label: "Other", value: "other" },
];

const chartType = z.object({
  type: z
    .string({ message: "Chart type is required" })
    .min(1, { message: "Please select a chart type" }),
});

const chartInfo = z.object({
  title: z
    .string({ message: "Chart title is required" })
    .min(3, { message: "Chart title cannot be less than 3 characters" }),
  description: z
    .string({ message: "Chart description is required" })
    .min(5, { message: "Chart description cannot be less than 5 characters" }),
  category: z
    .string({ message: "Category is required " })
    .min(1, { message: "Please select one category" }),
  group: z
    .string({ message: "Group is required " })
    .min(1, { message: "Please select one group" }),
});

// Enhanced schema for step 3 - chart data with dynamic validation
const chartDataSchema = z
  .object({
    columns: z
      .array(
        z.object({
          name: z.string().min(1, "Column name is required"),
          color: z.string(), // Color is not required as we provide defaults
        }),
      )
      .min(2, "At least 2 columns are required"),
    data: z
      .array(z.record(z.string(), z.union([z.string(), z.number()])))
      .min(1, "At least one data row is required"),
  })
  .refine(
    () => {
      // We'll validate this dynamically in the handleProceed function
      // since we need access to chartType which isn't available here
      return true;
    },
    {
      message: "Chart data validation failed",
    },
  );

const newChartFormSchema = z.object({
  chartType: chartType,
  chartInfo: chartInfo,
  chartData: chartDataSchema,
});

type NewChartForm = z.infer<typeof newChartFormSchema>;

export default function UpdatedNewDataFixed() {
  const [step, setStep] = useState(1);
  const [chartType, setChartType] = useState("");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const getAllLinks = api.userCall.getAllLinks.useQuery();

  const form = useForm<NewChartForm>({
    resolver: zodResolver(newChartFormSchema),
    defaultValues: {
      chartType: {
        type: "",
      },
      chartData: {
        columns: [],
        data: [],
      },
    },
  });

  const handleProceed = async () => {
    setValidationErrors([]); // Clear previous errors

    let fieldsToValidate: (keyof NewChartForm)[] = [];

    if (step === 1) {
      fieldsToValidate = ["chartType"];
    } else if (step === 2) {
      fieldsToValidate = ["chartInfo"];
    } else if (step === 3) {
      // Custom validation for step 3 using our validation utility
      const chartData = form.getValues("chartData");
      const currentChartType = form.getValues("chartType.type");

      if (chartData && currentChartType) {
        const validation = validateChartData(chartData, currentChartType);

        if (!validation.isValid) {
          // Set specific field errors
          if (validation.path) {
            form.setError(`chartData.${validation.path}` as never, {
              type: "manual",
              message: validation.error ?? "Validation failed",
            });
          } else {
            // General error
            form.setError("chartData", {
              type: "manual",
              message: validation.error ?? "Chart data validation failed",
            });
          }

          // Also set validation errors for display
          setValidationErrors([
            validation.error ?? "Chart data validation failed",
          ]);
          return;
        }
      }

      fieldsToValidate = ["chartData"];
    }

    const isValid = await form.trigger(fieldsToValidate, {
      shouldFocus: true,
    });

    if (!isValid) {
      // Collect all validation errors for display
      const errors: string[] = [];
      const formErrors = form.formState.errors;

      const collectErrors = (obj: never, path = "") => {
        Object.keys(obj).forEach((key) => {
          const fullPath = path ? `${path}.${key}` : key;
          if ((obj[key] as { message?: string })?.message) {
            errors.push(
              `${fullPath}: ${(obj[key] as { message: string }).message}`,
            );
          } else if (typeof obj[key] === "object" && obj[key] !== null) {
            collectErrors(obj[key], fullPath);
          }
        });
      };

      collectErrors(formErrors as never);
      setValidationErrors(errors);
      return;
    }

    if (step < 3) {
      setStep(step + 1);
    }
  };

  function onSubmit(values: NewChartForm) {
    // Final validation before submission
    const validation = validateChartData(
      values.chartData,
      values.chartType.type,
    );

    if (!validation.isValid) {
      console.error("Final validation failed:", validation.error);
      setValidationErrors([validation.error ?? "Final validation failed"]);
      return;
    }

    // Filter out empty rows and ensure colors are included
    const processedData = {
      ...values,
      chartData: {
        ...values.chartData,
        data: values.chartData.data.filter((row) =>
          values.chartData.columns.some((col) => {
            const val = row[col.name];
            return val !== "" && val !== null && val !== undefined;
          }),
        ),
      },
    };

    console.log("Form submitted successfully:", processedData);
    setValidationErrors([]);
    // Here you can process the complete form data including validated chart data
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="relative">
        <div className="flex flex-col gap-3 px-2">
          <h2 className="text-lg font-medium">
            {step === 1
              ? "Select the type of chart you want"
              : step === 2
                ? "Input chart information"
                : "Input Chart Data"}
          </h2>

          {/* Step 1: Chart Type Selection */}
          {step === 1 && (
            <div className={"flex flex-wrap gap-5 *:flex-grow"}>
              <div
                className={cn(
                  "hover:bg-secondary dark:shadow-secondary flex cursor-pointer flex-col items-center rounded-lg p-10 shadow-lg",
                  { "bg-accent scale-105": chartType === "area" },
                )}
                onClick={() => {
                  form.setValue("chartType.type", "area");
                  setChartType("area");
                  setValidationErrors([]);
                }}
              >
                <AreaChart className="text-chart-1 size-32" />
                <h4 className="text-xl font-medium">Area Chart</h4>
              </div>
              <div
                className={cn(
                  "hover:bg-secondary dark:shadow-secondary flex cursor-pointer flex-col items-center rounded-lg p-10 shadow-lg",
                  { "bg-accent scale-105": chartType === "bar" },
                )}
                onClick={() => {
                  form.setValue("chartType.type", "bar");
                  setChartType("bar");
                  setValidationErrors([]);
                }}
              >
                <BarChart className="text-chart-2 size-32" />
                <h4 className="text-xl font-medium">Bar Chart</h4>
              </div>
              <div
                className={cn(
                  "hover:bg-secondary dark:shadow-secondary flex cursor-pointer flex-col items-center rounded-lg p-10 shadow-lg",
                  { "bg-accent scale-105": chartType === "donut" },
                )}
                onClick={() => {
                  form.setValue("chartType.type", "donut");
                  setChartType("donut");
                  setValidationErrors([]);
                }}
              >
                <Donut className="text-chart-3 size-32" />
                <h4 className="text-xl font-medium">Donut Chart</h4>
              </div>
              <div
                className={cn(
                  "hover:bg-secondary dark:shadow-secondary flex cursor-pointer flex-col items-center rounded-lg p-10 shadow-lg",
                  { "bg-accent scale-105": chartType === "histogram" },
                )}
                onClick={() => {
                  form.setValue("chartType.type", "histogram");
                  setChartType("histogram");
                  setValidationErrors([]);
                }}
              >
                <BarChart3 className="text-chart-4 size-32" />
                <h4 className="text-xl font-medium">Histogram</h4>
              </div>
              <div
                className={cn(
                  "hover:bg-secondary dark:shadow-secondary flex cursor-pointer flex-col items-center rounded-lg p-10 shadow-lg",
                  { "bg-accent scale-105": chartType === "pie" },
                )}
                onClick={() => {
                  form.setValue("chartType.type", "pie");
                  setChartType("pie");
                  setValidationErrors([]);
                }}
              >
                <PieChart className="text-primary size-32" />
                <h4 className="text-xl font-medium">Pie Chart</h4>
              </div>
            </div>
          )}

          {/* Step 2: Chart Information */}
          {step === 2 && (
            <div className="">
              <div className="grid items-center justify-between sm:grid-cols-2">
                <CustomInputField
                  control={form.control}
                  name="chartInfo.title"
                  label="Title"
                  placeholder="eg. 2024 Sales"
                />
                <div className="ml-auto flex max-w-lg flex-col">
                  <h3 className="font-semibold max-sm:hidden">
                    Title of the chart
                  </h3>
                  <p className="text-foreground/80 text-sm">
                    This is the chart title, it should be a very short text of
                    what the chart would be about and the kind of data being
                    passed
                  </p>
                </div>
              </div>
              <div className="gap-2 mt-10 grid items-center justify-between sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="chartInfo.description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="eg. This chart shows the sales data for 2024"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="ml-auto flex max-w-lg flex-col">
                  <h3 className="font-semibold max-sm:hidden">
                    Description of the chart
                  </h3>
                  <p className="text-foreground/80 text-sm">
                    This is the chart description, it should be a well detailed
                    message of what the chart is all about and the kind of data
                    being represented as well as its use.
                  </p>
                </div>
              </div>
              <div className="gap-2 mt-10 grid items-center justify-between sm:grid-cols-2">
                <CustomSelectField
                  control={form.control}
                  name="chartInfo.category"
                  label="Category"
                  options={category}
                  placeholder="Select a category"
                />
                <div className="ml-auto flex max-w-lg flex-col">
                  <h3 className="font-semibold max-sm:hidden">
                    Category of the chart
                  </h3>
                  <p className="text-foreground/80 text-sm">
                    This is the chart category, it is where the data came from
                    or how it came to be. This is important to help you in
                    grouping charts.
                  </p>
                </div>
              </div>
              <div className="gap-2 mt-10 grid items-center justify-between sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="chartInfo.group"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Group</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "w-full justify-between",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value
                                ? getAllLinks.data?.links.find(
                                    ({ name }) => name === field.value,
                                  )?.name
                                : "Select Group"}
                              <ChevronsUpDown className="opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[200px] max-w-sm p-0">
                          <Command>
                            <CommandInput
                              placeholder="Search group..."
                              className="h-9"
                            />
                            <CommandList>
                              <CommandEmpty>No group found.</CommandEmpty>
                              <CommandGroup>
                                {getAllLinks.data?.links.map(({ name }) => (
                                  <CommandItem
                                    value={name}
                                    key={name}
                                    onSelect={() => {
                                      form.setValue("chartInfo.group", name);
                                    }}
                                  >
                                    {name}
                                    <Check
                                      className={cn(
                                        "ml-auto",
                                        name === field.value
                                          ? "opacity-100"
                                          : "opacity-0",
                                      )}
                                    />
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="ml-auto flex max-w-lg flex-col">
                  <h3 className="font-semibold max-sm:hidden">
                    Chart grouping
                  </h3>
                  <p className="text-foreground/80 text-sm">
                    This is the chart where the chart would be grouped into. You
                    cannot proceed unless you have created a group. To create a
                    group click on the add new link on the sidebar to get
                    started.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Chart Data Input */}
          {step === 3 && (
          <>
             {/* Show validation errors */}
          {validationErrors.length > 0 && (
            <Alert variant="destructive" className="sticky top-[10%] size-fit">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <p className="font-medium">
                    Please fix the following errors:
                  </p>
                  <ul className="list-inside list-disc space-y-1">
                    {validationErrors.map((error, index) => (
                      <li key={index} className="text-sm">
                        {error}
                      </li>
                    ))}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}
          <ChartDataStep
            chartType={form.watch("chartType.type")}
            chartTitle={form.watch("chartInfo.title")}
            chartDescription={form.watch("chartInfo.description")}
            control={form.control}
            name="chartData"
          />
          </>
          )}

          {/* Navigation Footer */}
          <div className="bg-background sticky bottom-0 mt-8 grid w-full grid-cols-2 items-center justify-between rounded-sm p-2 drop-shadow">
            <div className="flex gap-1">
              {Array.from({ length: 3 }).map((_, index) => (
                <span
                  key={index}
                  className={cn(
                    "bg-accent h-[2px] w-[18%] rounded-full transition-colors duration-500 sm:w-[8%]",
                    {
                      "bg-primary": step === index + 1,
                    },
                  )}
                />
              ))}
            </div>
            <div className="ml-auto flex gap-1">
              <Button
                type="button"
                variant="outline"
                disabled={step === 1}
                onClick={() => {
                  if (step > 1) {
                    setStep(step - 1);
                    setValidationErrors([]);
                  }
                }}
                aria-label="Previous"
              >
                <ArrowLeft />
              </Button>
              <Button
                type={step === 3 ? "submit" : "button"}
                onClick={step < 3 ? handleProceed : undefined}
              >
                {step === 3 ? "Create Chart" : "Proceed"}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}
