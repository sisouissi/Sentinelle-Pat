import React from 'react';
import type { CompletePrediction } from '../types';
import { useTranslation } from '../contexts/LanguageContext';

interface LocationHeatmapProps {
  heatmapData: CompletePrediction['heatmapData'];
}

export function LocationHeatmap({ heatmapData }: LocationHeatmapProps): React.ReactNode {
  const { t } = useTranslation();

  const getColor = (value: number) => {
    if (value === 0) return 'bg-slate-100/80';
    const h = (1 - value) * 240; // blue to red
    const l = 50 + value * 20; // lightness
    return `hsl(${h}, 90%, ${l}%)`;
  };

  return (
    <div className="flex flex-col items-center">
        <div className="grid grid-cols-12 gap-1 w-full max-w-md mx-auto">
            {heatmapData.map((row, rowIndex) =>
                row.map((value, colIndex) => (
                    <div
                        key={`${rowIndex}-${colIndex}`}
                        className="w-full aspect-square rounded-sm"
                        style={{ backgroundColor: getColor(value) }}
                        title={`Activité : ${Math.round(value * 100)}%`}
                    ></div>
                ))
            )}
        </div>
        <div className="flex items-center justify-center space-x-4 mt-2 text-xs text-slate-500">
            <span>{t('heatmap.lowActivity')}</span>
            <div className="w-24 h-2 rounded-full bg-gradient-to-r from-blue-400 via-green-400 to-red-500"></div>
            <span>{t('heatmap.highActivity')}</span>
        </div>
    </div>
  );
}