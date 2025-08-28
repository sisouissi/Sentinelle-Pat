import type { PatientData, Measurement, SmartphoneData, Medication, MedicationLog, SpeechAnalysis, SmokingCessationData, SmokingLog } from '../types';

function createMeasurements(baseSpo2: number, baseHeartRate: number, trend: 'stable' | 'down' | 'up'): Measurement[] {
  const measurements: Measurement[] = [];
  let currentDate = new Date();
  currentDate.setHours(currentDate.getHours() - 4);

  let currentSpo2 = baseSpo2;
  let currentHeartRate = baseHeartRate;

  for (let i = 0; i < 60; i++) { // Generate 60 points over 4 hours
    measurements.push({
      timestamp: new Date(currentDate.getTime() + i * 4 * 60 * 1000),
      spo2: parseFloat(currentSpo2.toFixed(0)),
      heartRate: parseFloat(currentHeartRate.toFixed(0)),
    });

    const spo2Change = (Math.random() - 0.5) * 1; 
    const hrChange = (Math.random() - 0.5) * 2; 

    if (trend === 'down') {
      currentSpo2 -= (0.05 + Math.random() * 0.1);
      currentHeartRate += (0.1 + Math.random() * 0.15);
    } else if (trend === 'up') {
      currentSpo2 += (0.05 + Math.random() * 0.08);
      currentHeartRate -= (0.1 + Math.random() * 0.15);
    } else { // stable
      currentSpo2 += spo2Change;
      currentHeartRate += hrChange;
    }
    
    currentSpo2 = Math.max(88, Math.min(99, currentSpo2));
    currentHeartRate = Math.max(55, Math.min(115, currentHeartRate));
  }
  return measurements;
}

const highRiskSmartphoneData: SmartphoneData = {
    activity: { steps: 1200, distanceKm: 0.8, activeMinutes: 15, sedentaryMinutes: 450, floorsClimbed: 1, movementSpeedKmh: 1.8 },
    sleep: { totalSleepHours: 4.8, sleepEfficiency: 65, awakeMinutes: 90, remSleepMinutes: 40, deepSleepMinutes: 30, sleepPosition: "sitting", nightMovements: 45 },
    cough: { coughFrequencyPerHour: 12, coughIntensityDb: 75, nightCoughEpisodes: 8, coughPattern: "wheezing", respiratoryRate: 24 },
    environment: { homeTimePercent: 95, travelRadiusKm: 0.5, airQualityIndex: 110, weather: { temperatureC: 3, humidityPercent: 85 } },
    reported: { symptoms: { breathlessness: 8, cough: 7, fatigue: 9 }, medication: { adherencePercent: 75, missedDoses: 2 }, qualityOfLife: { CAT: 32 } },
};

const stableSmartphoneData: SmartphoneData = {
    activity: { steps: 8500, distanceKm: 6.2, activeMinutes: 75, sedentaryMinutes: 250, floorsClimbed: 8, movementSpeedKmh: 4.1 },
    sleep: { totalSleepHours: 7.5, sleepEfficiency: 92, awakeMinutes: 25, remSleepMinutes: 90, deepSleepMinutes: 80, sleepPosition: "lateral", nightMovements: 15 },
    cough: { coughFrequencyPerHour: 2, coughIntensityDb: 60, nightCoughEpisodes: 1, coughPattern: "dry", respiratoryRate: 16 },
    environment: { homeTimePercent: 60, travelRadiusKm: 5.5, airQualityIndex: 45, weather: { temperatureC: 22, humidityPercent: 60 } },
    reported: { symptoms: { breathlessness: 2, cough: 1, fatigue: 2 }, medication: { adherencePercent: 98, missedDoses: 0 }, qualityOfLife: { CAT: 8 } },
};

// Mock medications
const mockMedications: Medication[] = [
    {
        id: 1, patient_id: 1, name: 'Spiriva Respimat', dosage: '2 inhalations', is_active: true,
        schedules: [{ id: 1, medication_id: 1, time_of_day: '09:00' }]
    },
    {
        id: 2, patient_id: 1, name: 'Symbicort', dosage: '1 inhalation', is_active: true,
        schedules: [{ id: 2, medication_id: 2, time_of_day: '09:00' }, { id: 3, medication_id: 2, time_of_day: '21:00' }]
    }
];

