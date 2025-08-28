import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { SpeechAnalysis } from '../types';
import { Mic, BarChart, Activity } from './icons';
import { useTranslation } from '../contexts/LanguageContext';

interface SpeechAnalysisTabProps {
  speechAnalysisHistory: SpeechAnalysis[];
  onNewAnalysis: () => void;
}

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

export function SpeechAnalysisTab({ speechAnalysisHistory, onNewAnalysis }: SpeechAnalysisTabProps): React.ReactNode {
    const { t } = useTranslation();
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const latestAnalysis = useMemo(() => {
        return speechAnalysisHistory.length > 0 ? speechAnalysisHistory[speechAnalysisHistory.length - 1] : null;
    }, [speechAnalysisHistory]);

    const chartData = useMemo(() => {
        return speechAnalysisHistory.map(item => ({
            date: new Date(item.timestamp).toLocaleDateString(),
            [t('speech.speechRateKey')]: item.speechRate.toFixed(0),
            [t('speech.pauseFrequencyKey')]: item.pauseFrequency.toFixed(1),
        }));
    }, [speechAnalysisHistory, t]);

    const handleStartAnalysis = () => {
        setIsAnalyzing(true);
        onNewAnalysis();
        // The parent component will handle the async nature and update props.
        // We'll just wait for the animation here.
        setTimeout(() => setIsAnalyzing(false), 3000);
    };

    return (
        <div className="p-1 h-full flex flex-col space-y-3">
             <div className="text-center">
                <h3 className="text-lg font-semibold text-slate-800">{t('speech.title')}</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">{t('speech.description')}</p>
            </div>
            
            <button
                onClick={handleStartAnalysis}
                disabled={isAnalyzing}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 font-semibold text-white bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg hover:shadow-lg disabled:from-slate-400 disabled:to-slate-500 transition-all transform hover:scale-105 active:scale-95"
            >
                {isAnalyzing ? (
                    <>
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        <span>{t('speech.analyzing')}</span>
                    </>
                ) : (
                    <>
                        <Mic className="w-5 h-5" />
                        <span>{t('speech.startAnalysis')}</span>
                    </>
                )}
            </button>

            {latestAnalysis && (
                <div className="animate-fade-in">
                    <h4 className="font-semibold text-slate-700 text-sm mb-2">{t('speech.latestAnalysis')}</h4>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <StatCard title={t('speech.speechRate')} value={latestAnalysis.speechRate.toFixed(0)} unit={t('speech.wpm')} icon={<Activity className="w-4 h-4 text-green-500"/>} />
                        <StatCard title={t('speech.pauseFrequency')} value={latestAnalysis.pauseFrequency.toFixed(1)} unit={t('speech.ppm')} icon={<BarChart className="w-4 h-4 text-yellow-500"/>} />
                        <StatCard title={t('speech.articulationScore')} value={latestAnalysis.articulationScore.toFixed(0)} unit="/ 100" icon={<Mic className="w-4 h-4 text-purple-500"/>} />
                    </div>
                </div>
            )}
            
            <div className="flex-1 bg-white/70 backdrop-blur-md p-2 rounded-2xl shadow-lg min-h-[15rem]">
                 <h4 className="font-semibold text-slate-700 text-sm mb-2 px-2">{t('speech.trendTitle')}</h4>
                 <ResponsiveContainer width="100%" height="90%">
                     <AreaChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <defs>
                            <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/><stop offset="95%" stopColor="#22c55e" stopOpacity={0}/></linearGradient>
                            <linearGradient id="colorPause" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#eab308" stopOpacity={0.8}/><stop offset="95%" stopColor="#eab308" stopOpacity={0}/></linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <XAxis dataKey="date" stroke="#9ca3af" fontSize={11} />
                        <YAxis yAxisId="left" stroke="#22c55e" fontSize={11} domain={[100, 160]} />
                        <YAxis yAxisId="right" orientation="right" stroke="#eab308" fontSize={11} domain={[0, 10]} />
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '0.75rem' }} />
                        <Legend wrapperStyle={{fontSize: "12px"}}/>
                        <Area yAxisId="left" type="monotone" dataKey={t('speech.speechRateKey')} stroke="#22c55e" fill="url(#colorRate)" strokeWidth={2} />
                        <Area yAxisId="right" type="monotone" dataKey={t('speech.pauseFrequencyKey')} stroke="#eab308" fill="url(#colorPause)" strokeWidth={2} />
                     </AreaChart>
                 </ResponsiveContainer>
            </div>

        </div>
    );
}
