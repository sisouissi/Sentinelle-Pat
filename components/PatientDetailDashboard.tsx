
import React, { useState, useEffect } from 'react';
import type { PatientData, CompletePrediction, ChatMessage } from '../types';
import * as supabaseService from '../services/supabaseService';
import { predictionService } from '../services/predictionService';
import { ArrowLeft, BrainCircuit, MessageCircle } from './icons';
import { PredictionCard } from './PredictionCard';
import { AlertsTimeline } from './AlertsTimeline';
import { RealTimeChart } from './RealTimeChart';
import { LocationHeatmap } from './LocationHeatmap';
import { ChatHistoryViewer } from './ChatHistoryViewer';
import { MedicationAdherenceCard } from './MedicationAdherenceCard';
import { PatientInfoCard } from './PatientInfoCard';
import { useTranslation } from '../contexts/LanguageContext';

interface PatientDetailDashboardProps {
  patient: PatientData;
  onBack: () => void;
}

const LoadingState: React.FC<{text: string}> = ({text}) => (
    <div className="flex items-center justify-center h-full text-slate-500 py-10">
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>{text}</span>
    </div>
);

const TabButton = ({ isActive, onClick, children, icon }: { isActive: boolean, onClick: () => void, children: React.ReactNode, icon: React.ReactNode }) => (
    <button onClick={onClick} className={`flex items-center justify-center gap-2 w-full px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${isActive ? 'bg-white shadow text-blue-600' : 'text-slate-600 hover:bg-white/80'}`}>
        {icon} {children}
    </button>
);

export function PatientDetailDashboard({ patient, onBack }: PatientDetailDashboardProps): React.ReactNode {
    const { t } = useTranslation();
    const [prediction, setPrediction] = useState<CompletePrediction | null>(null);
    const [chatHistory, setChatHistory] = useState<ChatMessage[] | null>(null);
    const [activeTab, setActiveTab] = useState<'prediction' | 'chat'>('prediction');
    const [isChatLoading, setIsChatLoading] = useState(false);

    useEffect(() => {
        // Start the prediction service when the component mounts
        predictionService.startStreaming(patient);
        const unsubscribe = predictionService.onUpdate(setPrediction);

        // Fetch chat history
        if (activeTab === 'chat' && !chatHistory) {
            setIsChatLoading(true);
            supabaseService.getChatHistory(patient.id)
                .then(setChatHistory)
                .catch(console.error)
                .finally(() => setIsChatLoading(false));
        }

        return () => {
            unsubscribe();
            predictionService.stopStreaming();
        };
    }, [patient, activeTab, chatHistory]);

    const renderContent = () => {
        if (activeTab === 'prediction') {
            if (!prediction) {
                return <LoadingState text={t('patientDetail.loadingPrediction')} />;
            }
            return (
                 <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 animate-fade-in">
                    <div className="xl:col-span-1 space-y-5">
                       <PredictionCard prediction={prediction} />
                       <AlertsTimeline alerts={prediction.alerts} />
                    </div>
                    <div className="xl:col-span-2 space-y-5">
                        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-lg h-72 transition-shadow duration-300 hover:shadow-xl">
                           <h3 className="text-md font-semibold text-slate-700 mb-2">{t('patientDetail.hourlyActivity')}</h3>
                           <RealTimeChart activityData={prediction.activityData} />
                        </div>
                         <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-lg transition-shadow duration-300 hover:shadow-xl">
                           <h3 className="text-md font-semibold text-slate-700 mb-2">{t('patientDetail.mobilityHeatmap')}</h3>
                           <LocationHeatmap heatmapData={prediction.heatmapData} />
                        </div>
                    </div>
                </div>
            )
        }
        if (activeTab === 'chat') {
            if (isChatLoading) {
                return <LoadingState text={t('patientDetail.loadingChat')} />;
            }
            if (!chatHistory || chatHistory.length === 0) {
                 return (
                    <div className="text-center py-10 text-slate-500">
                        <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
                        <p>{t('patientDetail.noChatHistory')}</p>
                    </div>
                );
            }
            return <ChatHistoryViewer history={chatHistory} />;
        }
        return null;
    }

    return (
        <div className="animate-fade-in space-y-4">
            <header className="flex items-center gap-4">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-200 transition-colors">
                    <ArrowLeft className="w-6 h-6 text-slate-600" />
                </button>
                <div>
                    <h2 className="text-xl font-bold text-slate-800">{t('patientDetail.title', { name: patient.name })}</h2>
                    <p className="text-sm text-slate-500">{patient.age} ans, {patient.condition}</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <PatientInfoCard patient={patient} />
                <MedicationAdherenceCard patient={patient} />
            </div>

             <div className="p-1 bg-slate-200/80 rounded-xl flex items-center max-w-lg mx-auto">
                <TabButton isActive={activeTab === 'prediction'} onClick={() => setActiveTab('prediction')} icon={<BrainCircuit className="w-5 h-5"/>}>
                    {t('patientDetail.liveAnalysis')}
                </TabButton>
                <TabButton isActive={activeTab === 'chat'} onClick={() => setActiveTab('chat')} icon={<MessageCircle className="w-5 h-5"/>}>
                    {t('patientDetail.chatHistory')}
                </TabButton>
            </div>
            
            <div className="mt-4">
                {renderContent()}
            </div>
        </div>
    );
}
