import { supabase } from './supabaseClient';
import type { PatientData, SmartphoneData, ChatMessage, Medication, NewPatient } from '../types';
import { allPatients as mockPatients, getDefaultSmartphoneData } from './mockDataService';
import { getEnvironmentalData } from './openWeatherService';

// Helper to transform flat smartphone_data from DB to the nested structure the app uses
function transformSmartphoneData(flatData: any): SmartphoneData {
  if (!flatData) return getDefaultSmartphoneData(); // Return default if data is missing
  return {
    activity: {
      steps: flatData.steps,
      distanceKm: flatData.distance_km,
      activeMinutes: flatData.active_minutes,
      sedentaryMinutes: flatData.sedentary_minutes,
      floorsClimbed: flatData.floors_climbed,
      movementSpeedKmh: flatData.movement_speed_kmh,
    },
    sleep: {
      totalSleepHours: flatData.total_sleep_hours,
      sleepEfficiency: flatData.sleep_efficiency,
      awakeMinutes: flatData.awake_minutes,
      remSleepMinutes: 0, // Not in DB schema, default
      deepSleepMinutes: flatData.deep_sleep_minutes,
      sleepPosition: flatData.sleep_position,
      nightMovements: flatData.night_movements,
    },
    cough: {
      coughFrequencyPerHour: flatData.cough_frequency_per_hour,
      coughIntensityDb: flatData.cough_intensity_db,
      nightCoughEpisodes: flatData.night_cough_episodes,
      coughPattern: flatData.cough_pattern,
      respiratoryRate: flatData.respiratory_rate,
    },
    environment: {
      homeTimePercent: flatData.home_time_percent,
      travelRadiusKm: flatData.travel_radius_km,
      airQualityIndex: flatData.air_quality_index,
      weather: {
        temperatureC: flatData.temperature_c,
        humidityPercent: flatData.humidity_percent,
      },
    },
    reported: {
      symptoms: {
        breathlessness: flatData.symptoms_breathlessness,
        cough: flatData.symptoms_cough,
        fatigue: flatData.symptoms_fatigue,
      },
      medication: {
        adherencePercent: flatData.medication_adherence_percent,
        missedDoses: flatData.missed_doses,
      },
      qualityOfLife: {
        CAT: flatData.quality_of_life_cat,
      },
    },
  };
}

export async function getPatientByPairingCode(pairingCode: string): Promise<PatientData | null> {
    if (!supabase) {
        return mockPatients.find(p => p.code === pairingCode.toUpperCase()) || null;
    }
    const { data, error } = await supabase
        .from('patients')
        .select(`
            *,
            measurements:measurements!patient_id ( timestamp, spo2, heart_rate ),
            smartphone_data ( * ),
            medications:medications!patient_id ( *, schedules:medication_schedules!medication_id ( * ) ),
            medication_logs:medication_logs!patient_id ( * )
        `)
        .eq('code', pairingCode.toUpperCase())
        .order('timestamp', { foreignTable: 'measurements', ascending: false })
        .limit(60, { foreignTable: 'measurements' })
        .single();

    if (error) {
        // 'PGRST116' means "exact one row not found", which is expected for an invalid code.
        if (error.code === 'PGRST116') {
            return null;
        }
        // For all other database errors, log and throw.
        console.error('Error fetching patient by pairing code:', error);
        throw new Error(error.message || 'An unexpected database error occurred.');
    }

    if (!data) {
        return null;
    }

    return {
        ...data,
        smartphone_data_id: data.smartphone_data_id,
        measurements: data.measurements.reverse(),
        smartphone: transformSmartphoneData(data.smartphone_data),
        medications: data.medications || [],
        medication_logs: data.medication_logs || [],
    };
}

