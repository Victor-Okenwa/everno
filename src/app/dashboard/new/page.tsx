"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
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

const newChartFormSchema = z.object({
  chartType: chartType,
  chartInfo: chartInfo,
});

type NewChartForm = z.infer<typeof newChartFormSchema>;

export default function NewData() {
  const [step, setStep] = useState(1);
  const [chartType, setChartType] = useState("");

  const getAllLinks = api.userCall.getAllLinks.useQuery();

  const form = useForm<NewChartForm>({
    resolver: zodResolver(newChartFormSchema),
    defaultValues: {
      chartType: {
        type: "",
      },
    },
  });

  const handleProceed = async () => {
    // try {
    const isValid = await form.trigger(
      step === 1 ? ["chartType"] : step === 2 ? ["chartInfo"] : ["chartInfo"],
      {
        shouldFocus: true,
      },
    );

    if (isValid && step < 3) {
      setStep(step + 1);
    }
  };

  function onSubmit(values: NewChartForm) {
    console.log(values);
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
          {step === 1 && (
            <div className={"flex flex-wrap gap-5 *:max-sm:flex-grow"}>
              <div
                className={cn(
                  "hover:bg-secondary dark:shadow-secondary flex cursor-pointer flex-col items-center rounded-lg p-10 shadow-lg",
                  { "bg-accent scale-105": chartType === "area" },
                )}
                onClick={() => {
                  form.setValue("chartType.type", "area");
                  setChartType("area");
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
                }}
              >
                <PieChart className="text-primary size-32" />
                <h4 className="text-xl font-medium">Pie Chart</h4>
              </div>
            </div>
          )}

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

              <div className="mt-10 grid items-center justify-between sm:grid-cols-2">
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

              <div className="mt-10 grid items-center justify-between sm:grid-cols-2">
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

              <div className="mt-10 grid items-center justify-between sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="chartInfo.group"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Language</FormLabel>
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
                              placeholder="Search framework..."
                              className="h-9"
                            />
                            <CommandList>
                              <CommandEmpty>No framework found.</CommandEmpty>
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
                    Category of the chart
                  </h3>
                  <p className="text-foreground/80 text-sm">
                    This is the chart category, it is where the data came from
                    or how it came to be. This is important to help you in
                    grouping charts.
                  </p>
                </div>
              </div>
            </div>
          )}
          {step === 3 && (
            <Tabs defaultValue="manual" className="px-2 py-4">
              <TabsList className="no-scrollbar bg-secondary/70 *:border-secondary *:data-[state=active]:bg-background flex h-fit w-full overflow-x-auto *:flex-grow *:cursor-pointer *:border-2 *:px-3 *:py-2 *:text-xl *:font-medium *:opacity-80 *:data-[state=active]:opacity-100 sm:gap-3">
                <TabsTrigger value="manual">Manual</TabsTrigger>
                <TabsTrigger value="file">File</TabsTrigger>
              </TabsList>
              <TabsContent value="manual">Manual</TabsContent>
              <TabsContent value="file">File</TabsContent>
            </Tabs>
          )}

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
                  if (step > 1) setStep(step - 1);
                }}
                aria-label="Previous"
              >
                <ArrowLeft />
              </Button>
              <Button
                type={step === 3 ? "submit" : "button"}
                onClick={step < 3 ? handleProceed : undefined}
              >
                Proceed
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}
