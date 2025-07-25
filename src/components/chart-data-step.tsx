/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */

"use client"

import type React from "react"
import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { CustomDataInput } from "./form/custom-data-input"
import type { ChartDataPoint, ChartConfig } from "./charts/bar-chart"
import { CustomBarChart } from "./charts/bar-chart"
import { CustomAreaChart } from "./charts/area-chart"
import { CustomPieChart } from "./charts/pie-chart"
import { CustomDonutChart } from "./charts/donut-chart"
import { CustomLineChart } from "./charts/line-chart"
import { CustomHistogram } from "./charts/histogram"
import { Upload, FileSpreadsheet } from "lucide-react"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { type Control, useWatch } from "react-hook-form"

interface ChartDataStepFormProps {
  chartTitle: string
  chartType: string
  chartDescription: string
  chartGroup: string
  chartCategory: string
  control: Control<any>
  name: string
}

export function ChartDataStep({
  chartTitle,
  chartType,
  chartDescription,
  chartGroup,
  chartCategory,
  control,
  name,
}: ChartDataStepFormProps) {
  const [fileData, setFileData] = useState<{
    data: ChartDataPoint[]
    config: ChartConfig
    axisKeys: { xAxisKey: string; valueKeys: string[] }
  } | null>(null)

  const watchedFormData = useWatch({
    control,
    name,
  })

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === "text/csv") {
      const reader = new FileReader()
      reader.onload = (e) => {
        const csv = e.target?.result as string
        const lines = csv.split("\n")
        const headers = lines[0]?.split(",").map((h) => h.trim()) ?? []

        const data: ChartDataPoint[] = []
        for (let i = 1; i < lines.length; i++) {
          if (lines[i]?.trim()) {
            const values = lines[i]?.split(",").map((v) => v.trim())
            const row: ChartDataPoint = {}
            headers.forEach((header, index) => {
              const value = String(values![index] ?? "")
              row[header] = !isNaN(Number(value)) && value !== "" ? Number(value) : value
            })
            data.push(row)
          }
        }

        const config: ChartConfig = {}
        headers.forEach((header, index) => {
          config[header] = {
            label: header,
            color: `hsl(var(--chart-${(index % 5) + 1}))`,
          }
        })

        setFileData({
          data,
          config,
          axisKeys: {
            xAxisKey: headers[0] ?? "",
            valueKeys: headers.slice(1),
          },
        })
      }
      reader.readAsText(file)
    }
  }

  const getChartDataFromForm = () => {
    if (!watchedFormData?.columns || !watchedFormData?.data) {
      return null
    }

    const columns = watchedFormData.columns
    const dataRows = watchedFormData.data

    // Filter out empty rows
    const validData = dataRows.filter((row: any) =>
      columns.some((col: { name: string; color: string }) => row[col.name] && row[col.name] !== ""),
    )

    const chartData: ChartDataPoint[] = validData.map((row: any) => {
      const dataPoint: ChartDataPoint = {}
      columns.forEach((col: any) => {
        const value = row[col.name]
        dataPoint[col.name] = !isNaN(Number(value)) && value !== "" ? Number(value) : (value ?? "")
      })

      // For pie/donut charts, include the row color
      if (["pie", "donut"].includes(chartType) && row.color) {
        ;(dataPoint as any).color = row.color
      }

      return dataPoint
    })

    const config: ChartConfig = {}
    columns.forEach((col: any) => {
      config[col.name] = {
        label: col.name,
        color: col.color,
      }
    })

    const axisKeys = {
      xAxisKey: columns[0]?.name ?? "",
      valueKeys: columns.slice(1).map((col: any) => col.name),
    }

    return { data: chartData, config, axisKeys }
  }

  const renderChart = (isFileUpload = false) => {
    const chartInfo = isFileUpload ? fileData : getChartDataFromForm()

    if (!chartInfo || chartInfo.data.length === 0 || !chartInfo.axisKeys.xAxisKey) {
      return (
        <div className="bg-muted/20 flex h-[300px] items-center justify-center rounded-lg border-2 border-dashed">
          <p className="text-muted-foreground">Add data to see chart preview</p>
        </div>
      )
    }

    const { data, config, axisKeys } = chartInfo

    const commonProps = {
      data,
      title: chartTitle,
      config,
      description: chartDescription,
      group: chartGroup,
      category: chartCategory,
    }

    switch (chartType) {
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
      default:
        return <CustomBarChart {...commonProps} xAxisKey={axisKeys.xAxisKey} />
    }
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="manual" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manual" className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            Manual Input
          </TabsTrigger>
          <TabsTrigger value="file" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            File Upload
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manual" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Data Input Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Data Input</h3>
              <CustomDataInput chartType={chartType} control={control} name={name} />
            </div>

            {/* Chart Preview Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Live Preview</h3>
              <Card>
                <CardContent className="p-6">{renderChart(false)}</CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="file" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload CSV File</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="csv-upload">Choose CSV File</Label>
                <Input id="csv-upload" type="file" accept=".csv" onChange={handleFileUpload} />
              </div>
              <div className="text-muted-foreground text-sm">
                <p>• Upload a CSV file with headers in the first row</p>
                <p>• Data should be comma-separated</p>
                <p>• Numeric values will be automatically detected</p>
              </div>
            </CardContent>
          </Card>

          {fileData && (
            <Card>
              <CardHeader>
                <CardTitle>Chart Preview</CardTitle>
              </CardHeader>
              <CardContent>{renderChart(true)}</CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
