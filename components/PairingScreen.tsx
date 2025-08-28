import React, { useState } from 'react';
import { getPatientByPairingCode } from '../services/supabaseService';
import type { PatientData } from '../types';
import { Wind, Key, AlertTriangle, Globe } from './icons';
import { useTranslation } from '../contexts/LanguageContext';

interface PairingScreenProps {
  onPairSuccess: (patient: PatientData) => void;
}

export function PairingScreen({ onPairSuccess }: PairingScreenProps): React.ReactNode {
  const { t, language, setLanguage } = useTranslation();
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError(t('pairing.errors.codeRequired'));
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const patient = await getPatientByPairingCode(code.trim());
      if (patient) {
        onPairSuccess(patient);
      } else {
        setError(t('pairing.errors.invalidCode'));
      }
    } catch (err) {
      console.error("Pairing failed:", err);
      if (err instanceof Error) {
        setError(`${t('pairing.errors.genericError')}: ${err.message}.`);
      } else {
        setError(t('pairing.errors.connectionError'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center bg-white/70 backdrop-blur-md p-6 sm:p-8 rounded-3xl shadow-2xl animate-fade-in">
        <div className="absolute top-4 right-4">
            <div className="relative">
                <select 
                    value={language} 
                    onChange={(e) => setLanguage(e.target.value as 'fr' | 'en' | 'ar')}
                    className="appearance-none bg-transparent py-2 pl-9 pr-3 text-slate-600 hover:bg-slate-200/50 rounded-lg text-sm font-semibold transition-colors"
                    aria-label={t('header.languageSelectorLabel')}
                >
                    <option value="fr">FR</option>
                    <option value="en">EN</option>
                    <option value="ar">AR</option>
                </select>
                 <Globe className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
        </div>

        <div className="text-center">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 inline-block p-4 rounded-full text-white mb-4 shadow-lg">
              <Wind className="w-10 h-10"/>
            </div>
            <h2 className="text-2xl font-bold text-slate-800">{t('pairing.title')}</h2>
            <p className="mt-2 text-slate-600">{t('pairing.description')}</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 w-full max-w-sm">
            <div>
                <label htmlFor="pairing-code" className="block text-sm font-medium text-slate-700">
                    {t('pairing.codeLabel')}
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Key className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        name="pairing-code"
                        id="pairing-code"
                        className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-lg border-gray-300 rounded-md py-3 uppercase"
                        placeholder="ABC-123"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        autoCapitalize="characters"
                        disabled={isLoading}
                    />
                </div>
            </div>

            {error && (
                <div className="mt-4 flex items-start text-sm text-red-600 bg-red-50 p-3 rounded-md">
                    <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            <div className="mt-6">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-bold text-white bg-gradient-to-br from-blue-500 to-blue-600 hover:shadow-lg hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-200 transform hover:scale-105 active:scale-95"
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            {t('pairing.connecting')}
                        </>
                    ) : (
                        t('pairing.connectButton')
                    )}
                </button>
            </div>
        </form>
    </div>
  );
}