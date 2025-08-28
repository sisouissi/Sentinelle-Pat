
import type { PatientData, SmartphoneData, ChatMessage, Medication, NewPatient, MedicationLog } from '../types';
import { allPatients, getDefaultSmartphoneData } from './mockDataService';
import { getEnvironmentalData } from './openWeatherService';

// Since we are in demo mode, all functions will interact with the in-memory 'allPatients' array.

export async function getPatientByPairingCode(pairingCode: string): Promise<PatientData | null> {
    console.log("DEMO MODE: Searching for patient with code:", pairingCode.toUpperCase());
    const patient = allPatients.find(p => p.code === pairingCode.toUpperCase());
    return Promise.resolve(patient ? {...patient} : null); // Return a copy to avoid direct state mutation
}

export async function getPatientById(id: number): Promise<PatientData | null> {
    console.log("DEMO MODE: Getting patient with id:", id);
    const patient = allPatients.find(p => p.id === id);
    return Promise.resolve(patient ? {...patient} : null); // Return a copy
}


export async function addMeasurement(patient_id: number, spo2: number, heart_rate: number): Promise<void> {
    // This is handled in App.tsx state for UI, but we update the mock "DB" here.
    const patient = allPatients.find(p => p.id === patient_id);
    if(patient) {
        const newMeasurement = {
            timestamp: new Date(),
            spo2: spo2,
            heartRate: heart_rate
        };
        patient.measurements.push(newMeasurement);
        if (patient.measurements.length > 60) {
            patient.measurements.shift();
        }
    }
    return Promise.resolve();
}

export function listenToPatientChanges(callback: (patients: PatientData[]) => void): () => void {
    console.warn("DEMO MODE: listenToPatientChanges is a no-op.");
    return () => {};
}

export async function getChatHistory(patientId: number): Promise<ChatMessage[]> {
    console.log("DEMO MODE: Getting chat history (returning empty).");
    return Promise.resolve([]);
}

export async function addChatMessage(message: { patientId: number; role: 'user' | 'model'; text: string; }): Promise<void> {
    console.log("DEMO MODE: addChatMessage is a no-op.", message.text);
    return Promise.resolve();
}

export async function addPatient(patient: NewPatient): Promise<PatientData | null> {
    console.log("DEMO MODE: Adding new patient", patient);
    const newId = Math.max(0, ...allPatients.map(p => p.id)) + 1;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const code = `${chars[Math.floor(Math.random()*26)]}${chars[Math.floor(Math.random()*26)]}${chars[Math.floor(Math.random()*26)]}${chars[Math.floor(Math.random()*26)]}-${Math.floor(1000 + Math.random() * 9000)}`;
    
    const newPatient: PatientData = {
        id: newId,
        ...patient,
        measurements: [],
        smartphone: getDefaultSmartphoneData(),
        medications: [],
        medication_logs: [],
        code: code
    };
    allPatients.push(newPatient);
    return Promise.resolve(newPatient);
}


// --- Medication Management ---
export async function addMedication(patientId: number, med: { name: string, dosage: string, times: string[] }) {
    console.log("DEMO MODE: Adding medication", med);
    const patient = allPatients.find(p => p.id === patientId);
    if (!patient) throw new Error("Patient not found");

    const newMedId = Math.floor(Math.random() * 10000);
    const newMed: Medication = {
        id: newMedId,
        patient_id: patientId,
        name: med.name,
        dosage: med.dosage,
        is_active: true,
        schedules: med.times.map((time, index) => ({
            id: newMedId + index + 1,
            medication_id: newMedId,
            time_of_day: time
        }))
    };
    patient.medications.push(newMed);
    return Promise.resolve();
}

export async function logMedicationIntake(patientId: number, scheduleId: number) {
    console.log("DEMO MODE: Logging medication intake for scheduleId:", scheduleId);
    const patient = allPatients.find(p => p.id === patientId);
    if (!patient) throw new Error("Patient not found");

    // Avoid duplicate logs for the same day/schedule in demo
    const today = new Date().toISOString().split('T')[0];
    const alreadyLogged = patient.medication_logs.some(log => {
        const logDay = new Date(log.taken_at).toISOString().split('T')[0];
        return log.schedule_id === scheduleId && logDay === today;
    });

    if (!alreadyLogged) {
        const newLog: MedicationLog = {
            id: Math.random(),
            patient_id: patientId,
            schedule_id: scheduleId,
            taken_at: new Date().toISOString()
        };
        patient.medication_logs.push(newLog);
    }
    return Promise.resolve();
}

export async function deleteMedication(medicationId: number) {
    console.log("DEMO MODE: Deleting medication", medicationId);
    for (const patient of allPatients) {
        const index = patient.medications.findIndex(m => m.id === medicationId);
        if (index > -1) {
            patient.medications.splice(index, 1);
            break;
        }
    }
    return Promise.resolve();
}

// --- Emergency Contact ---
export async function updatePatientEmergencyContact(patientId: number, name: string | null, phone: string | null) {
    console.log("DEMO MODE: Updating emergency contact");
    const patient = allPatients.find(p => p.id === patientId);
    if (!patient) throw new Error("Patient not found");

    patient.emergency_contact_name = name || undefined;
    patient.emergency_contact_phone = phone || undefined;
    return Promise.resolve(patient);
}

// --- Environmental Data Update ---
export async function updatePatientEnvironmentData(patientId: number): Promise<SmartphoneData | null> {
    console.log("DEMO MODE: Updating environmental data from OpenWeather for patient:", patientId);
    const patient = allPatients.find(p => p.id === patientId);
    if (!patient) return null;

    const lat = 48.8566; // Paris
    const lon = 2.3522;

    const envData = await getEnvironmentalData(lat, lon);
    
    if (envData) {
        patient.smartphone.environment.weather.temperatureC = envData.temperatureC;
        patient.smartphone.environment.weather.humidityPercent = envData.humidityPercent;
        patient.smartphone.environment.airQualityIndex = envData.airQualityIndex;
        return Promise.resolve(patient.smartphone);
    }
    
    return Promise.resolve(null);
}