export async function getPatientById(id: number): Promise<PatientData | null> {
    if (!supabase) {
        // Fallback to mock data if supabase isn't configured, useful for local dev
        const patient = mockPatients.find(p => p.id === id);
        return patient || null;
    }
    const { data, error } = await supabase
        .from('patients')
        .select(`
            *,
            measurements:measurements!patient_id ( timestamp, spo2, heart_rate ),
            smartphone_data ( * ),
            medications:medications!patient_id ( *, schedules:medication_schedules!medication_id ( * ) ),
            medication_logs:medication_logs!patient_id ( * )
        `)
        .eq('id', id)
        .order('timestamp', { foreignTable: 'measurements', ascending: false })
        .limit(60, { foreignTable: 'measurements' })
        .single();

    if (error) {
        // 'PGRST116' means "exact one row not found", which is expected for a non-existent ID.
        if (error.code === 'PGRST116') {
            return null;
        }
        // For all other database errors, log and throw.
        console.error('Error fetching patient by ID:', error);
        throw new Error(error.message || 'An unexpected database error occurred.');
    }

    if (!data) {
        return null;
    }

    return {
        ...data,
        smartphone_data_id: data.smartphone_data_id,
        measurements: data.measurements.reverse(),
        smartphone: transformSmartphoneData(data.smartphone_data),
        medications: data.medications || [],
        medication_logs: data.medication_logs || [],
    };
}


export async function addMeasurement(patient_id: number, spo2: number, heart_rate: number) {
    if (!supabase) {
        console.error("Supabase client not initialized. Measurement not sent.");
        return;
    }
    const { error } = await supabase
        .from('measurements')
        .insert([{ patient_id, spo2, heart_rate }]);

    if (error) {
        console.error('Error adding measurement:', error);
        throw error;
    }
}

export function listenToPatientChanges(callback: (patients: PatientData[]) => void): () => void {
    if (!supabase) {
        return () => {};
    }

    const fetchAndCallback = async () => {
        const { data: patients, error } = await supabase!
        .from('patients')
        .select(`
            *,
            measurements:measurements!patient_id ( timestamp, spo2, heart_rate ),
            smartphone_data ( * ),
            medications:medications!patient_id ( *, schedules:medication_schedules!medication_id ( * ) ),
            medication_logs:medication_logs!patient_id ( * )
        `)
        .order('timestamp', { foreignTable: 'measurements', ascending: false })
        .limit(60, { foreignTable: 'measurements' });

        if (error) {
            console.error('Error refetching patients on change:', error);
            return;
        }

        const transformed = patients.map(p => ({
            ...p,
            smartphone_data_id: p.smartphone_data_id,
            measurements: p.measurements.reverse(),
            smartphone: transformSmartphoneData(p.smartphone_data),
            medications: p.medications || [],
            medication_logs: p.medication_logs || [],
        }));
        callback(transformed);
    };

    const channel = supabase
        .channel('realtime-all')
        .on(
            'postgres_changes',
            { event: '*', schema: 'public' },
            async (payload) => {
                console.log('Change received!', payload.table);
                // When a change occurs, refetch all data.
                // This is simpler and more robust than trying to patch the state.
                await fetchAndCallback();
            }
        )
        .subscribe();
    
    return () => {
        supabase.removeChannel(channel);
    };
}

export async function getChatHistory(patientId: number): Promise<ChatMessage[]> {
    if (!supabase) return [];
    
    const { data, error } = await supabase
        .from('chat_messages')
        .select('role, content, created_at')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: true });
        
    if (error) {
        console.error('Error fetching chat history:', error);
        return [];
    }
    
    return data.map(msg => ({
        role: msg.role as 'user' | 'model',
        text: msg.content,
        timestamp: msg.created_at,
    }));
}

export async function addChatMessage(message: { patientId: number; role: 'user' | 'model'; text: string; }) {
    if (!supabase) {
      console.warn("Supabase not configured. Chat message not saved.");
      return;
    }
    
    const { error } = await supabase
        .from('chat_messages')
        .insert({
            patient_id: message.patientId,
            role: message.role,
            content: message.text,
        });
        
    if (error) {
        console.error('Error adding chat message:', error);
        throw error;
    }
}

