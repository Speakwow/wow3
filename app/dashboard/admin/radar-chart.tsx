// 使用 Recharts 绘制雷达图
'use client'
import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, ResponsiveContainer } from 'recharts';


export default function ReportRadar({ data }: { data: any }) {
    const radarData = [
        { subject: '寫作', A: data.writing, fullMark: 100 },
        { subject: '口說', A: data.speaking, fullMark: 100 },
        { subject: '語法', A: data.grammar, fullMark: 100 },
        { subject: '發音', A: data.pronunciation, fullMark: 100 },
        { subject: '思維', A: data.thinking, fullMark: 100 },
    ];
    return (
        <ResponsiveContainer width="100%" height={300}>
        <RadarChart outerRadius={100} width={200} height={200} data={radarData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" />
            <PolarRadiusAxis angle={45} domain={[50, 100]} />
            <Radar name="Average Score" 
            dataKey="A" 
            stroke="current"
            fill="current"
            fillOpacity={0.8} 
            className='fill-primary stroke-primary text-xs'/>
            <Tooltip />
        </RadarChart>
        </ResponsiveContainer>
    );
}
