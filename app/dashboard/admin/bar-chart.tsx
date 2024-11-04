'use client'
import { Bar, BarChart, XAxis } from "recharts"
 
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
 
export function MyChart({data,dataKey}:{data:any[],dataKey:string}) {
  return (
    <ChartContainer config={{}}>
      <BarChart data={data}>
        <Bar dataKey={dataKey} />
        <XAxis
      dataKey="orgName"
      tickLine={false}
      tickMargin={10}
      axisLine={false}
      tickFormatter={(value) => value.slice(0, 3)}
    />
        <ChartTooltip content={<ChartTooltipContent />} />
      </BarChart>
    </ChartContainer>
  )
}