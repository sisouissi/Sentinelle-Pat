
import React from 'react';
import type { PatientData } from '../types';
import { Pill, Clock } from './icons';
import { calculateMedicationAdherence } from '../services/analyticsService';
import { useTranslation } from '../contexts/LanguageContext';

interface MedicationAdherenceCardProps {
    patient: PatientData;
}

export function MedicationAdherenceCard({ patient }: MedicationAdherenceCardProps): React.ReactNode {
    const { t } = useTranslation();
    const adherence = calculateMedicationAdherence(patient);

    const getAdherenceColor = (percent: number) => {
        if (percent < 75) return 'bg-red-500';
        if (percent < 90) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    return (
        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-lg h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <h3 className="text-md font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <Pill className="w-5 h-5 text-blue-600" />
                {t('doctorDashboard.adherenceDetailTitle')}
            </h3>
            
            <div className="my-4">
                <div className="flex justify-between items-baseline mb-1">
                    <span className="text-sm text-slate-600 font-medium">{t('doctorDashboard.adherence7d')}</span>
                    <span className={`text-xl font-bold ${getAdherenceColor(adherence).replace('bg-', 'text-')}`}>
                        {adherence}%
                    </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2.5">
                    <div className={`h-2.5 rounded-full ${getAdherenceColor(adherence)}`} style={{ width: `${adherence}%` }}></div>
                </div>
            </div>

            <div>
                <h4 className="text-sm font-semibold text-slate-600 mb-2">{t('doctorDashboard.currentMedications')}</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                    {patient.medications && patient.medications.length > 0 ? (
                        patient.medications.map(med => (
                            <div key={med.id} className="bg-slate-100/70 p-2 rounded-lg">
                                <p className="text-sm font-medium text-slate-800">{med.name}</p>
                                <p className="text-xs text-slate-500">{med.dosage}</p>
                                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                                    <Clock className="w-3 h-3"/>
                                    <span>{t('doctorDashboard.scheduledTimes')}: {med.schedules.map(s => s.time_of_day).join(', ')}</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-xs text-slate-400 text-center py-4">{t('medicationAdherence.noMedication')}</p>
                    )}
                </div>
            </div>
        </div>
    );
}
