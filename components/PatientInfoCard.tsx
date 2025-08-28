
import React from 'react';
import type { PatientData } from '../types';
import { User, Phone } from './icons';
import { useTranslation } from '../contexts/LanguageContext';

interface PatientInfoCardProps {
    patient: PatientData;
}

export function PatientInfoCard({ patient }: PatientInfoCardProps): React.ReactNode {
    const { t } = useTranslation();
    return (
        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <h3 className="text-md font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                {t('doctorDashboard.patientInfo')}
            </h3>
            <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                    <span className="text-slate-500">{t('patientInfo.name')}</span>
                    <span className="font-semibold text-slate-800">{patient.name}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-500">{t('patientInfo.age')}</span>
                    <span className="font-semibold text-slate-800">{patient.age} ans</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-500">{t('patientInfo.condition')}</span>
                    <span className="font-semibold text-slate-800">{patient.condition}</span>
                </div>
                 <div className="flex justify-between">
                    <span className="text-slate-500">{t('patientInfo.pairingCode')}</span>
                    <span className="font-mono text-sm bg-slate-100 px-2 py-0.5 rounded text-slate-600">{patient.code}</span>
                </div>

                <div className="pt-2 border-t border-slate-200/80 mt-2">
                     <h4 className="text-sm font-semibold text-slate-600 mb-1 flex items-center gap-2">
                        <Phone className="w-4 h-4" /> {t('doctorDashboard.emergencyContact')}
                     </h4>
                     {patient.emergency_contact_name && patient.emergency_contact_phone ? (
                        <div className="text-slate-700">
                            <p>{patient.emergency_contact_name}</p>
                            <p className="text-xs text-slate-500">{patient.emergency_contact_phone}</p>
                        </div>
                     ) : (
                        <p className="text-xs text-slate-400">{t('patientInfo.notConfigured')}</p>
                     )}
                </div>
            </div>
        </div>
    );
}
