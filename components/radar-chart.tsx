// 使用 Recharts 绘制雷达图
'use client'
import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, ResponsiveContainer } from 'recharts';


export default function WriteReportRadar({ data }: { data: any }) {
    const radarData = [
        { subject: '内容切题', A: data.content_score, fullMark: 100 },
        { subject: '表述得当', A: data.communicativeachievement_score, fullMark: 100 },
        { subject: '语言结构', A: data.organisation_score, fullMark: 100 },
        { subject: '词汇及语法', A: data.language_score, fullMark: 100 },
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
