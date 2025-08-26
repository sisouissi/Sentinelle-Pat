import type { PatientData } from '../types';
import * as supabaseService from './supabaseService';

type TFunction = (key: any, options?: { [key: string]: string | number }) => string;

export class MedicationScheduler {
    private static instance: MedicationScheduler;
    private notificationTimers: NodeJS.Timeout[] = [];
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
        
        // FIX: The 'actions' property is not supported on the NotificationOptions type for notifications created in the window context. 
        // This feature is available for notifications triggered by a service worker.
        // The property has been removed to resolve the error.
        const notification = new Notification(title, {
            body: body,
            icon: '/vite.svg',
        });

        // FIX: With the removal of notification actions, the onclick handler is simplified.
        // The default behavior on clicking the notification is to log the medication as taken.
        // The 'snooze' functionality is no longer possible without service worker-based actions.
        notification.onclick = (event) => {
            event.preventDefault();
            if (this.patientId !== null) {
                supabaseService.logMedicationIntake(this.patientId, scheduleId);
            }
            notification.close();
        };
    }

    public clearScheduledNotifications() {
        this.notificationTimers.forEach(timer => clearTimeout(timer));
        this.notificationTimers = [];
    }
}
