
import React, { useState, useEffect, useCallback } from 'react';
import type { PatientData, ChatMessage, RiskLevel, Measurement, DeviceReading } from './types';
import { calculateRiskScore } from './services/mockDataService';
import * as supabaseService from './services/supabaseService';
import { getInitialGreeting, getAIResponseStream, getProactiveQuestion, analyzeUserResponse, isAiAvailable } from './services/geminiService';
import { DeviceManager as DeviceManagerService } from './services/deviceService';
import { MedicationScheduler } from './services/MedicationScheduler';
import { VitalsCard } from './components/VitalsCard';
import { RiskScore } from './components/RiskScore';
import { TrendsChart } from './components/TrendsChart';
import { DeviceManagerModal } from './components/DeviceManagerModal';
import { SmartphoneData } from './components/SmartphoneData';
import { Chatbot } from './components/Chatbot';
import { MobilityTab } from './components/MobilityTab';
import { TreatmentTab } from './components/TreatmentTab';
import { PairingScreen } from './components/PairingScreen';
import { ProfileModal } from './components/ProfileModal';
import { EmergencyModal } from './components/EmergencyModal';
import { Wind, Smartphone, Stethoscope, Pill, Footprints, LogOut, Bot, BrainCircuit, Globe, User, Sos, AlertTriangle } from './components/icons';
import { useTranslation } from './contexts/LanguageContext';


const deviceManager = DeviceManagerService.getInstance();
const medicationScheduler = MedicationScheduler.getInstance();

