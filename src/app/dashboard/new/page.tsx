"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { useState } from "react";
import {
  AreaChart,
  ArrowLeft,
  BarChart,
  BarChart3,
  Donut,
  PieChart,
} from "lucide-react";
import z from "zod";
import { Form } from "~/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

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
});

const newChartFormSchema = z.object({
  chartType: chartType,
  chartInfo: chartInfo,
});

type NewChartForm = z.infer<typeof newChartFormSchema>;

export default function NewData() {
  const [step, setStep] = useState(1);
  const [chartType, setChartType] = useState("");

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
      step === 1 ? ["chartType"] : ["chartType"],
      {
        shouldFocus: true,
      },
    );

    if (isValid && step < 3) {
      setStep(step + 1);
    }
  };

  return (
    <Form {...form}>
      <form className="relative">
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

          {step === 3 && <div className="gap flex flex-col"></div>}
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
                    "bg-secondary h-[2px] w-[8%] rounded-full transition-colors duration-500",
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
