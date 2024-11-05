'use client'
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts"
 
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
 
const chartConfig = {
    desktop: {
      label: "Desktop",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig
  
export function MyChart({data,dataKey}:{data:any[],dataKey:string}) {
  return (
    <ChartContainer config={chartConfig}>
      <BarChart data={data}
      margin={{
        top: 20,
      }}>
        <CartesianGrid vertical={false} />

        <XAxis
      dataKey="orgName"
      tickLine={false}
      tickMargin={10}
      axisLine={false}
      tickFormatter={(value) => value.slice(0, 6)}
    />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar fill="var(--color-desktop)" radius={8}  dataKey={dataKey} >
        <LabelList
                position="top"
                offset={12}
                className="fill-foreground"
                fontSize={12}
              />
        </Bar>
        
      </BarChart>
    </ChartContainer>
  )
}