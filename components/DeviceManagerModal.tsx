
import React from 'react';
import { DeviceManager } from './DeviceManager';
import { XCircle, Bluetooth } from './icons';
import { useTranslation } from '../contexts/LanguageContext';

interface DeviceManagerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConnect: () => void;
    onDisconnect: () => void;
}

export function DeviceManagerModal({ isOpen, onClose, onConnect, onDisconnect }: DeviceManagerModalProps) {
    const { t } = useTranslation();

    if (!isOpen) {
        return null;
    }

    return (
        <div 
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-2xl shadow-xl w-full max-w-lg h-[90vh] max-h-[40rem] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="p-4 border-b border-slate-200 flex items-start justify-between">
                     <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-full">
                           <Bluetooth className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                           <h2 className="text-lg font-bold text-slate-800">{t('deviceManager.title')}</h2>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-200">
                        <XCircle className="w-6 h-6" />
                    </button>
                </header>
                <div className="flex-1 overflow-hidden">
                    <DeviceManager
                        isConnected={false} // State is managed in App.tsx, this is just for display
                        onConnect={onConnect}
                        onDisconnect={onDisconnect}
                    />
                </div>
            </div>
        </div>
    );
}
