import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import type { CompletePrediction } from '../types';
import { useTranslation } from '../contexts/LanguageContext';

interface RealTimeChartProps {
  activityData: CompletePrediction['activityData'];
}

export function RealTimeChart({ activityData }: RealTimeChartProps): React.ReactNode {
  const { t } = useTranslation();
  const data = activityData.map(d => ({
    ...d,
    [t('realTimeChart.steps')]: d.steps,
    [t('realTimeChart.activeMinutes')]: d.activeMinutes
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 5, right: 20, left: -15, bottom: 5 }}>
        <defs>
            <linearGradient id="colorSteps" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
            </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis dataKey="time" stroke="#9ca3af" fontSize={11} interval={5}/>
        <YAxis yAxisId="left" stroke="#3b82f6" fontSize={11} />
        <YAxis yAxisId="right" orientation="right" stroke="#14b8a6" fontSize={11} />
        <Tooltip
            contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(4px)',
                border: '1px solid #e2e8f0',
                borderRadius: '0.75rem',
            }}
        />
        <Legend wrapperStyle={{fontSize: "12px"}}/>
        <Area yAxisId="left" type="monotone" dataKey={t('realTimeChart.steps')} stroke="#3b82f6" fillOpacity={1} fill="url(#colorSteps)" strokeWidth={2} />
        <Area yAxisId="right" type="monotone" dataKey={t('realTimeChart.activeMinutes')} stroke="#14b8a6" fillOpacity={1} fill="url(#colorActive)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}