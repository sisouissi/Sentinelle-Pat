import type { CompletePrediction, FactorAnalysis, AnomalyAlert, PatientData, RiskLevel } from '../types';
import { calculateRiskScore } from './analyticsService';

class PredictionService {
    private static instance: PredictionService;
    private intervalId: number | null = null;
    private callbacks: Set<(data: CompletePrediction) => void> = new Set();
    private currentPatient: PatientData | null = null;
    private lastPrediction: CompletePrediction | null = null;

    private constructor() {}

    public static getInstance(): PredictionService {
        if (!PredictionService.instance) {
            PredictionService.instance = new PredictionService();
        }
        return PredictionService.instance;
    }

    public startStreaming(patient: PatientData) {
        this.stopStreaming();
        this.currentPatient = patient;
        if (!this.currentPatient) {
            console.error(`Invalid patient data provided to PredictionService.`);
            return;
        }

        this.generatePrediction(); // Initial prediction
        this.intervalId = setInterval(() => this.generatePrediction(), 3000) as unknown as number;
    }

    public stopStreaming() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.lastPrediction = null;
        this.currentPatient = null;
    }

    public onUpdate(callback: (data: CompletePrediction) => void): () => void {
        this.callbacks.add(callback);
        if (this.lastPrediction) {
            callback(this.lastPrediction);
        }
        return () => this.callbacks.delete(callback);
    }

    private notifyUpdates() {
        if (this.lastPrediction) {
            this.callbacks.forEach(cb => cb(this.lastPrediction!));
        }
    }

    private generatePrediction() {
        if (!this.currentPatient) return;
        
        const { score, level } = calculateRiskScore(this.currentPatient);

        // Simulate fluctuation
        const riskScore = Math.min(100, Math.max(0, score + (Math.random() - 0.5) * 5));
        const confidence = 85 + (Math.random() - 0.5) * 10;
        
        const contributingFactors = this.generateFactors(level);
        const alerts = this.generateAlerts(level, riskScore);
        const recommendations = this.generateRecommendations(level);

        const activityData = this.generateActivityData();
        const heatmapData = this.generateHeatmapData();

        this.lastPrediction = {
            patientId: this.currentPatient.id,
            riskScore: Math.round(riskScore),
            confidence: Math.round(confidence),
            timeHorizon: 24 + Math.round(Math.random() * 48),
            contributingFactors,
            alerts,
            recommendations,
            lastUpdate: new Date().toISOString(),
            activityData,
            heatmapData
        };
        
        this.notifyUpdates();
    }

    private generateFactors(level: RiskLevel): FactorAnalysis[] {
        const factors: FactorAnalysis[] = [];
        if (level === 'High' || level === 'Medium') {
            factors.push({ name: 'Baisse de mobilité', impact: 'high', description: "Les pas aujourd'hui sont 45% en dessous de la moyenne hebdomadaire." });
            factors.push({ name: 'Qualité du sommeil', impact: 'medium', description: 'Mouvements nocturnes augmentés et faible durée du sommeil profond.' });
            factors.push({ name: 'Fréquence de la toux', impact: 'medium', description: 'Les épisodes de toux nocturne ont doublé.' });
        }
        if (level === 'High') {
            factors.push({ name: 'Tendance SpO₂', impact: 'high', description: 'La saturation en oxygène montre une tendance constante à la baisse.' });
        }
        if (factors.length === 0) {
             factors.push({ name: 'Signes vitaux stables', impact: 'low', description: 'Tous les indicateurs clés sont dans leur plage normale.' });
        }
        return factors.slice(0, 3);
    }
    
    private generateAlerts(level: RiskLevel, riskScore: number): AnomalyAlert[] {
        if (level === 'High' && Math.random() > 0.5) {
            return [{
                id: `alert-${Date.now()}`,
                type: 'vital_sign_anomaly',
                severity: 'high',
                description: `Chute critique de SpO₂ détectée. Actuelle : ${this.currentPatient?.measurements.slice(-1)[0].spo2}%`,
                timestamp: new Date(),
                confidence: 95
            }];
        }
        if(level === 'Medium' && Math.random() > 0.7) {
             return [{
                id: `alert-${Date.now()}`,
                type: 'mobility_decline',
                severity: 'medium',
                description: `Baisse significative des pas quotidiens détectée.`,
                timestamp: new Date(),
                confidence: 88
            }];
        }
        return [];
    }
    
    private generateRecommendations(level: RiskLevel): string[] {
        if (level === 'High') return ["Conseiller au patient d'utiliser son inhalateur de secours.", 'Préparer une hospitalisation potentielle.', "Contacter le patient ou l'aidant immédiatement."];
        if (level === 'Medium') return ['Planifier une consultation en télésanté.', 'Rappeler au patient de signaler ses symptômes.', "Vérifier l'observance du traitement."];
        return ['Poursuivre la surveillance de routine.', 'Encourager le respect du plan de traitement.'];
    }

    private generateActivityData(): { time: string; steps: number; activeMinutes: number }[] {
        const data = [];
        const now = new Date();
        for (let i = 23; i >= 0; i--) {
            const time = new Date(now.getTime() - i * 60 * 60 * 1000);
            const hour = time.getHours();
            let steps = 0;
            let activeMinutes = 0;
            if (hour > 7 && hour < 21) { // More active during the day
                steps = Math.random() * 500;
                activeMinutes = Math.random() * 10;
            } else {
                 steps = Math.random() * 50;
                 activeMinutes = Math.random() * 2;
            }
             data.push({
                time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                steps: Math.round(steps),
                activeMinutes: Math.round(activeMinutes)
            });
        }
        return data;
    }
    
    private generateHeatmapData(rows = 8, cols = 12): number[][] {
        const data = Array.from({ length: rows }, () => Array(cols).fill(0));
        const activityPoints = 5 + Math.floor(Math.random() * 10);
        for(let i=0; i<activityPoints; i++) {
            const r = Math.floor(Math.random() * rows);
            const c = Math.floor(Math.random() * cols);
            data[r][c] = Math.random(); // Intensity
        }
        return data;
    }

}

export const predictionService = PredictionService.getInstance();
