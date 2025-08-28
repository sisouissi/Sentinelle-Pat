
import React, { useState, useEffect } from 'react';
import { MobilityService } from '../services/mobilityService';
import type { MobilityUpdateData, ActivityType } from '../types';
import { Shield, Smartphone, Activity, BarChart, Wind, Compass, MapPin, Waves, BatteryCharging, Battery, Power, PowerOff, Footprints } from './icons';
import { useTranslation } from '../contexts/LanguageContext';

const mobilityService = MobilityService.getInstance();

const StatCard = ({ title, value, unit, icon }: { title: string, value: string | number, unit?: string, icon: React.ReactNode }) => (
    <div className="bg-white/70 backdrop-blur-md p-3 rounded-xl shadow-lg flex-1 transition-all duration-200 hover:scale-105 hover:shadow-xl">
        <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>{title}</span>
            {icon}
        </div>
        <div className="text-slate-800 text-xl font-bold">
            {value} <span className="text-sm font-normal text-slate-600">{unit}</span>
        </div>
    </div>
);

const SensorDataCard = ({ title, data, icon }: { title: string, data: { [key: string]: number }, icon: React.ReactNode }) => (
    <div className="bg-white/70 backdrop-blur-md p-3 rounded-xl shadow-lg col-span-1 transition-all duration-200 hover:scale-105 hover:shadow-xl">
        <div className="flex items-center gap-2 text-slate-600 font-semibold text-sm mb-2">
            {icon} {title}
        </div>
        <div className="space-y-1 text-xs">
            {Object.entries(data).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                    <span className="text-slate-500">{key.toUpperCase()}:</span>
                    <span className="font-mono text-slate-700">{value.toFixed(2)}</span>
                </div>
            ))}
        </div>
    </div>
);

const ActivityDisplay = ({ activity }: { activity: ActivityType }) => {
    const { t } = useTranslation();
    const activityInfo = {
        stationary: { icon: <Smartphone className="w-8 h-8"/>, text: t('mobility.activities.stationary'), color: "text-slate-500" },
        walking: { icon: <Footprints className="w-8 h-8"/>, text: t('mobility.activities.walking'), color: "text-blue-500" },
        running: { icon: <Activity className="w-8 h-8"/>, text: t('mobility.activities.running'), color: "text-green-500" },
        vehicle: { icon: <MapPin className="w-8 h-8"/>, text: t('mobility.activities.vehicle'), color: "text-purple-500" },
    };
    const current = activityInfo[activity];
    return (
        <div className={`flex flex-col items-center justify-center p-4 rounded-xl shadow-lg bg-white/70 backdrop-blur-md transition-all duration-200 hover:scale-105 hover:shadow-xl ${current.color}`}>
            {current.icon}
            <p className="font-bold text-lg mt-2">{current.text}</p>
        </div>
    )
}

const PermissionRequestView = ({ onRequest }: { onRequest: () => void }) => {
    const { t } = useTranslation();
    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-4 bg-white/70 backdrop-blur-md rounded-2xl shadow-xl">
            <Shield className="w-12 h-12 text-blue-500 mb-4" />
            <h3 className="text-lg font-semibold text-slate-800">{t('mobility.permission.title')}</h3>
            <p className="text-sm text-slate-600 max-w-sm mt-1 mb-4">
                {t('mobility.permission.description')}
            </p>
            <button onClick={onRequest} className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                {t('mobility.permission.button')}
            </button>
        </div>
    );
};

const DashboardView = ({ data }: { data: MobilityUpdateData }) => {
    const { t } = useTranslation();
    const handleToggleTracking = () => {
        if (data.isTracking) {
            mobilityService.stopTracking();
        } else {
            mobilityService.startTracking();
        }
    };
    
    return (
        <div className="space-y-3 animate-fade-in">
            <div className="flex items-center gap-3">
                 <button onClick={handleToggleTracking} className={`flex-grow flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-lg transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95 hover:shadow-md ${data.isTracking ? 'bg-gradient-to-br from-red-500 to-red-600' : 'bg-gradient-to-br from-green-500 to-green-600'}`}>
                    {data.isTracking ? <><PowerOff className="w-4 h-4" /> {t('mobility.stopTracking')}</> : <><Power className="w-4 h-4" /> {t('mobility.startTracking')}</>}
                </button>
                <div className={`flex items-center gap-2 p-2 rounded-lg text-xs font-medium ${data.batteryLevel < 20 ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
                    {data.batteryLevel < 20 ? <Battery className="w-4 h-4" /> : <BatteryCharging className="w-4 h-4"/> }
                    {data.batteryLevel.toFixed(0)}%
                    <span className="hidden sm:inline">({t('mobility.interval')}: {data.collectionInterval/1000}s)</span>
                </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1"><ActivityDisplay activity={data.activityType} /></div>
                <div className="sm:col-span-2 grid grid-cols-2 gap-3">
                    <StatCard title={t('mobility.mobilityScore')} value={data.mobilityScore} unit="/ 100" icon={<BarChart className="w-4 h-4"/>} />
                    <StatCard title={t('mobility.stepFrequency')} value={data.stepFrequency.toFixed(1)} unit="Hz" icon={<Footprints className="w-4 h-4"/>} />
                    <StatCard title={t('mobility.movementSpeed')} value={data.movementSpeed.toFixed(1)} unit="km/h" icon={<Wind className="w-4 h-4"/>} />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <SensorDataCard title={t('mobility.accelerometer')} data={data.accelerometer} icon={<Waves className="w-4 h-4"/>} />
                <SensorDataCard title={t('mobility.gyroscope')} data={data.gyroscope} icon={<Compass className="w-4 h-4"/>} />
            </div>
        </div>
    )
}


export function MobilityTab(): React.ReactNode {
    const [data, setData] = useState<MobilityUpdateData | null>(null);
    const { t } = useTranslation();

    useEffect(() => {
        const unsubscribe = mobilityService.onUpdate(setData);
        return () => unsubscribe();
    }, []);

    if (!data) {
        return <div className="flex items-center justify-center h-full text-slate-500">{t('mobility.loading')}</div>;
    }

    return (
        <div className="p-1 h-full">
            {data.hasPermission ? <DashboardView data={data} /> : <PermissionRequestView onRequest={() => mobilityService.requestPermission()} />}
        </div>
    );
}