export default function App(): React.ReactNode {
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [riskLevel, setRiskLevel] = useState<RiskLevel>('Low');
  const [riskScore, setRiskScore] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<string>('vitals');
  const [isAiFilterActive, setIsAiFilterActive] = useState<boolean>(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isAiTyping, setIsAiTyping] = useState<boolean>(false);
  const [isDeviceConnected, setIsDeviceConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hasUnreadMessages, setHasUnreadMessages] = useState<boolean>(false);
  const [isDeviceManagerOpen, setDeviceManagerOpen] = useState(false);
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);
  const [isEmergencyModalOpen, setEmergencyModalOpen] = useState(false);
  const { t, setLanguage, language } = useTranslation();

  const triggerProactiveAI = useCallback(async (currentPatientData: PatientData, newRiskLevel: RiskLevel) => {
    setIsAiTyping(true);
    const aiQuestion = await getProactiveQuestion(currentPatientData, newRiskLevel, language);
    if (aiQuestion) {
        setChatHistory(prev => [...prev, aiQuestion]);
        supabaseService.addChatMessage({ patientId: currentPatientData.id, ...aiQuestion })
            .catch(err => console.error("Failed to save proactive question:", err));
        if (activeTab !== 'chatbot') {
            setHasUnreadMessages(true);
        }
    }
    setIsAiTyping(false);
  }, [activeTab, language]);

  const updateRisk = useCallback((data: PatientData) => {
    const { score, level } = calculateRiskScore(data);
    setRiskScore(score);
    
    if (level !== riskLevel) {
        setRiskLevel(level);
        if (level === 'High' || level === 'Medium') {
            triggerProactiveAI(data, level);
        }
    }
  }, [riskLevel, triggerProactiveAI]);

  const refreshPatientData = useCallback(async (id: number) => {
     const patient = await supabaseService.getPatientById(id);
     if (patient) {
       setPatientData(patient);
     }
  }, []);

  const loadPatientAndHistory = useCallback(async (patient: PatientData) => {
    let currentPatientData = { ...patient }; // Use a mutable copy

    // Update environmental data from API
    try {
        if (currentPatientData.smartphone_data_id) {
            console.log("Attempting to update environmental data from OpenWeatherMap...");
            const updatedSmartphoneData = await supabaseService.updatePatientEnvironmentData(currentPatientData.smartphone_data_id);
            if (updatedSmartphoneData) {
                // Merge the new data into our patient object
                currentPatientData = {
                    ...currentPatientData,
                    smartphone: updatedSmartphoneData
                };
                console.log("Environmental data successfully merged into patient state.");
            }
        }
    } catch (error) {
        console.error("Failed to update environmental data. The app will proceed with existing data.", error);
        // This is a non-critical error, so we allow the app to continue.
    }
      
    setPatientData(currentPatientData);
    medicationScheduler.scheduleNotificationsForPatient(currentPatientData, t);
    const history = await supabaseService.getChatHistory(currentPatientData.id);

    if (history.length > 0) {
        setChatHistory(history);
    } else {
        const greetingText = await getInitialGreeting(language);
        const initialMessage: ChatMessage = { role: 'model', text: greetingText };
        setChatHistory([initialMessage]);
        await supabaseService.addChatMessage({ patientId: currentPatientData.id, ...initialMessage });
    }
  }, [language, t]);

  // Initial data load from Supabase
  useEffect(() => {
    async function loadInitialData() {
        setIsLoading(true);
        setError(null);
        try {
            const savedId = localStorage.getItem('sentinelle_patient_id');
            if (savedId) {
                const patient = await supabaseService.getPatientById(parseInt(savedId, 10));
                if (patient) {
                    await loadPatientAndHistory(patient);
                } else {
                    console.warn(`Patient with ID ${savedId} not found. Clearing storage.`);
                    localStorage.removeItem('sentinelle_patient_id');
                }
            }
        } catch (err) {
            console.error(err);
             if (err instanceof Error) {
                setError(err.message);
            } else {
                setError(t('errors.loadData'));
            }
        } finally {
            setIsLoading(false);
        }
    }
    loadInitialData();
  }, [loadPatientAndHistory, t]);

  // Effect to listen for real-time changes from Supabase
  useEffect(() => {
    if (!patientData) return;

    const unsubscribe = supabaseService.listenToPatientChanges((updatedPatients) => {
        console.log("Real-time update received!");
        
        const updatedCurrentPatient = updatedPatients.find(p => p.id === patientData.id);
        if (updatedCurrentPatient) {
            setPatientData(updatedCurrentPatient);
        }
    });

    return () => {
      unsubscribe();
    };
  }, [patientData?.id]);


  // Effect to update risk whenever patient data changes
  useEffect(() => {
    if (patientData) {
      updateRisk(patientData);
    }
  }, [patientData, updateRisk]);

  // Effect for handling real-time data from the device service and sending it to Supabase
  useEffect(() => {
    if (!isDeviceConnected || !patientData) return;

    const handleNewReading = async (reading: DeviceReading) => {
        if (reading.data.spo2 != null && reading.data.heartRate != null) {
           await supabaseService.addMeasurement(
              patientData.id,
              Math.round(reading.data.spo2),
              Math.round(reading.data.heartRate)
           );
        }
    };
    
    const unsubscribe = deviceManager.onReading(handleNewReading);

    return () => {
        unsubscribe();
    };
  }, [isDeviceConnected, patientData]);

  const handleConnectDevice = () => {
    setDeviceManagerOpen(false);
    setIsDeviceConnected(true);
    const message: ChatMessage = {
        role: 'model',
        text: t('chatbot.deviceConnected')
    };
    setChatHistory(prev => [...prev, message]);
    if (patientData) {
        supabaseService.addChatMessage({ patientId: patientData.id, ...message })
            .catch(err => console.error("Failed to save connect message:", err));
    }
    if (activeTab !== 'chatbot') {
        setHasUnreadMessages(true);
    }
  };
  
  const handleDisconnectDevice = async () => {
    const connectedDevices = deviceManager.getConnectedDevices();
    if(connectedDevices.length > 0) {
        await deviceManager.disconnectDevice(connectedDevices[0].id);
    }
    setDeviceManagerOpen(false);
    setIsDeviceConnected(false);
     const message: ChatMessage = {
        role: 'model',
        text: t('chatbot.deviceDisconnected')
    };
    setChatHistory(prev => [...prev, message]);
    if (patientData) {
        supabaseService.addChatMessage({ patientId: patientData.id, ...message })
            .catch(err => console.error("Failed to save disconnect message:", err));
    }
    if (activeTab !== 'chatbot') {
        setHasUnreadMessages(true);
    }
  };

 const handleSendMessage = async (message: string, context?: ChatMessage['questionContext']) => {
    if (!patientData) return;
    const userMessage: ChatMessage = { role: 'user', text: message, questionContext: context };
    
    const updatedHistoryForApi = [...chatHistory, userMessage];
    setChatHistory(updatedHistoryForApi);
    supabaseService.addChatMessage({ patientId: patientData.id, ...userMessage})
        .catch(err => console.error("Failed to save user message:", err));

    setIsAiTyping(true);

    if (context?.originalQuestion) {
      const aiResponseText = await analyzeUserResponse(context.originalQuestion, message, patientData, language);
      const aiResponseMessage: ChatMessage = { role: 'model', text: aiResponseText };
      setChatHistory(prev => [...prev, aiResponseMessage]);
      supabaseService.addChatMessage({ patientId: patientData.id, ...aiResponseMessage })
        .catch(err => console.error("Failed to save AI context response:", err));
      if (activeTab !== 'chatbot') {
        setHasUnreadMessages(true);
      }
      setIsAiTyping(false);
      return;
    }

    setChatHistory(prev => [...prev, { role: 'model', text: "" }]);
    
    if (activeTab !== 'chatbot') {
        setHasUnreadMessages(true);
    }

    let fullText = "";
    try {
      const stream = getAIResponseStream(updatedHistoryForApi, patientData, language);
      for await (const chunk of stream) {
        fullText += chunk;
        setChatHistory(prev => {
            const newHistory = [...prev];
            const lastMessage = newHistory[newHistory.length - 1];
            if (lastMessage && lastMessage.role === 'model') {
              lastMessage.text = fullText;
            }
            return newHistory;
        });
      }
      await supabaseService.addChatMessage({ patientId: patientData.id, role: 'model', text: fullText });
    } catch (error) {
      console.error("Error fetching AI response:", error);
      const errorMessageText = t('errors.apiConnection');
      setChatHistory(prev => [...prev.slice(0,-1), { role: 'model', text: errorMessageText }]);
      await supabaseService.addChatMessage({ patientId: patientData.id, role: 'model', text: errorMessageText });
    } finally {
      setIsAiTyping(false);
    }
  };

  const handlePairSuccess = async (pairedPatient: PatientData) => {
    localStorage.setItem('sentinelle_patient_id', String(pairedPatient.id));
    await loadPatientAndHistory(pairedPatient);
  };

  const handleLogout = () => {
    localStorage.removeItem('sentinelle_patient_id');
    setPatientData(null);
    setChatHistory([]);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-slate-500">
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        {t('app.loading')}
      </div>
    );
  }

  if (error) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-red-500 bg-red-50 p-4">
            <h2 className="text-xl font-bold mb-2">{t('errors.connectionTitle')}</h2>
            <p className="text-center">{error}</p>
            <p className="text-center mt-4 text-sm text-slate-600">
                {t('errors.supabaseConfig')}
            </p>
        </div>
    );
  }
  
  const renderPatientTabContent = () => {
    if (!patientData) return null;
    switch (activeTab) {
      case 'vitals':
        return <TrendsChart measurements={patientData.measurements} />;
      case 'smartphone':
        return <SmartphoneData data={patientData.smartphone} isAiFilterActive={isAiFilterActive} />;
      case 'mobility':
        return <MobilityTab />;
      case 'treatment':
        return <TreatmentTab patientData={patientData} onDataChange={() => refreshPatientData(patientData.id)} />;
      case 'chatbot':
        return <Chatbot 
                history={chatHistory} 
                onSendMessage={handleSendMessage}
                isAiTyping={isAiTyping}
                isActive={activeTab === 'chatbot'}
              />;
      default:
        return null;
    }
  };

  const TabButton = ({ id, label, icon, hasNotification, disabled }: { id: string; label: string; icon: React.ReactNode; hasNotification?: boolean; disabled?: boolean; }) => (
    <button
      onClick={() => {
        if (disabled) return;
        setActiveTab(id);
        if (id === 'chatbot') {
            setHasUnreadMessages(false);
        }
      }}
      disabled={disabled}
      className={`relative flex items-center justify-center w-full px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
        activeTab === id && !disabled
          ? 'bg-blue-600 text-white shadow-md'
          : 'bg-white/50 text-slate-700 hover:bg-white'
      } ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-200/50' : ''}`}
      title={disabled ? t('errors.aiUnavailableTooltip') : undefined}
    >
      {icon}
      <span className="ml-2">{label}</span>
      {hasNotification && !disabled && (
        <span className="absolute top-2 right-2 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
        </span>
      )}
    </button>
  );

  const renderPatientDashboard = () => {
      if (!patientData) return <PairingScreen onPairSuccess={handlePairSuccess} />;

      const latestMeasurement = patientData.measurements.length > 0 ? patientData.measurements[patientData.measurements.length - 1] : null;
      const previousMeasurement = patientData.measurements.length > 1 ? patientData.measurements[patientData.measurements.length - 2] : null;

      const spo2Value = latestMeasurement ? `${latestMeasurement.spo2}%` : '--';
      const heartRateValue = latestMeasurement ? `${latestMeasurement.heartRate} bpm` : '--';

      let spo2Trend: 'up' | 'down' | 'stable' = 'stable';
      if (latestMeasurement && previousMeasurement) {
        if (latestMeasurement.spo2 > previousMeasurement.spo2) spo2Trend = 'up';
        else if (latestMeasurement.spo2 < previousMeasurement.spo2) spo2Trend = 'down';
      }

      let heartRateTrend: 'up' | 'down' | 'stable' = 'stable';
      if (latestMeasurement && previousMeasurement) {
        if (latestMeasurement.heartRate < previousMeasurement.heartRate) heartRateTrend = 'up';
        else if (latestMeasurement.heartRate > previousMeasurement.heartRate) heartRateTrend = 'down';
      }

      return (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <RiskScore score={riskScore} level={riskLevel} />
                <VitalsCard
                  title={t('vitals.spo2')}
                  value={spo2Value}
                  trend={spo2Trend}
                  icon={<Stethoscope className="w-8 h-8 text-blue-500" />}
                  isConnected={isDeviceConnected}
                  onConnectClick={() => setDeviceManagerOpen(true)}
                />
                <VitalsCard
                  title={t('vitals.heartRate')}
                  value={heartRateValue}
                  trend={heartRateTrend}
                  icon={<Wind className="w-8 h-8 text-red-500" />}
                  isConnected={isDeviceConnected}
                  onConnectClick={() => setDeviceManagerOpen(true)}
                />
              </div>

              <div className="bg-white/50 backdrop-blur-sm p-4 rounded-2xl shadow-sm">
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 p-1 bg-slate-200/50 rounded-xl mb-4">
                  <TabButton id="vitals" label={t('tabs.trends')} icon={<Stethoscope className="w-5 h-5"/>} />
                  <TabButton id="treatment" label={t('tabs.treatment')} icon={<Pill className="w-5 h-5"/>} />
                  <TabButton id="smartphone" label={t('tabs.smartphone')} icon={<Smartphone className="w-5 h-5"/>} />
                  <TabButton id="mobility" label={t('tabs.mobility')} icon={<Footprints className="w-5 h-5"/>} />
                  <TabButton id="chatbot" label={t('tabs.assistant')} icon={<Bot className="w-5 h-5"/>} hasNotification={hasUnreadMessages} disabled={!isAiAvailable} />
                  <button
                    onClick={() => setIsAiFilterActive(!isAiFilterActive)}
                    className={`flex items-center justify-center w-full px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                        isAiFilterActive
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-white/50 text-slate-700 hover:bg-white'
                    }`}
                    title={t('tabs.aiFilterTooltip')}
                  >
                    <BrainCircuit className="w-5 h-5" />
                    <span className="ml-2 hidden lg:inline">{t('tabs.aiFilter')}</span>
                  </button>
                </div>
                <div className={activeTab === 'chatbot' ? "h-[40rem]" : "h-72"}>
                    {renderPatientTabContent()}
                </div>
              </div>
          </div>
      )
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans flex flex-col">
      <main className="container mx-auto p-4 lg:p-6 flex-grow">
         {!isAiAvailable && (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded-lg mb-6 shadow-sm flex items-start gap-3" role="alert">
                <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                    <p className="font-bold">{t('errors.aiWarningTitle')}</p>
                    <p className="text-sm">{t('errors.aiWarningMessage')}</p>
                </div>
            </div>
        )}
        <div className="flex flex-col gap-6">
          <header className="bg-white/50 backdrop-blur-sm p-6 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-blue-600 p-3 rounded-full text-white">
                  <Wind className="w-8 h-8"/>
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">
                    {t('header.title')}
                  </h1>
                  <p className="text-slate-500">
                    {patientData ? t('header.welcomeBack', { name: patientData.name }) : t('header.promptLogin')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                 <div className="relative">
                    <Globe className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value as 'fr' | 'en' | 'ar')}
                        className="pl-10 pr-4 py-2 text-sm appearance-none bg-slate-200/60 border-none rounded-lg focus:ring-2 focus:ring-blue-500"
                        aria-label={t('header.languageSelectorLabel')}
                    >
                        <option value="fr">Français</option>
                        <option value="en">English</option>
                        <option value="ar">العربية</option>
                    </select>
                 </div>
                 {patientData && (
                    <>
                     <button 
                        onClick={() => setEmergencyModalOpen(true)}
                        className="flex items-center justify-center w-10 h-10 text-sm font-semibold rounded-lg text-white bg-red-600 hover:bg-red-700"
                        title={t('header.sos')}
                     >
                        <Sos className="w-5 h-5" />
                     </button>
                     <button 
                        onClick={() => setProfileModalOpen(true)}
                        className="flex items-center justify-center w-10 h-10 text-sm font-semibold rounded-lg text-slate-600 hover:bg-slate-200/80"
                        title={t('header.profile')}
                     >
                        <User className="w-5 h-5" />
                     </button>
                     <button 
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg text-slate-600 hover:bg-slate-200/80"
                        title={t('header.logout')}
                     >
                        <LogOut className="w-5 h-5" />
                        <span className="hidden sm:inline">{t('header.logout')}</span>
                     </button>
                    </>
                 )}
              </div>
            </div>
          </header>
          
          {renderPatientDashboard()}

        </div>
      </main>
      
      {patientData && (
        <>
            <DeviceManagerModal 
                isOpen={isDeviceManagerOpen}
                onClose={() => setDeviceManagerOpen(false)}
                onConnect={handleConnectDevice}
                onDisconnect={handleDisconnectDevice}
            />
            <ProfileModal
                isOpen={isProfileModalOpen}
                onClose={() => setProfileModalOpen(false)}
                patientData={patientData}
                onUpdate={() => refreshPatientData(patientData.id)}
            />
            <EmergencyModal
                isOpen={isEmergencyModalOpen}
                onClose={() => setEmergencyModalOpen(false)}
                onGoToProfile={() => {
                    setEmergencyModalOpen(false);
                    setProfileModalOpen(true);
                }}
                patientName={patientData.name}
                contactName={patientData.emergency_contact_name}
                contactPhone={patientData.emergency_contact_phone}
            />
        </>
      )}
      <footer className="text-center py-4 text-sm text-slate-500 border-t border-slate-200">
        {t('footer.copyright')}
      </footer>
    </div>
  );
}
