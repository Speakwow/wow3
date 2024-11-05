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
        <Bar fill="primary" radius={8}  dataKey={dataKey} >
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




const chartConfig2 = {
  word: {
    label: "单词",
    color: "hsl(var(--chart-1))",
  },
  repeat: {
    label: "跟读",
    color: "hsl(var(--chart-2))",
  },
  write: {
    label: "写作",
    color: "hsl(var(--chart-3))",
  },
  scenario: {
    label: "情景对话",
    color: "hsl(var(--chart-4))",
  },
  talkabout: {
    label: "看图说话",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig

export function MultipleBarChart({data}:{data:any}) {
  return (
        <ChartContainer config={chartConfig2}>
          <BarChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="name"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 6)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Bar dataKey="write" fill="hsl(var(--chart-1))" radius={4} label='写作' />
            <Bar dataKey="word" fill="hsl(var(--chart-2))" radius={4} label='单词' />
            <Bar dataKey="repeat" fill="hsl(var(--chart-3))" radius={4} label='跟读'/>
            <Bar dataKey="scenario" fill="hsl(var(--chart-4))" radius={4} label='情景对话'/>
            <Bar dataKey="talkabout" fill="hsl(var(--chart-5))" radius={4} label='看图说话'/>
          </BarChart>
        </ChartContainer>

  )
}