// Mock medication logs for the last 7 days
const mockMedicationLogs: MedicationLog[] = (() => {
    const logs: MedicationLog[] = [];
    const today = new Date();
    // Simulate 85% adherence
    for (let i = 0; i < 7; i++) {
        const day = new Date(today);
        day.setDate(today.getDate() - i);
        if (Math.random() < 0.85) logs.push({id: i*3+1, schedule_id: 1, patient_id: 1, taken_at: new Date(day.setHours(9, 5, 0)).toISOString()});
        if (Math.random() < 0.85) logs.push({id: i*3+2, schedule_id: 2, patient_id: 1, taken_at: new Date(day.setHours(9, 2, 0)).toISOString()});
        if (Math.random() < 0.85) logs.push({id: i*3+3, schedule_id: 3, patient_id: 1, taken_at: new Date(day.setHours(21, 3, 0)).toISOString()});
    }
    return logs;
})();

// --- New Mock Data ---

// Generate mock speech analysis data for the last 7 days
function createSpeechAnalysisHistory(): SpeechAnalysis[] {
  const history: SpeechAnalysis[] = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const day = new Date(today);
    day.setDate(today.getDate() - i);
    history.push({
      timestamp: day,
      speechRate: 140 + (Math.random() - 0.5) * 20, // 130-150 wpm
      pauseFrequency: 4 + (Math.random() - 0.5) * 2, // 3-5 pauses/min
      articulationScore: 90 + (Math.random() - 0.5) * 10, // 85-95%
    });
  }
  return history;
}

// Generate mock smoking cessation data for a smoker
function createSmokerData(): SmokingCessationData {
  const logs: SmokingLog[] = [];
  const today = new Date();
  // Simulate 2 smoke-free days
  for (let i = 6; i >= 2; i--) {
      const day = new Date(today);
      day.setDate(today.getDate() - i);
      // Add 2-5 smoked logs
      for(let j=0; j < 2 + Math.floor(Math.random() * 4); j++) {
        logs.push({ timestamp: new Date(new Date(day).setHours(8 + j*2)), type: 'smoked' });
      }
      // Add 1-3 craving logs
      for(let j=0; j < 1 + Math.floor(Math.random() * 3); j++) {
        logs.push({ timestamp: new Date(new Date(day).setHours(9 + j*3)), type: 'craving' });
      }
  }
   // Add a craving today
  logs.push({ timestamp: new Date(new Date().setHours(10)), type: 'craving', trigger: 'Stress' });

  return {
    isSmoker: true,
    consecutiveSmokeFreeDays: 2, // Manually set for demo clarity
    logs: logs.sort((a,b) => a.timestamp.getTime() - b.timestamp.getTime()),
  };
}

const nonSmokerData: SmokingCessationData = {
  isSmoker: false,
  consecutiveSmokeFreeDays: 0,
  logs: [],
};


export function getDefaultSmartphoneData(): SmartphoneData {
  return {
    activity: { steps: 0, distanceKm: 0, activeMinutes: 0, sedentaryMinutes: 0, floorsClimbed: 0, movementSpeedKmh: 0 },
    sleep: { totalSleepHours: 0, sleepEfficiency: 0, awakeMinutes: 0, remSleepMinutes: 0, deepSleepMinutes: 0, sleepPosition: "lateral", nightMovements: 0 },
    cough: { coughFrequencyPerHour: 0, coughIntensityDb: 0, nightCoughEpisodes: 0, coughPattern: "dry", respiratoryRate: 16 },
    environment: { homeTimePercent: 0, travelRadiusKm: 0, airQualityIndex: 50, weather: { temperatureC: 20, humidityPercent: 50 } },
    reported: { symptoms: { breathlessness: 0, cough: 0, fatigue: 0 }, medication: { adherencePercent: 100, missedDoses: 0 }, qualityOfLife: { CAT: 0 } },
  };
}

export let allPatients: PatientData[] = [
    {
        id: 1,
        name: 'Jean Dupont',
        age: 67,
        condition: 'BPCO Sévère',
        measurements: createMeasurements(91, 95, 'down'),
        smartphone: highRiskSmartphoneData,
        medications: mockMedications,
        medication_logs: mockMedicationLogs,
        emergency_contact_name: 'Marie Dupont',
        emergency_contact_phone: '0612345678',
        code: 'TEST-123',
        speechAnalysisHistory: createSpeechAnalysisHistory(),
        smokingCessation: createSmokerData(),
    },
     {
        id: 2,
        name: 'Anne Martin',
        age: 72,
        condition: 'BPCO Stable',
        measurements: createMeasurements(98, 75, 'stable'),
        smartphone: stableSmartphoneData,
        medications: [mockMedications[0]], // Only Spiriva
        medication_logs: mockMedicationLogs.filter(l => l.schedule_id === 1),
        code: 'DEMO-456',
        speechAnalysisHistory: createSpeechAnalysisHistory(),
        smokingCessation: nonSmokerData,
    }
];