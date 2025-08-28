import React, { useState, useEffect, useCallback } from 'react';
import type { PatientData, ChatMessage, RiskLevel, Measurement, DeviceReading, SpeechAnalysis, SmokingLog } from './types';
import { calculateRiskScore } from './services/analyticsService';
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
import { SpeechAnalysisTab } from './components/SpeechAnalysisTab';
import { SmokingCessationTab } from './components/SmokingCessationTab';
import { TreatmentTab } from './components/TreatmentTab';
import { PairingScreen } from './components/PairingScreen';
import { ProfileModal } from './components/ProfileModal';
import { EmergencyModal } from './components/EmergencyModal';
import { Footer } from './components/Footer';
import { Wind, Smartphone, Stethoscope, Pill, Footprints, LogOut, Bot, BrainCircuit, Globe, User, Sos, AlertTriangle, Mic, Flame } from './components/icons';
import { useTranslation } from './contexts/LanguageContext';
import { allPatients } from './services/mockDataService';


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
        // No need to save to DB in demo mode
        if (activeTab !== 'chatbot') {
            setHasUnreadMessages(true);
        }
    }
    setIsAiTyping(false);
  }, [activeTab, language]);

  const updateRisk = useCallback((data: PatientData) => {
    const { score, level: newLevel } = calculateRiskScore(data);
    
    // An escalation occurs when the new risk level is higher than the current one.
    const isEscalation =
        (riskLevel === 'Low' && (newLevel === 'Medium' || newLevel === 'High')) ||
        (riskLevel === 'Medium' && newLevel === 'High');

    if (isEscalation) {
        // If risk escalates, trigger the AI and update the risk level state.
        // This sets a new, higher baseline, preventing re-triggers if the data flickers
        // back down and then up to the same level, which solves the rate-limiting issue.
        triggerProactiveAI(data, newLevel);
        setRiskLevel(newLevel);
    } else if (newLevel !== riskLevel) {
        // If the level changes but it's not an escalation (i.e., it's a de-escalation),
        // just update the displayed risk level without triggering the AI. This keeps the UI accurate.
        setRiskLevel(newLevel);
    }
    
    // Always update the score for display, regardless of level changes.
    setRiskScore(score);
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
        console.log("Attempting to update environmental data from OpenWeatherMap...");
        const updatedSmartphoneData = await supabaseService.updatePatientEnvironmentData(currentPatientData.id);
        if (updatedSmartphoneData) {
            // Merge the new data into our patient object
            currentPatientData = {
                ...currentPatientData,
                smartphone: updatedSmartphoneData
            };
            console.log("Environmental data successfully merged into patient state.");
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

  // Effect to update risk whenever patient data changes
  useEffect(() => {
    if (patientData) {
      updateRisk(patientData);
    }
  }, [patientData, updateRisk]);

  // Effect for handling real-time data from the device service and sending it to Supabase
  useEffect(() => {
    if (!isDeviceConnected || !patientData) return;

    const handleNewReading = (reading: DeviceReading) => {
        if (reading.data.spo2 != null && reading.data.heartRate != null) {
           setPatientData(prevData => {
                if (!prevData) return null;
                const newMeasurement = {
                    timestamp: new Date(reading.timestamp),
                    spo2: Math.round(reading.data.spo2!),
                    heartRate: Math.round(reading.data.heartRate!),
                };
                
                const newMeasurements = [...prevData.measurements, newMeasurement];
                if (newMeasurements.length > 60) {
                    newMeasurements.shift(); // Remove the oldest measurement
                }

                const updatedPatientData = { ...prevData, measurements: newMeasurements };

                // Update the mock data source as well, so changes persist during the session
                const mockPatientIndex = allPatients.findIndex(p => p.id === updatedPatientData.id);
                if (mockPatientIndex !== -1) {
                    allPatients[mockPatientIndex].measurements = newMeasurements;
                }

                return updatedPatientData;
            });
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
    if (activeTab !== 'chatbot') {
        setHasUnreadMessages(true);
    }
  };

 const handleSendMessage = async (message: string, context?: ChatMessage['questionContext']) => {
    if (!patientData) return;
    const userMessage: ChatMessage = { role: 'user', text: message, questionContext: context };
    
    const updatedHistoryForApi = [...chatHistory, userMessage];
    setChatHistory(updatedHistoryForApi);

    setIsAiTyping(true);

    if (context?.originalQuestion) {
      const aiResponseText = await analyzeUserResponse(context.originalQuestion, message, patientData, language);
      const aiResponseMessage: ChatMessage = { role: 'model', text: aiResponseText };
      setChatHistory(prev => [...prev, aiResponseMessage]);
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
    } catch (error) {
      console.error("Error fetching AI response:", error);
      const errorMessageText = t('errors.apiConnection');
      setChatHistory(prev => [...prev.slice(0,-1), { role: 'model', text: errorMessageText }]);
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

    const handleNewSpeechAnalysis = useCallback(() => {
        setTimeout(() => {
            setPatientData(prevData => {
                if (!prevData || !prevData.speechAnalysisHistory) return prevData;

                const newAnalysis: SpeechAnalysis = {
                    timestamp: new Date(),
                    speechRate: 140 + (Math.random() - 0.6) * 25,
                    pauseFrequency: 4 + (Math.random() - 0.4) * 2.5,
                    articulationScore: 90 + (Math.random() - 0.6) * 15,
                };
                const updatedHistory = [...prevData.speechAnalysisHistory, newAnalysis];
                if (updatedHistory.length > 7) updatedHistory.shift();
                
                const updatedPatientData = { ...prevData, speechAnalysisHistory: updatedHistory };
                
                const mockPatientIndex = allPatients.findIndex(p => p.id === updatedPatientData.id);
                if (mockPatientIndex !== -1) {
                    allPatients[mockPatientIndex].speechAnalysisHistory = updatedHistory;
                }
                
                return updatedPatientData;
            });
        }, 3000);
    }, []);

    const handleLogSmokingEvent = useCallback((log: Omit<SmokingLog, 'timestamp'>) => {
        setPatientData(prevData => {
            if (!prevData || !prevData.smokingCessation) return prevData;

            const newLog = { ...log, timestamp: new Date() };
            const updatedLogs = [...prevData.smokingCessation.logs, newLog];
            
            let newConsecutiveDays = prevData.smokingCessation.consecutiveSmokeFreeDays;
            if (newLog.type === 'smoked') {
                newConsecutiveDays = 0;
            }

            const updatedSmokingData = {
                ...prevData.smokingCessation,
                logs: updatedLogs,
                consecutiveSmokeFreeDays: newConsecutiveDays,
            };

            const updatedPatientData = { ...prevData, smokingCessation: updatedSmokingData };
            
            const mockPatientIndex = allPatients.findIndex(p => p.id === updatedPatientData.id);
            if (mockPatientIndex !== -1) {
                allPatients[mockPatientIndex].smokingCessation = updatedSmokingData;
            }

            return updatedPatientData;
        });
    }, []);


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
        </div>
    );
  }
  
  const renderPatientTabContent = () => {
    if (!patientData) return null;

    switch (activeTab) {
      case 'vitals':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 animate-fade-in">
            <VitalsCard
              title={t('vitals.spo2')}
              value={`${patientData.measurements.length > 0 ? patientData.measurements[patientData.measurements.length - 1].spo2 : '--'}%`}
              trend="stable"
              icon={<Wind className="w-6 h-6 text-blue-500" />}
              isConnected={isDeviceConnected}
              onConnectClick={() => setDeviceManagerOpen(true)}
              style={{ animationDelay: '100ms' }}
            />
            <VitalsCard
              title={t('vitals.heartRate')}
              value={`${patientData.measurements.length > 0 ? patientData.measurements[patientData.measurements.length - 1].heartRate : '--'} bpm`}
              trend="stable"
              icon={<Stethoscope className="w-6 h-6 text-red-500" />}
              isConnected={isDeviceConnected}
              onConnectClick={() => setDeviceManagerOpen(true)}
               style={{ animationDelay: '200ms' }}
            />
            <RiskScore score={riskScore} level={riskLevel} style={{ animationDelay: '300ms' }} />
            <div className="md:col-span-3 bg-white/70 backdrop-blur-md p-4 rounded-2xl shadow-lg h-72 animate-fade-in" style={{ animationDelay: '400ms' }}>
                <TrendsChart measurements={patientData.measurements} />
            </div>
          </div>
        );
      case 'smartphone':
        return <SmartphoneData data={patientData.smartphone} isAiFilterActive={isAiFilterActive} />;
      case 'mobility':
          return <MobilityTab />;
      case 'elocution':
          return <SpeechAnalysisTab speechAnalysisHistory={patientData.speechAnalysisHistory || []} onNewAnalysis={handleNewSpeechAnalysis} />;
      case 'smokingCessation':
          return <SmokingCessationTab smokingData={patientData.smokingCessation} onLogEvent={handleLogSmokingEvent} />;
      case 'treatment':
          return <TreatmentTab patientData={patientData} onDataChange={() => refreshPatientData(patientData.id)} />;
      case 'chatbot':
        return <Chatbot history={chatHistory} onSendMessage={handleSendMessage} isAiTyping={isAiTyping} isActive={activeTab === 'chatbot'} />;
      default:
        return null;
    }
  };
  
  return (
     <div className="flex flex-col min-h-screen">
        <div className={`flex-grow ${!patientData ? 'flex items-center justify-center p-4' : ''}`}>
          {patientData ? (
            <div className="max-w-7xl mx-auto p-2 sm:p-4 lg:p-6 text-slate-800 dark:text-slate-200 w-full">
                <ProfileModal isOpen={isProfileModalOpen} onClose={() => setProfileModalOpen(false)} patientData={patientData} onUpdate={() => refreshPatientData(patientData.id)} />
                <EmergencyModal 
                    isOpen={isEmergencyModalOpen} 
                    onClose={() => setEmergencyModalOpen(false)}
                    patientName={patientData.name}
                    contactName={patientData.emergency_contact_name}
                    contactPhone={patientData.emergency_contact_phone}
                    onGoToProfile={() => {
                        setEmergencyModalOpen(false);
                        setProfileModalOpen(true);
                    }}
                />
                <DeviceManagerModal 
                    isOpen={isDeviceManagerOpen} 
                    onClose={() => setDeviceManagerOpen(false)}
                    onConnect={handleConnectDevice}
                    onDisconnect={handleDisconnectDevice}
                />
                <header className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
                    <div className="flex items-center">
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-full mr-4 shadow-lg">
                            <Wind className="w-6 h-6 text-white"/>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-800">{t('header.title')}</h1>
                            <p className="text-sm text-slate-500">{t('header.welcomeBack', { name: patientData.name })}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                         <button onClick={() => setEmergencyModalOpen(true)} className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-red-600 bg-red-100 rounded-lg hover:bg-red-200 transition-all duration-200 hover:scale-105 active:scale-95">
                            <Sos className="w-5 h-5" />
                            <span className="hidden sm:inline">{t('header.sos')}</span>
                        </button>
                         <button onClick={() => setProfileModalOpen(true)} className="p-2.5 rounded-lg hover:bg-slate-200 transition-colors">
                            <User className="w-5 h-5 text-slate-600" />
                        </button>
                        <div className="relative">
                            <select 
                                value={language} 
                                onChange={(e) => setLanguage(e.target.value as 'fr' | 'en' | 'ar')}
                                className="appearance-none bg-transparent py-2.5 pl-9 pr-3 text-slate-600 hover:bg-slate-200 rounded-lg text-sm font-semibold transition-colors"
                                aria-label={t('header.languageSelectorLabel')}
                            >
                                <option value="fr">FR</option>
                                <option value="en">EN</option>
                                <option value="ar">AR</option>
                            </select>
                             <Globe className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                        <button onClick={handleLogout} className="p-2.5 rounded-lg hover:bg-slate-200 transition-colors">
                            <LogOut className="w-5 h-5 text-slate-600" />
                        </button>
                    </div>
                </header>

                <main className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                    <div className="xl:col-span-1">
                        <div className="bg-white/60 backdrop-blur-md p-2 rounded-2xl shadow-lg flex flex-col gap-1 sticky top-5">
                            <button onClick={() => setActiveTab('vitals')} className={`flex items-center gap-3 p-3 rounded-lg w-full text-left transition-all duration-200 ease-in-out ${activeTab === 'vitals' ? 'bg-white shadow-md scale-105' : 'hover:bg-white/70 hover:scale-105'}`}>
                                <Stethoscope className="w-5 h-5 text-blue-600"/>
                                <span className="font-semibold text-slate-700">{t('tabs.trends')}</span>
                            </button>
                            <button onClick={() => setActiveTab('smartphone')} className={`flex items-center gap-3 p-3 rounded-lg w-full text-left transition-all duration-200 ease-in-out ${activeTab === 'smartphone' ? 'bg-white shadow-md scale-105' : 'hover:bg-white/70 hover:scale-105'}`}>
                                <Smartphone className="w-5 h-5 text-green-600"/>
                                <span className="font-semibold text-slate-700">{t('tabs.smartphone')}</span>
                                <div className="ml-auto flex items-center gap-2">
                                     <span className="text-xs text-slate-500">{t('tabs.aiFilter')}</span>
                                     <button
                                         onClick={(e) => {
                                             e.stopPropagation();
                                             setIsAiFilterActive(!isAiFilterActive);
                                         }}
                                         title={t('tabs.aiFilterTooltip')}
                                         className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${isAiFilterActive ? 'bg-blue-600' : 'bg-slate-300'}`}
                                     >
                                         <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isAiFilterActive ? 'translate-x-4' : 'translate-x-0'}`} />
                                    </button>
                                </div>
                            </button>
                            <button onClick={() => setActiveTab('mobility')} className={`flex items-center gap-3 p-3 rounded-lg w-full text-left transition-all duration-200 ease-in-out ${activeTab === 'mobility' ? 'bg-white shadow-md scale-105' : 'hover:bg-white/70 hover:scale-105'}`}>
                                <Footprints className="w-5 h-5 text-purple-600"/>
                                <span className="font-semibold text-slate-700">{t('tabs.mobility')}</span>
                            </button>
                             <button onClick={() => setActiveTab('elocution')} className={`flex items-center gap-3 p-3 rounded-lg w-full text-left transition-all duration-200 ease-in-out ${activeTab === 'elocution' ? 'bg-white shadow-md scale-105' : 'hover:bg-white/70 hover:scale-105'}`}>
                                <Mic className="w-5 h-5 text-teal-600"/>
                                <span className="font-semibold text-slate-700">{t('tabs.elocution')}</span>
                            </button>
                            <button onClick={() => setActiveTab('smokingCessation')} className={`flex items-center gap-3 p-3 rounded-lg w-full text-left transition-all duration-200 ease-in-out ${activeTab === 'smokingCessation' ? 'bg-white shadow-md scale-105' : 'hover:bg-white/70 hover:scale-105'}`}>
                                <Flame className="w-5 h-5 text-indigo-600"/>
                                <span className="font-semibold text-slate-700">{t('tabs.smokingCessation')}</span>
                            </button>
                            <button onClick={() => setActiveTab('treatment')} className={`flex items-center gap-3 p-3 rounded-lg w-full text-left transition-all duration-200 ease-in-out ${activeTab === 'treatment' ? 'bg-white shadow-md scale-105' : 'hover:bg-white/70 hover:scale-105'}`}>
                                <Pill className="w-5 h-5 text-orange-600"/>
                                <span className="font-semibold text-slate-700">{t('tabs.treatment')}</span>
                            </button>
                             <button onClick={() => { setActiveTab('chatbot'); setHasUnreadMessages(false); }} className={`relative flex items-center gap-3 p-3 rounded-lg w-full text-left transition-all duration-200 ease-in-out ${activeTab === 'chatbot' ? 'bg-white shadow-md scale-105' : 'hover:bg-white/70 hover:scale-105'}`}>
                                {isAiAvailable ? <Bot className="w-5 h-5 text-cyan-600"/> : <BrainCircuit className="w-5 h-5 text-slate-400"/>}
                                <span className={`font-semibold ${isAiAvailable ? 'text-slate-700' : 'text-slate-400'}`}>{t('tabs.assistant')}</span>
                                 {hasUnreadMessages && (
                                    <span className="absolute top-2 right-2 flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                    </span>
                                )}
                                {!isAiAvailable && <div className="absolute inset-0 cursor-not-allowed" title={t('errors.aiUnavailableTooltip')}></div>}
                            </button>
                        </div>
                    </div>

                    <div className="xl:col-span-2 bg-white/60 backdrop-blur-md p-1 rounded-3xl shadow-lg h-[calc(100vh-10rem)] min-h-[40rem]">
                        {renderPatientTabContent()}
                    </div>
                </main>
            </div>
          ) : (
            <div className="w-full max-w-md mx-auto">
              <PairingScreen onPairSuccess={handlePairSuccess} />
            </div>
          )}
        </div>
        <Footer />
    </div>
  );
}