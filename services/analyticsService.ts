import type { PatientData, RiskLevel } from '../types';

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
