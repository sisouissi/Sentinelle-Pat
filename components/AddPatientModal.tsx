import React, { useState } from 'react';
import type { NewPatient, PatientData } from '../types';
import { User, XCircle, CheckCircle, ClipboardCopy } from './icons';
import { useTranslation } from '../contexts/LanguageContext';

interface AddPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPatient: (patient: NewPatient) => Promise<PatientData | null>;
}

export function AddPatientModal({ isOpen, onClose, onAddPatient }: AddPatientModalProps): React.ReactNode {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [condition, setCondition] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [addedPatient, setAddedPatient] = useState<PatientData | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) {
    return null;
  }

  const resetForm = () => {
    setName('');
    setAge('');
    setCondition('');
    setError('');
    setIsSaving(false);
    setAddedPatient(null);
    setCopied(false);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !age.trim() || !condition.trim()) {
      setError(t('addPatientModal.errorRequired'));
      return;
    }
    setError('');
    setIsSaving(true);
    try {
      const newPatient = await onAddPatient({ name, age: parseInt(age, 10), condition });
      if (newPatient) {
        setAddedPatient(newPatient);
      } else {
        throw new Error(t('addPatientModal.patientCreationFail'));
      }
    } catch (err) {
      setError(t('addPatientModal.errorGeneric'));
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleClose = () => {
    if (isSaving) return;
    resetForm();
    onClose();
  }

  const handleCopyCode = () => {
    if (addedPatient?.code) {
        navigator.clipboard.writeText(addedPatient.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }
  }

  const renderForm = () => (
     <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">{t('addPatientModal.nameLabel')}</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
        </div>
        <div>
            <label htmlFor="age" className="block text-sm font-medium text-slate-700 mb-1">{t('addPatientModal.ageLabel')}</label>
            <input
              type="number"
              id="age"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
        </div>
        <div>
            <label htmlFor="condition" className="block text-sm font-medium text-slate-700 mb-1">{t('addPatientModal.conditionLabel')}</label>
            <input
              type="text"
              id="condition"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              placeholder={t('addPatientModal.conditionPlaceholder')}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
        </div>
          
        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSaving}
              className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 disabled:opacity-50"
            >
              {t('addPatientModal.cancel')}
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-wait"
            >
              {isSaving ? t('addPatientModal.adding') : t('addPatientModal.addAndGetCode')}
            </button>
        </div>
    </form>
  )

  const renderSuccess = () => (
    <div className="mt-6 text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <CheckCircle className="h-6 w-6 text-green-600" />
        </div>
        <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4">{t('addPatientModal.successTitle')}</h3>
        <p className="text-sm text-slate-500 mt-2">{t('addPatientModal.successDescription')}</p>

        <div className="my-6">
            <p className="text-sm font-semibold text-slate-600">{t('addPatientModal.pairingCode')}</p>
            <div className="mt-2 flex items-center justify-center gap-2">
                 <p className="text-3xl font-bold tracking-widest text-blue-600 bg-blue-50 px-4 py-2 rounded-lg border-2 border-dashed border-blue-200">
                    {addedPatient?.code}
                </p>
                <button onClick={handleCopyCode} className="p-3 bg-slate-100 rounded-lg hover:bg-slate-200">
                    <ClipboardCopy className="w-5 h-5 text-slate-600" />
                </button>
            </div>
            {copied && <p className="text-xs text-green-600 mt-2 animate-fade-in">{t('addPatientModal.copied')}</p>}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
             <button
              type="button"
              onClick={resetForm}
              className="w-full px-4 py-2 text-sm font-semibold text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200"
            >
              {t('addPatientModal.addAnother')}
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="w-full px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              {t('addPatientModal.done')}
            </button>
        </div>
    </div>
  )

  return (
    <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
        aria-labelledby="modal-title"
        role="dialog"
        aria-modal="true"
        onClick={handleClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 id="modal-title" className="text-lg font-bold text-slate-800">
                {addedPatient ? t('addPatientModal.titleSuccess', {name: addedPatient.name}) : t('addPatientModal.title') }
              </h2>
              <p className="text-sm text-slate-500">
                  {addedPatient ? t('addPatientModal.subtitleSuccess') : t('addPatientModal.subtitle')}
              </p>
            </div>
          </div>
           <button onClick={handleClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-200">
                <XCircle className="w-6 h-6" />
           </button>
        </div>

        {addedPatient ? renderSuccess() : renderForm()}
        
      </div>
    </div>
  );
}