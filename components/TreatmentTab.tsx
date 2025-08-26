import React, { useState, useMemo, useEffect } from 'react';
import type { PatientData, Medication, MedicationSchedule, MedicationLog } from '../types';
import { Pill, PlusCircle, Bell, CheckCircle, XCircle } from './icons';
import { useTranslation } from '../contexts/LanguageContext';
import { AddMedicationModal } from './AddMedicationModal';
import * as supabaseService from '../services/supabaseService';

interface TreatmentTabProps {
    patientData: PatientData;
    onDataChange: () => void;
}

const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();
};

export function TreatmentTab({ patientData, onDataChange }: TreatmentTabProps): React.ReactNode {
    const { t } = useTranslation();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMed, setEditingMed] = useState<Medication | null>(null);

    const [missedScheduleIds, setMissedScheduleIds] = useState<number[]>(() => {
        if (typeof window === 'undefined') return [];
        const key = `missed_doses_${patientData.id}_${new Date().toISOString().split('T')[0]}`;
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        const key = `missed_doses_${patientData.id}_${new Date().toISOString().split('T')[0]}`;
        localStorage.setItem(key, JSON.stringify(missedScheduleIds));
    }, [missedScheduleIds, patientData.id]);


    const handleAddClick = () => {
        setEditingMed(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (med: Medication) => {
        setEditingMed(med);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setEditingMed(null);
    };

    const { upcomingDoses, actionablePastDoses, loggedDoses, missedDoses } = useMemo(() => {
        const now = new Date();
        const upcoming: { med: Medication, schedule: MedicationSchedule }[] = [];
        const actionable: { med: Medication, schedule: MedicationSchedule }[] = [];
        const logged: { med: Medication, schedule: MedicationSchedule, log: MedicationLog }[] = [];
        const missed: { med: Medication, schedule: MedicationSchedule }[] = [];

        patientData.medications.forEach(med => {
            if (!med.is_active) return;
            med.schedules.forEach(schedule => {
                const [hour, minute] = schedule.time_of_day.split(':').map(Number);
                const doseTime = new Date();
                doseTime.setHours(hour, minute, 0, 0);

                const todaysLog = patientData.medication_logs.find(log => 
                    log.schedule_id === schedule.id && isToday(new Date(log.taken_at))
                );

                if (todaysLog) {
                    logged.push({ med, schedule, log: todaysLog });
                } else {
                     if (doseTime > now) {
                        upcoming.push({ med, schedule });
                    } else {
                        // It's in the past and not logged
                        if (missedScheduleIds.includes(schedule.id)) {
                            missed.push({ med, schedule });
                        } else {
                            actionable.push({ med, schedule });
                        }
                    }
                }
            });
        });

        upcoming.sort((a, b) => a.schedule.time_of_day.localeCompare(b.schedule.time_of_day));
        actionable.sort((a, b) => a.schedule.time_of_day.localeCompare(b.schedule.time_of_day));
        logged.sort((a, b) => new Date(a.log.taken_at).getTime() - new Date(b.log.taken_at).getTime());
        missed.sort((a, b) => a.schedule.time_of_day.localeCompare(b.schedule.time_of_day));
        
        return { upcomingDoses: upcoming, actionablePastDoses: actionable, loggedDoses, missedDoses: missed };
    }, [patientData.medications, patientData.medication_logs, missedScheduleIds]);

    const handleMarkAsTaken = async (scheduleId: number) => {
        try {
            await supabaseService.logMedicationIntake(patientData.id, scheduleId);
            onDataChange();
        } catch (error) {
            console.error("Failed to log medication intake:", error);
            alert(t('treatment.errorMarkingTaken'));
        }
    };

    const handleMarkAsMissed = (scheduleId: number) => {
        setMissedScheduleIds(prev => [...prev, scheduleId]);
    };

    return (
        <div className="flex flex-col h-full p-1 space-y-4">
            <AddMedicationModal 
                isOpen={isModalOpen}
                onClose={handleModalClose}
                patientId={patientData.id}
                onSave={onDataChange}
                medicationToEdit={editingMed}
            />
            <div className="flex items-center justify-between px-2">
                <h3 className="text-lg font-semibold text-slate-800">{t('treatment.title')}</h3>
                <button onClick={handleAddClick} className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                    <PlusCircle className="w-5 h-5" />
                    <span className="hidden sm:inline">{t('treatment.addMedication')}</span>
                </button>
            </div>
            
            <div className="flex-1 overflow-y-auto px-2 space-y-4">
                {/* Today's Schedule */}
                <div>
                    <h4 className="font-semibold text-slate-700 mb-2">{t('treatment.todaysSchedule')}</h4>
                    <div className="space-y-2">
                        {actionablePastDoses.map(({ med, schedule }) => (
                            <div key={schedule.id} className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded-lg flex items-center justify-between animate-fade-in">
                                <div>
                                    <p className="font-semibold text-yellow-800">{med.name}</p>
                                    <p className="text-sm text-yellow-600">{med.dosage} - {schedule.time_of_day}</p>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <button onClick={() => handleMarkAsTaken(schedule.id)} className="px-3 py-1.5 text-xs font-semibold text-white bg-green-500 rounded-lg hover:bg-green-600">
                                        {t('treatment.markAsTaken')}
                                    </button>
                                    <button onClick={() => handleMarkAsMissed(schedule.id)} className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-200 rounded-lg hover:bg-slate-300">
                                        {t('treatment.markAsMissed')}
                                    </button>
                                </div>
                            </div>
                        ))}
                        {upcomingDoses.map(({ med, schedule }) => (
                            <div key={schedule.id} className="bg-blue-50 p-3 rounded-lg flex items-center justify-between">
                                <div>
                                    <p className="font-semibold text-blue-800">{med.name}</p>
                                    <p className="text-sm text-blue-600">{med.dosage} - {schedule.time_of_day}</p>
                                </div>
                                <button onClick={() => handleMarkAsTaken(schedule.id)} className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-600">
                                    {t('treatment.markAsTaken')}
                                </button>
                            </div>
                        ))}
                        {loggedDoses.map(({ med, schedule, log }) => (
                             <div key={schedule.id} className="bg-green-50 p-3 rounded-lg flex items-center justify-between opacity-70">
                                <div>
                                    <p className="font-semibold text-green-800 line-through">{med.name}</p>
                                    <p className="text-sm text-green-600">{med.dosage} - {schedule.time_of_day}</p>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-green-700 font-semibold">
                                    <CheckCircle className="w-5 h-5"/>
                                    <span>{t('treatment.taken')} à {new Date(log.taken_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                            </div>
                        ))}
                         {missedDoses.map(({ med, schedule }) => (
                             <div key={schedule.id} className="bg-red-50 p-3 rounded-lg flex items-center justify-between opacity-70 animate-fade-in">
                                <div>
                                    <p className="font-semibold text-red-800 line-through">{med.name}</p>
                                    <p className="text-sm text-red-600">{med.dosage} - {schedule.time_of_day}</p>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-red-700 font-semibold">
                                    <XCircle className="w-5 h-5"/>
                                    <span>{t('treatment.missed')}</span>
                                </div>
                            </div>
                        ))}
                        {patientData.medications.length > 0 && upcomingDoses.length === 0 && actionablePastDoses.length === 0 && (
                            <div className="text-center py-4 text-sm text-slate-500">
                                <p>{t('treatment.noTasksToday')}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* All Medications */}
                <div>
                    <h4 className="font-semibold text-slate-700 mb-2">{t('treatment.myMedications')}</h4>
                     {patientData.medications.length === 0 ? (
                        <div className="text-center py-8 text-slate-500 bg-slate-100 rounded-lg">
                            <Pill className="w-10 h-10 mx-auto mb-2 opacity-50" />
                            <p className="font-semibold">{t('treatment.noMedications')}</p>
                            <p className="text-sm">{t('treatment.noMedicationsDescription')}</p>
                        </div>
                     ) : (
                        <div className="space-y-2">
                            {patientData.medications.map(med => (
                                <div key={med.id} onClick={() => handleEditClick(med)} className="bg-slate-100 p-3 rounded-lg cursor-pointer hover:bg-slate-200">
                                    <p className="font-semibold text-slate-800">{med.name}</p>
                                    <p className="text-sm text-slate-600">{med.dosage}</p>
                                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                        <Bell className="w-3 h-3"/>
                                        <span>{med.schedules.map(s => s.time_of_day).join(', ')}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                     )}
                </div>
            </div>
        </div>
    );
}