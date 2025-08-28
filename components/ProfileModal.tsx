
import React, { useState, useEffect } from 'react';
import type { PatientData } from '../types';
import * as supabaseService from '../services/supabaseService';
import { useTranslation } from '../contexts/LanguageContext';
import { User, XCircle, Phone } from './icons';

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    patientData: PatientData;
    onUpdate: () => void;
}

export function ProfileModal({ isOpen, onClose, patientData, onUpdate }: ProfileModalProps) {
    const { t } = useTranslation();
    const [name, setName] = useState(patientData.emergency_contact_name || '');
    const [phone, setPhone] = useState(patientData.emergency_contact_phone || '');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (isOpen) {
            setName(patientData.emergency_contact_name || '');
            setPhone(patientData.emergency_contact_phone || '');
            setError('');
            setSuccess('');
        }
    }, [isOpen, patientData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError('');
        setSuccess('');
        try {
            await supabaseService.updatePatientEmergencyContact(patientData.id, name.trim(), phone.trim());
            setSuccess(t('profile.success'));
            onUpdate(); // Refresh data in App.tsx
            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (err) {
            console.error(err);
            setError(t('profile.errorSave'));
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-full"><User className="w-6 h-6 text-blue-600" /></div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-800">{t('profile.title')}</h2>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-200"><XCircle className="w-6 h-6" /></button>
                </div>

                <div className="mt-6 space-y-4">
                    <div className="bg-slate-50 p-3 rounded-lg">
                        <h3 className="text-sm font-semibold text-slate-600">{t('profile.patientInfo')}</h3>
                        <p className="text-slate-800">{patientData.name}, {patientData.age} ans</p>
                        <p className="text-sm text-slate-500">{patientData.condition}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <h3 className="text-sm font-semibold text-slate-600">{t('profile.emergencyContact')}</h3>
                            <p className="text-xs text-slate-500">{t('profile.emergencyContactDescription')}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">{t('profile.nameLabel')}</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">{t('profile.phoneLabel')}</label>
                            <div className="relative">
                                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                            </div>
                        </div>
                         {error && <p className="text-sm text-red-600">{error}</p>}
                         {success && <p className="text-sm text-green-600">{success}</p>}
                        <div className="flex justify-end pt-2">
                            <button type="submit" disabled={isSaving} className="px-5 py-2 text-sm font-semibold text-white bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg hover:shadow-md disabled:opacity-75 transition-all transform hover:scale-105 active:scale-95">
                                {isSaving ? t('profile.saving') : t('profile.save')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
