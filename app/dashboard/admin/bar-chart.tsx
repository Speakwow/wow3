'use client'
import { Bar, BarChart } from "recharts"
 
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
 
export function MyChart({data,dataKey}:{data:any[],dataKey:string}) {
  return (
    <ChartContainer config={{}}>
      <BarChart data={data}>
        <Bar dataKey={dataKey} />
        <ChartTooltip content={<ChartTooltipContent />} />
      </BarChart>
    </ChartContainer>
  )
}