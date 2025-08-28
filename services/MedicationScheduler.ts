import type { PatientData } from '../types';
import * as supabaseService from './supabaseService';

type TFunction = (key: any, options?: { [key: string]: string | number }) => string;

export class MedicationScheduler {
    private static instance: MedicationScheduler;
    // Fix: Use 'number' for setTimeout return type in browser environment instead of NodeJS.Timeout
    private notificationTimers: number[] = [];
    private patientId: number | null = null;
    private t: TFunction | null = null;

    private constructor() {}

    public static getInstance(): MedicationScheduler {
        if (!MedicationScheduler.instance) {
            MedicationScheduler.instance = new MedicationScheduler();
        }
        return MedicationScheduler.instance;
    }
    
    public async requestPermission(): Promise<NotificationPermission> {
        if (!('Notification' in window)) {
            console.error("This browser does not support desktop notification");
            return "denied";
        }
        return Notification.requestPermission();
    }
    
    public scheduleNotificationsForPatient(patientData: PatientData, t: TFunction) {
        this.t = t;
        this.patientId = patientData.id;
        this.clearScheduledNotifications();

        patientData.medications.forEach(med => {
            if (med.is_active) {
                med.schedules.forEach(schedule => {
                    const now = new Date();
                    const [hour, minute] = schedule.time_of_day.split(':').map(Number);
                    
                    const scheduleTime = new Date();
                    scheduleTime.setHours(hour, minute, 0, 0);

                    // If the time is in the past for today, schedule it for tomorrow
                    if (scheduleTime < now) {
                        scheduleTime.setDate(scheduleTime.getDate() + 1);
                    }
                    
                    const timeUntilNotification = scheduleTime.getTime() - now.getTime();

                    if (timeUntilNotification > 0) {
                        const timer = setTimeout(() => {
                            this.showNotification(med.name, med.dosage, schedule.id);
                            // Reschedule for the next day
                            this.scheduleNotificationsForPatient(patientData, t);
                        }, timeUntilNotification);
                        this.notificationTimers.push(timer);
                    }
                });
            }
        });
    }

    private showNotification(name: string, dosage: string, scheduleId: number) {
        if (!this.t || this.patientId === null) return;
        
        const title = this.t('treatment.notification.title');
        const body = this.t('treatment.notification.body', { name, dosage });
        
        const notification = new Notification(title, {
            body: body,
            icon: '/vite.svg',
        });

        notification.onclick = (event) => {
            event.preventDefault();
            if (this.patientId !== null) {
                supabaseService.logMedicationIntake(this.patientId, scheduleId)
                    .catch(err => console.error("Failed to log intake from notification:", err));
            }
            notification.close();
        };
    }

    public clearScheduledNotifications() {
        this.notificationTimers.forEach(timer => clearTimeout(timer));
        this.notificationTimers = [];
    }
}