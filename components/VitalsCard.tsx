
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
  style?: React.CSSProperties;
}

export function VitalsCard({ title, value, trend, icon, isConnected, onConnectClick, style }: VitalsCardProps): React.ReactNode {
  const { t } = useTranslation();
  return (
    <div 
      style={style}
      className="bg-white/70 backdrop-blur-md p-4 rounded-2xl shadow-lg col-span-1 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-xl animate-fade-in">
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
            <button 
                onClick={onConnectClick} 
                className="w-full flex items-center justify-center text-xs text-white font-semibold bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 hover:shadow-md px-2 py-1.5 rounded-full transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95"
            >
                <Bluetooth className="w-3 h-3 mr-1.5"/>
                {t('deviceManager.connect')}
            </button>
         )}
      </div>
    </div>
  );
}