// FIX: Add and export the missing 'addPatient' function.
export async function addPatient(patient: NewPatient): Promise<PatientData | null> {
    if (!supabase) {
        console.error("Supabase client not initialized. Cannot add patient.");
        // Mock a response for local dev if needed
        const newId = Math.max(...mockPatients.map(p => p.id)) + 1;
        const newPatient: PatientData = {
            id: newId,
            ...patient,
            measurements: [],
            smartphone: getDefaultSmartphoneData(),
            medications: [],
            medication_logs: [],
            code: `MOCK-${newId}`
        };
        mockPatients.push(newPatient);
        return newPatient;
    }

    // 1. Create a default smartphone_data entry
    const { data: smartphoneData, error: smartphoneError } = await supabase
        .from('smartphone_data')
        .insert([{}])
        .select()
        .single();
    
    if (smartphoneError) {
        console.error("Error creating smartphone data for new patient:", smartphoneError);
        throw smartphoneError;
    }

    // 2. Generate a unique pairing code (e.g., ABCD-1234)
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const code = `${chars[Math.floor(Math.random()*26)]}${chars[Math.floor(Math.random()*26)]}${chars[Math.floor(Math.random()*26)]}${chars[Math.floor(Math.random()*26)]}-${Math.floor(1000 + Math.random() * 9000)}`;

    // 3. Create the patient, linking the smartphone_data
    const { data: newPatientData, error: patientError } = await supabase
        .from('patients')
        .insert([{
            name: patient.name,
            age: patient.age,
            condition: patient.condition,
            smartphone_data_id: smartphoneData.id,
            code: code,
        }])
        .select()
        .single();

    if (patientError) {
        console.error("Error creating new patient:", patientError);
        // Attempt to clean up orphaned smartphone_data
        await supabase.from('smartphone_data').delete().eq('id', smartphoneData.id);
        throw patientError;
    }
    
    // Return the new patient with default empty arrays for related data
    return {
        ...newPatientData,
        measurements: [],
        smartphone: getDefaultSmartphoneData(),
        medications: [],
        medication_logs: []
    };
}


// --- Medication Management ---

export async function addMedication(patientId: number, med: { name: string, dosage: string, times: string[] }) {
    if (!supabase) throw new Error("Supabase client not initialized.");

    // Insert medication
    const { data: medData, error: medError } = await supabase
        .from('medications')
        .insert({ patient_id: patientId, name: med.name, dosage: med.dosage })
        .select()
        .single();
    if (medError) throw medError;

    // Insert schedules
    const schedulesToInsert = med.times.map(t => ({
        medication_id: medData.id,
        time_of_day: t
    }));
    const { error: scheduleError } = await supabase
        .from('medication_schedules')
        .insert(schedulesToInsert);
    if (scheduleError) throw scheduleError;
}

export async function logMedicationIntake(patientId: number, scheduleId: number) {
     if (!supabase) throw new Error("Supabase client not initialized.");
     const { error } = await supabase
        .from('medication_logs')
        .insert({ patient_id: patientId, schedule_id: scheduleId, taken_at: new Date().toISOString() });
     if (error) throw error;
}

export async function deleteMedication(medicationId: number) {
    if (!supabase) throw new Error("Supabase client not initialized.");
    // Supabase is configured with cascading delete, so deleting a medication
    // will also delete its schedules and logs.
    const { error } = await supabase.from('medications').delete().eq('id', medicationId);
    if (error) throw error;
}

// --- Emergency Contact ---
export async function updatePatientEmergencyContact(patientId: number, name: string | null, phone: string | null) {
    if (!supabase) throw new Error("Supabase client not initialized.");

    const { data, error } = await supabase
        .from('patients')
        .update({ emergency_contact_name: name, emergency_contact_phone: phone })
        .eq('id', patientId)
        .select()
        .single();
    
    if (error) {
        console.error("Error updating emergency contact:", error);
        throw error;
    }
    return data;
}

// --- Environmental Data Update ---
export async function updatePatientEnvironmentData(smartphoneDataId: number): Promise<SmartphoneData | null> {
    if (!supabase) {
        console.warn("Supabase not configured. Cannot update environmental data.");
        return null;
    }
    
    // Using Paris, FR as a default location. In a real app, this would be dynamic.
    const lat = 48.8566;
    const lon = 2.3522;

    const envData = await getEnvironmentalData(lat, lon);
    
    if (!envData) {
        console.log("No new environmental data fetched from OpenWeatherMap.");
        return null;
    }

    const { data: updatedRecord, error: updateError } = await supabase
        .from('smartphone_data')
        .update({
            temperature_c: envData.temperatureC,
            humidity_percent: envData.humidityPercent,
            air_quality_index: envData.airQualityIndex
        })
        .eq('id', smartphoneDataId)
        .select()
        .single();
    
    if (updateError) {
        console.error("Error updating environmental data in Supabase:", updateError);
        throw updateError;
    }
    
    console.log("Successfully updated environmental data:", updatedRecord);
    return transformSmartphoneData(updatedRecord);
}