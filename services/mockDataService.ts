import type { PatientData, Measurement, RiskLevel, SmartphoneData, Medication, MedicationLog } from '../types';

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
    }

    currentSpo2 += spo2Change;
    currentHeartRate += hrChange;
    
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


export function getDefaultSmartphoneData(): SmartphoneData {
  return {
    activity: { steps: 0, distanceKm: 0, activeMinutes: 0, sedentaryMinutes: 0, floorsClimbed: 0, movementSpeedKmh: 0 },
    sleep: { totalSleepHours: 0, sleepEfficiency: 0, awakeMinutes: 0, remSleepMinutes: 0, deepSleepMinutes: 0, sleepPosition: "lateral", nightMovements: 0 },
    cough: { coughFrequencyPerHour: 0, coughIntensityDb: 0, nightCoughEpisodes: 0, coughPattern: "dry", respiratoryRate: 16 },
    environment: { homeTimePercent: 0, travelRadiusKm: 0, airQualityIndex: 50, weather: { temperatureC: 20, humidityPercent: 50 } },
    reported: { symptoms: { breathlessness: 0, cough: 0, fatigue: 0 }, medication: { adherencePercent: 100, missedDoses: 0 }, qualityOfLife: { CAT: 0 } },
  };
}

// FIX: Add and export the missing 'calculateMedicationAdherence' function.
export function calculateMedicationAdherence(patientData: PatientData): number {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const activeSchedules = patientData.medications
        .filter(med => med.is_active)
        .flatMap(med => med.schedules);
    
    if (activeSchedules.length === 0) {
        return 100;
    }

    const totalScheduledDoses = activeSchedules.length * 7;
    
    const takenLogsCount = patientData.medication_logs.filter(log => {
        const logDate = new Date(log.taken_at);
        const isRecent = logDate >= sevenDaysAgo;
        const isScheduled = activeSchedules.some(s => s.id === log.schedule_id);
        return isRecent && isScheduled;
    }).length;

    if (totalScheduledDoses === 0) {
        return 100;
    }

    return Math.min(100, Math.round((takenLogsCount / totalScheduledDoses) * 100));
}

export const allPatients: PatientData[] = [
    {
        id: 1,
        name: 'Jean Dupont',
        age: 67,
        condition: 'BPCO Sévère',
        measurements: createMeasurements(91, 95, 'down'),
        smartphone: highRiskSmartphoneData,
        medications: mockMedications,
        medication_logs: mockMedicationLogs,
        code: 'TEST-123',
    }
];

export function calculateRiskScore(patientData: PatientData): { score: number, level: RiskLevel } {
    let score = 0;

    // Vitals
    const latestMeasurement = patientData.measurements.length > 0 ? patientData.measurements[patientData.measurements.length - 1] : null;
    if (latestMeasurement) {
        if (latestMeasurement.spo2 < 90) score += 30;
        else if (latestMeasurement.spo2 < 92) score += 20;
        else if (latestMeasurement.spo2 < 94) score += 10;
        
        if (latestMeasurement.heartRate > 110) score += 15;
        else if (latestMeasurement.heartRate > 100) score += 10;
    } else {
        score += 10; // Penalty for no data
    }
    
    // Smartphone Data
    if (patientData.smartphone.activity.steps < 1500) score += 10;
    if (patientData.smartphone.sleep.totalSleepHours < 5) score += 10;
    if (patientData.smartphone.cough.coughFrequencyPerHour > 10) score += 15;
    if (patientData.smartphone.cough.respiratoryRate > 22) score += 15;
    if (patientData.smartphone.environment.airQualityIndex > 150) score += 5;

    // Reported Data
    if (patientData.smartphone.reported.symptoms.breathlessness > 7) score += 20;
    if (patientData.smartphone.reported.qualityOfLife.CAT > 25) score += 10;
    if (patientData.smartphone.reported.medication.adherencePercent < 80) score += 10;

    score = Math.min(100, Math.max(0, score));
    let level: RiskLevel = 'Low';
    if (score > 70) level = 'High';
    else if (score > 40) level = 'Medium';

    return { score: Math.round(score), level };
}