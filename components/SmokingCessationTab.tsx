import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { SmokingCessationData, SmokingLog } from '../types';
import { Flame, CheckCircle, BarChart as BarChartIcon } from './icons';
import { useTranslation } from '../contexts/LanguageContext';

interface SmokingCessationTabProps {
  smokingData?: SmokingCessationData;
  onLogEvent: (log: Omit<SmokingLog, 'timestamp' | 'trigger'> & { trigger?: string }) => void;
}

const StatCard = ({ title, value, icon, colorClass }: { title: string, value: string | number, icon: React.ReactNode, colorClass: string }) => (
    <div className="bg-white/70 backdrop-blur-md p-3 rounded-xl shadow-lg flex-1 transition-all duration-200 hover:scale-105 hover:shadow-xl">
        <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>{title}</span>
            {icon}
        </div>
        <div className={`font-bold text-xl ${colorClass}`}>
            {value}
        </div>
    </div>
);

const LogEventModal = ({ type, onClose, onSave }: { type: 'craving' | 'smoked', onClose: () => void, onSave: (trigger: string) => void }) => {
    const { t } = useTranslation();
    const [trigger, setTrigger] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(trigger);
    };

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-semibold text-slate-800 text-center">{t(type === 'craving' ? 'smoking.logModal.titleCraving' : 'smoking.logModal.titleSmoked')}</h3>
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    <div>
                        <label htmlFor="trigger" className="block text-sm font-medium text-slate-600 mb-2">{t('smoking.logModal.question')}</label>
                        <input
                            id="trigger"
                            type="text"
                            value={trigger}
                            onChange={e => setTrigger(e.target.value)}
                            placeholder={t('smoking.logModal.placeholder')}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={() => onSave('')} className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200">{t('smoking.logModal.skipButton')}</button>
                        <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700">{t('smoking.logModal.saveButton')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export function SmokingCessationTab({ smokingData, onLogEvent }: SmokingCessationTabProps): React.ReactNode {
    const { t, language } = useTranslation();
    const [isModalOpen, setIsModalOpen] = useState<'craving' | 'smoked' | null>(null);

    const { dailyStats, weeklyChartData, recentLogs } = useMemo(() => {
        if (!smokingData?.isSmoker) return { dailyStats: null, weeklyChartData: [], recentLogs: [] };

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const smokedToday = smokingData.logs.filter(log => log.type === 'smoked' && new Date(log.timestamp) >= today).length;
        const cravingsToday = smokingData.logs.filter(log => log.type === 'craving' && new Date(log.timestamp) >= today).length;

        const weeklyData = Array.from({ length: 7 }, (_, i) => {
            const day = new Date();
            day.setDate(day.getDate() - i);
            day.setHours(0, 0, 0, 0);
            const nextDay = new Date(day);
            nextDay.setDate(day.getDate() + 1);
            
            const count = smokingData.logs.filter(log => log.type === 'smoked' && new Date(log.timestamp) >= day && new Date(log.timestamp) < nextDay).length;
            return { date: day.toLocaleDateString(language, { weekday: 'short' }), [t('smoking.cigarettesLabel')]: count };
        }).reverse();
        
        const recent = [...smokingData.logs].reverse().slice(0, 10);

        return {
            dailyStats: { smokedToday, cravingsToday, consecutiveSmokeFreeDays: smokingData.consecutiveSmokeFreeDays },
            weeklyChartData: weeklyData,
            recentLogs: recent,
        };
    }, [smokingData, t, language]);
    
    const handleLogEvent = (trigger: string) => {
        if (isModalOpen) {
            onLogEvent({ type: isModalOpen, trigger });
        }
        setIsModalOpen(null);
    };

    if (!smokingData) return null;

    if (!smokingData.isSmoker) {
        return (
            <div className="p-4 h-full flex flex-col items-center justify-center text-center bg-green-50 rounded-2xl">
                <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                <h3 className="text-lg font-semibold text-green-800">{t('smoking.nonSmokerTitle')}</h3>
                <p className="text-sm text-green-700 max-w-sm mt-1">{t('smoking.nonSmokerDescription')}</p>
            </div>
        );
    }

    return (
        <div className="p-1 h-full flex flex-col space-y-3">
            {isModalOpen && <LogEventModal type={isModalOpen} onClose={() => setIsModalOpen(null)} onSave={handleLogEvent} />}
            <div className="text-center">
                <h3 className="text-lg font-semibold text-slate-800">{t('smoking.title')}</h3>
            </div>
            
            <div className="space-y-3">
                 <h4 className="font-semibold text-slate-700 text-sm">{t('smoking.dailyStats')}</h4>
                 <div className="flex flex-col sm:flex-row gap-3">
                     <StatCard title={t('smoking.smokedToday')} value={dailyStats?.smokedToday ?? 0} icon={<Flame className="w-4 h-4" />} colorClass="text-red-600" />
                     <StatCard title={t('smoking.cravingsToday')} value={dailyStats?.cravingsToday ?? 0} icon={<Flame className="w-4 h-4" />} colorClass="text-yellow-600" />
                     <StatCard title={t('smoking.smokeFreeDays')} value={dailyStats?.consecutiveSmokeFreeDays ?? 0} icon={<CheckCircle className="w-4 h-4" />} colorClass="text-green-600" />
                 </div>
                 <div className="flex gap-3">
                     <button onClick={() => setIsModalOpen('craving')} className="w-full py-2 font-semibold text-yellow-700 bg-yellow-100 rounded-lg hover:bg-yellow-200 transition-colors">{t('smoking.logCraving')}</button>
                     <button onClick={() => setIsModalOpen('smoked')} className="w-full py-2 font-semibold text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors">{t('smoking.logSmoked')}</button>
                 </div>
            </div>

            <div className="flex-1 bg-white/70 backdrop-blur-md p-2 rounded-2xl shadow-lg min-h-[12rem]">
                <h4 className="font-semibold text-slate-700 text-sm px-2">{t('smoking.weeklyChartTitle')}</h4>
                <ResponsiveContainer width="100%" height="90%">
                    <BarChart data={weeklyChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="date" fontSize={11} />
                        <YAxis allowDecimals={false} />
                        <Tooltip cursor={{fill: 'rgba(238, 242, 255, 0.6)'}} contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '0.75rem' }}/>
                        <Bar dataKey={t('smoking.cigarettesLabel')} radius={[4, 4, 0, 0]}>
                            {weeklyChartData.map((entry, index) => (
                                // Fix: Cast property to number to resolve type ambiguity for comparison
                                <Cell key={`cell-${index}`} fill={(entry[t('smoking.cigarettesLabel')] as number) > 0 ? '#ef4444' : '#22c55e'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div>
                <h4 className="font-semibold text-slate-700 text-sm mb-2">{t('smoking.activityLogTitle')}</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
                    {recentLogs.map((log, index) => (
                        <div key={index} className="flex items-center gap-3 text-xs bg-slate-100/80 p-2 rounded-lg">
                            <Flame className={`w-4 h-4 flex-shrink-0 ${log.type === 'smoked' ? 'text-red-500' : 'text-yellow-500'}`} />
                            <div className="flex-grow">
                                <p className="font-semibold text-slate-700">
                                    {t(log.type === 'smoked' ? 'smoking.smokedEvent' : 'smoking.cravingEvent')}
                                </p>
                                {log.trigger && <p className="text-slate-500">{t('smoking.triggerLabel')} {log.trigger}</p>}
                            </div>
                            <span className="text-slate-400">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}