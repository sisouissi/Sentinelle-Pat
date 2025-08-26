
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import type { Measurement } from '../types';
import { useTranslation } from '../contexts/LanguageContext';

interface TrendsChartProps {
  measurements: Measurement[];
}

export function TrendsChart({ measurements }: TrendsChartProps): React.ReactNode {
  const { t } = useTranslation();
  
  const data = measurements.map(m => ({
    time: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    SpO2: m.spo2,
    [t('trendsChart.heartRateKey')]: m.heartRate,
  }));

  const heartRateKey = t('trendsChart.heartRateKey');
  const heartRateUnit = t('trendsChart.heartRateUnit');
  const spo2Unit = t('trendsChart.spo2Unit');

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
        <defs>
            <linearGradient id="colorSpo2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorHr" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
            </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis dataKey="time" stroke="#9ca3af" fontSize={12} tick={{ dy: 5 }} />
        <YAxis yAxisId="left" stroke="#3b82f6" domain={[85, 100]} fontSize={12} label={{ value: spo2Unit, angle: -90, position: 'insideLeft', dx: -5, fill: '#3b82f6' }} />
        <YAxis yAxisId="right" orientation="right" stroke="#ef4444" domain={[50, 120]} fontSize={12} label={{ value: heartRateUnit, angle: 90, position: 'insideRight', dx: 5, fill: '#ef4444' }} />
        <Tooltip
            contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(5px)',
                border: '1px solid #e2e8f0',
                borderRadius: '0.75rem',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
            }}
            labelStyle={{ fontWeight: 'bold', color: '#334155' }}
        />
        <Legend wrapperStyle={{fontSize: "14px", paddingTop: "10px"}}/>
        
        <ReferenceLine yAxisId="left" y={92} label={{ value: t('trendsChart.alertThreshold'), position: 'insideTopLeft', fill: '#d97706', fontSize: 10 }} stroke="#f59e0b" strokeDasharray="3 3" />
        <ReferenceLine yAxisId="left" y={90} label={{ value: t('trendsChart.criticalThreshold'), position: 'insideTopLeft', fill: '#dc2626', fontSize: 10, dy: 15 }} stroke="#ef4444" strokeDasharray="3 3" />

        <Area yAxisId="left" type="monotone" dataKey="SpO2" name={spo2Unit} stroke="#3b82f6" fillOpacity={1} fill="url(#colorSpo2)" strokeWidth={2} activeDot={{ r: 6 }} />
        <Area yAxisId="right" type="monotone" dataKey={heartRateKey} name={`${heartRateKey} (${heartRateUnit})`} stroke="#ef4444" fillOpacity={1} fill="url(#colorHr)" strokeWidth={2} activeDot={{ r: 6 }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}