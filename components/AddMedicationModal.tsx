
import React, { useState, useEffect } from 'react';
import type { Medication } from '../types';
import * as supabaseService from '../services/supabaseService';
import { useTranslation } from '../contexts/LanguageContext';
import { Pill, XCircle, Trash2, Clock } from './icons';

interface AddMedicationModalProps {
    isOpen: boolean;
    onClose: () => void;
    patientId: number;
    onSave: () => void;
    medicationToEdit: Medication | null;
}

const FREQUENCY_OPTIONS = [1, 2, 3, 4];

export function AddMedicationModal({ isOpen, onClose, patientId, onSave, medicationToEdit }: AddMedicationModalProps) {
    const { t } = useTranslation();
    const [name, setName] = useState('');
    const [dosage, setDosage] = useState('');
    const [frequency, setFrequency] = useState(1);
    const [times, setTimes] = useState(['08:00']);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (medicationToEdit) {
            setName(medicationToEdit.name);
            setDosage(medicationToEdit.dosage);
            setFrequency(medicationToEdit.schedules.length);
            setTimes(medicationToEdit.schedules.map(s => s.time_of_day).sort());
        } else {
            // Reset to default for new medication
            setName('');
            setDosage('');
            setFrequency(1);
            setTimes(['08:00']);
        }
    }, [medicationToEdit, isOpen]);
    
    useEffect(() => {
        const newTimes = Array.from({ length: frequency }, (_, i) => times[i] || '08:00');
        if(newTimes.length > times.length) {
            // Set default times when adding new slots
            if(frequency === 2) newTimes[1] = '20:00';
            if(frequency === 3) {newTimes[1] = '14:00'; newTimes[2] = '20:00';}
            if(frequency === 4) {newTimes[1] = '12:00'; newTimes[2] = '18:00'; newTimes[3] = '22:00';}
        }
        setTimes(newTimes);
    }, [frequency]);

    const handleTimeChange = (index: number, value: string) => {
        const newTimes = [...times];
        newTimes[index] = value;
        setTimes(newTimes);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !dosage.trim() || times.some(t => !t)) {
            setError(t('treatment.addModal.error'));
            return;
        }
        setError('');
        setIsSaving(true);
        try {
            if (medicationToEdit) {
                // TODO: Implement update logic if needed
                console.warn("Update not implemented, deleting and re-adding for now.");
                await supabaseService.deleteMedication(medicationToEdit.id);
            }
            await supabaseService.addMedication(patientId, { name, dosage, times });
            onSave();
            onClose();
        } catch (err) {
            console.error(err);
            setError(t('treatment.addModal.errorGeneric'));
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleDelete = async () => {
        if (!medicationToEdit || !window.confirm(t('treatment.addModal.confirmDelete', { name: medicationToEdit.name }))) {
            return;
        }
        setIsDeleting(true);
        try {
            await supabaseService.deleteMedication(medicationToEdit.id);
            onSave();
            onClose();
        } catch (err) {
            console.error(err);
            setError(t('treatment.addModal.errorDelete'));
        } finally {
            setIsDeleting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-full"><Pill className="w-6 h-6 text-blue-600" /></div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-800">{medicationToEdit ? t('treatment.addModal.editTitle') : t('treatment.addModal.title')}</h2>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-200"><XCircle className="w-6 h-6" /></button>
                </div>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">{t('treatment.addModal.nameLabel')}</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">{t('treatment.addModal.dosageLabel')}</label>
                        <input type="text" value={dosage} onChange={e => setDosage(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">{t('treatment.addModal.frequencyLabel')}</label>
                        <select value={frequency} onChange={e => setFrequency(Number(e.target.value))} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 appearance-none bg-white">
                            <option value={1}>{t('treatment.addModal.everyDay')}</option>
                            <option value={2}>{t('treatment.addModal.twiceADay')}</option>
                            <option value={3}>{t('treatment.addModal.threeTimesADay')}</option>
                            <option value={4}>{t('treatment.addModal.fourTimesADay')}</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">{t('treatment.addModal.timesLabel')}</label>
                        <div className="grid grid-cols-2 gap-2">
                            {times.map((time, index) => (
                                <div key={index} className="relative">
                                     <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                     <input type="time" value={time} onChange={e => handleTimeChange(index, e.target.value)} className="w-full pl-9 pr-2 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" required />
                                </div>
                            ))}
                        </div>
                    </div>
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    <div className="flex justify-between items-center pt-4">
                        <div>
                        {medicationToEdit && (
                            <button type="button" onClick={handleDelete} disabled={isDeleting} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 bg-red-100 rounded-lg hover:bg-red-200 disabled:opacity-50">
                                <Trash2 className="w-4 h-4"/> {isDeleting ? t('treatment.addModal.deleting') : t('treatment.addModal.delete')}
                            </button>
                        )}
                        </div>
                        <div className="flex gap-3">
                            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200">{t('addPatientModal.cancel')}</button>
                            <button type="submit" disabled={isSaving} className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg hover:shadow-md disabled:opacity-75 transition-all transform hover:scale-105 active:scale-95">
                                {isSaving ? t('treatment.addModal.saving') : t('treatment.addModal.save')}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
