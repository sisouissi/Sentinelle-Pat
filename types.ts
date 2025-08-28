export type RiskLevel = 'Low' | 'Medium' | 'High';

export interface Measurement {
  timestamp: Date;
  spo2: number;
  heartRate: number;
}

// --- Medication Management Types ---
export interface MedicationSchedule {
    id: number;
    medication_id: number;
    time_of_day: string; // "HH:MM"
}

export interface Medication {
    id: number;
    patient_id: number;
    name: string;
    dosage: string;
    is_active: boolean;
    schedules: MedicationSchedule[];
}

export interface MedicationLog {
    id: number;
    schedule_id: number;
    patient_id: number;
    taken_at: string; // ISO string
}

// --- New Detailed Smartphone Data Interfaces ---

export interface ActivityData {
  steps: number;
  distanceKm: number;
  activeMinutes: number;
  sedentaryMinutes: number;
  floorsClimbed: number;
  movementSpeedKmh: number;
}

export interface SleepData {
  totalSleepHours: number;
  sleepEfficiency: number;
  awakeMinutes: number;
  remSleepMinutes: number;
  deepSleepMinutes: number;
  sleepPosition: "supine" | "lateral" | "prone" | "sitting";
  nightMovements: number;
}

export interface CoughData {
  coughFrequencyPerHour: number;
  coughIntensityDb: number;
  nightCoughEpisodes: number;
  coughPattern: "dry" | "productive" | "wheezing";
  respiratoryRate: number;
}

export interface EnvironmentData {
  homeTimePercent: number;
  travelRadiusKm: number;
  airQualityIndex: number;
  weather: {
    temperatureC: number;
    humidityPercent: number;
  };
}

export interface PatientReportedData {
  symptoms: {
    breathlessness: number; // 1-10
    cough: number; // 1-10
    fatigue: number; // 1-10
  };
  medication: {
    adherencePercent: number; // This will be calculated from logs
    missedDoses: number;
  };
  qualityOfLife: {
    CAT: number; // 0-40
  };
}

// Main SmartphoneData type now contains all the detailed sub-interfaces
export interface SmartphoneData {
  activity: ActivityData;
  sleep: SleepData;
  cough: CoughData;
  environment: EnvironmentData;
  reported: PatientReportedData;
}

// --- Speech Analysis Types ---
export interface SpeechAnalysis {
  timestamp: Date;
  speechRate: number; // words per minute
  pauseFrequency: number; // pauses per minute
  articulationScore: number; // 0-100
}

// --- Smoking Cessation Types ---
export interface SmokingLog {
  timestamp: Date;
  type: 'craving' | 'smoked';
  trigger?: string; // e.g., 'Stress', 'Coffee', 'After meal'
}

export interface SmokingCessationData {
  isSmoker: boolean;
  consecutiveSmokeFreeDays: number;
  logs: SmokingLog[];
}


export interface PatientData {
  id: number;
  name: string;
  age: number;
  condition: string;
  measurements: Measurement[];
  smartphone: SmartphoneData;
  medications: Medication[];
  medication_logs: MedicationLog[];
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  smartphone_data?: any; // Raw data from Supabase before transformation
  smartphone_data_id?: number;
  code?: string;
  speechAnalysisHistory?: SpeechAnalysis[];
  smokingCessation?: SmokingCessationData;
}

export type QuestionType = 'multiple_choice' | 'scale' | 'yes_no' | 'open_ended';

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp?: string | Date; // Added for doctor's dashboard
  questionType?: QuestionType;
  options?: string[];
  // Context for when the user responds to a specific question
  questionContext?: {
    originalQuestion: string;
  };
}

// --- Device Service Types ---

export type DeviceType = 'oximeter' | 'smartphone' | 'wearable' | 'bloodPressureMonitor' | 'thermometer';

export interface DeviceCapability {
  name: string;
  type: 'spo2' | 'heartRate' | 'temperature' | 'bloodPressure' | 'activity' | 'sleep' | 'perfusion';
  unit: string;
  range: [number, number];
  precision: number;
}

export interface DeviceInfo {
  id: string;
  name: string;
  type: DeviceType;
  model: string;
  manufacturer: string;
  batteryLevel?: number;
  isConnected: boolean;
  lastSeen: string;
  capabilities: DeviceCapability[];
}

export interface DeviceReading {
  deviceId: string;
  timestamp: string;
  data: {
    spo2?: number;
    heartRate?: number;
    temperature?: number;
    bloodPressureSystolic?: number;
    bloodPressureDiastolic?: number;
    activity?: {
      steps: number;
      calories: number;
      distance: number;
    };
    sleep?: {
      duration: number;
      quality: number;
      stages: {
        deep: number;
        light: number;
        rem: number;
        awake: number;
      };
    };
  };
  quality: number; // 0-100
  isValid: boolean;
}

export interface ConnectionStatus {
  isConnected: boolean;
  device?: DeviceInfo;
  error?: string;
  lastUpdate: string;
}

// --- Mobility Service Types ---
export type ActivityType = 'stationary' | 'walking' | 'running' | 'vehicle';

export interface MobilityUpdateData {
    hasPermission: boolean;
    isTracking: boolean;
    activityType: ActivityType;
    mobilityScore: number;
    stepFrequency: number;
    movementSpeed: number;
    accelerometer: {
        x: number;
        y: number;
        z: number;
    };
    gyroscope: {
        alpha: number;
        beta: number;
        gamma: number;
    };
    batteryLevel: number;
    collectionInterval: number;
}

// --- Doctor Dashboard & Prediction Service Types ---

export interface NewPatient {
  name: string;
  age: number;
  condition: string;
}

export interface AlertData {
  id: string;
  patientId: number;
  patientName: string;
  type: 'high_risk' | 'declining_trend' | 'low_adherence';
  message: string;
  timestamp: Date;
  severity: 'high' | 'medium' | 'low';
}

export interface FactorAnalysis {
    name: string;
    impact: 'high' | 'medium' | 'low';
    description: string;
}

export interface AnomalyAlert {
    id: string;
    type: 'vital_sign_anomaly' | 'mobility_decline' | 'sleep_disruption' | 'cough_increase';
    severity: 'high' | 'medium' | 'low';
    description: string;
    timestamp: Date;
    confidence: number;
}

export interface CompletePrediction {
    patientId: number;
    riskScore: number;
    confidence: number;
    timeHorizon: number; // in hours
    contributingFactors: FactorAnalysis[];
    alerts: AnomalyAlert[];
    recommendations: string[];
    lastUpdate: string;
    activityData: { time: string; steps: number; activeMinutes: number }[];
    heatmapData: number[][];
}