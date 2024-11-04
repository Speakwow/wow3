'use client'
import { Bar, BarChart } from "recharts"
 
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
 
export function MyChart({data}:{data:any[]}) {
  return (
    <ChartContainer config={{}}>
      <BarChart data={data}>
        <Bar dataKey="value" />
        <ChartTooltip content={<ChartTooltipContent />} />
      </BarChart>
    </ChartContainer>
  )
}