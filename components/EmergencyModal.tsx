import React from 'react';
import { useTranslation } from '../contexts/LanguageContext';
import { Sos, XCircle, Phone, MessageSquareText, AlertTriangle } from './icons';

interface EmergencyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onGoToProfile: () => void;
    patientName?: string;
    contactName?: string;
    contactPhone?: string;
}

export function EmergencyModal({ isOpen, onClose, onGoToProfile, patientName, contactName, contactPhone }: EmergencyModalProps) {
    const { t, language } = useTranslation();

    if (!isOpen) return null;

    const handleCall = () => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(t('emergency.callInitiated', { contactName: contactName || '' }));
             if (language === 'fr') utterance.lang = 'fr-FR';
             else if (language === 'ar') utterance.lang = 'ar-SA';
             else utterance.lang = 'en-US';
            window.speechSynthesis.speak(utterance);
        }
        window.location.href = `tel:${contactPhone}`;
        onClose();
    };

    const handleSms = () => {
        const messageBody = t('emergency.smsBody', {
            contactName: contactName || '',
            patientName: patientName || ''
        });
        window.location.href = `sms:${contactPhone}?body=${encodeURIComponent(messageBody)}`;
        onClose();
    };

    const hasContact = contactName && contactPhone;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 text-center" onClick={e => e.stopPropagation()}>
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                    <Sos className="h-8 w-8 text-red-600" />
                </div>
                
                {hasContact ? (
                    <>
                        <h2 className="text-xl font-bold text-slate-800">{t('emergency.title')}</h2>
                        <p className="text-slate-600 mt-2">{t('emergency.confirmMessage')}</p>
                        <p className="text-xl font-semibold text-blue-600 my-3">{contactName}</p>
                        <div className="flex flex-col gap-3 mt-6">
                            <button onClick={handleCall} className="w-full flex items-center justify-center gap-3 px-4 py-3 text-lg font-bold text-white bg-red-600 rounded-lg hover:bg-red-700">
                                <Phone className="w-6 h-6" />
                                {t('emergency.callButton')}
                            </button>
                             <button onClick={handleSms} className="w-full flex items-center justify-center gap-3 px-4 py-2 font-semibold text-slate-700 bg-slate-200 rounded-lg hover:bg-slate-300">
                                <MessageSquareText className="w-5 h-5" />
                                {t('emergency.smsButton')}
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                         <h2 className="text-xl font-bold text-slate-800">{t('emergency.noContactTitle')}</h2>
                         <p className="text-slate-600 mt-2">{t('emergency.noContactDescription')}</p>
                         <div className="mt-6">
                             <button onClick={onGoToProfile} className="w-full px-4 py-3 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                                {t('emergency.configureButton')}
                            </button>
                         </div>
                    </>
                )}

                <button onClick={onClose} className="mt-4 text-sm font-semibold text-slate-500 hover:text-slate-700">
                    {t('emergency.cancelButton')}
                </button>
            </div>
        </div>
    );
}