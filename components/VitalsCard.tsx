
import React from 'react';
import { ArrowDown, ArrowUp, Bluetooth } from './icons';
import { useTranslation } from '../contexts/LanguageContext';

interface VitalsCardProps {
  title: string;
  value: string;
  trend: 'up' | 'down' | 'stable';
  icon: React.ReactNode;
  isConnected: boolean;
  onConnectClick: () => void;
}

export function VitalsCard({ title, value, trend, icon, isConnected, onConnectClick }: VitalsCardProps): React.ReactNode {
  const { t } = useTranslation();
  return (
    <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-sm col-span-1 flex flex-col justify-between">
      <div className="flex items-start justify-between mb-2">
        <div>
            <h3 className="text-sm font-medium text-slate-500">{title}</h3>
        </div>
        {icon}
      </div>
      <div className="flex items-baseline space-x-2">
        <p className="text-3xl font-bold text-slate-800">{value}</p>
        {trend !== 'stable' && (
          <div className={`flex items-center ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
            {trend === 'up' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
          </div>
        )}
      </div>
       <div className="mt-2">
         {isConnected ? (
             <div className="flex items-center text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                <Bluetooth className="w-3 h-3 mr-1.5"/>
                {t('deviceManager.statusActive')}
            </div>
         ) : (
            <button onClick={onConnectClick} className="w-full flex items-center justify-center text-xs text-blue-700 font-semibold bg-blue-100 hover:bg-blue-200 px-2 py-1 rounded-full transition-colors">
                <Bluetooth className="w-3 h-3 mr-1.5"/>
                {t('deviceManager.connect')}
            </button>
         )}
      </div>
    </div>
  );
}
