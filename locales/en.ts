export const translations = {
    app: {
        loading: "Loading application...",
    },
    header: {
        title: "Sentinel COPD",
        welcomeBack: "Welcome back, {{name}}.",
        promptLogin: "Please connect with your code.",
        logout: "Logout",
        languageSelectorLabel: "Select language",
        sos: "Emergency Alert",
        profile: "My Profile"
    },
    tabs: {
        trends: "Trends",
        smartphone: "Smartphone",
        mobility: "Mobility",
        elocution: "Speech",
        smokingCessation: "Quit Smoking",
        treatment: "Treatment",
        assistant: "Assistant",
        aiFilter: "AI Filter",
        aiFilterTooltip: "Enable/Disable AI analysis filter",
    },
    riskScore: {
        score: "Score",
        low: {
            title: "Low Risk",
            description: "Your vital signs are stable. Keep up the good work."
        },
        medium: {
            title: "Medium Risk",
            description: "Some of your vital signs need attention. Monitor your symptoms."
        },
        high: {
            title: "High Risk",
            description: "Please consult your action plan and consider contacting your doctor."
        }
    },
    vitals: {
        spo2: "Oxygen Saturation",
        heartRate: "Heart Rate"
    },
    trendsChart: {
        heartRateKey: "Heart Rate",
        heartRateUnit: "HR (bpm)",
        spo2Unit: "SpO2 (%)",
        alertThreshold: "Alert threshold",
        criticalThreshold: "Critical threshold"
    },
    smartphone: {
        title: "Smartphone Summary",
        bestPractices: {
            title: "Best practices for night monitoring:",
            placement: "Place the phone on your mattress, near your torso.",
            dnd: "Enable \"Do Not Disturb\" mode to avoid notifications.",
            airplane: "Enable \"Airplane Mode\" to disable waves during your sleep."
        },
        activity: {
            title: "Activity",
            steps: "Steps",
            sedentaryTime: "Sedentary time",
            walkingSpeed: "Walking speed"
        },
        sleep: {
            title: "Sleep",
            duration: "Total duration",
            efficiency: "Efficiency",
            nightMovements: "Night movements"
        },
        cough: {
            title: "Cough",
            frequency: "Frequency",
            nightEpisodes: "Night episodes",
            respiratoryRate: "Respiratory rate"
        },
        environment: {
            title: "Environment",
            airQuality: "Air quality",
            homeTime: "Time at home",
            temperature: "Temperature"
        },
        reported: {
            title: "Reported Data",
            breathlessness: "Breathlessness",
            catScore: "CAT Score",
            adherence: "Treatment adherence"
        }
    },
    mobility: {
        loading: "Loading mobility data...",
        permission: {
            title: "Enable Mobility Tracking",
            description: "To provide a complete analysis of your daily activity, Sentinel needs access to your phone's motion sensors (like the accelerometer and gyroscope).",
            button: "Grant Permission"
        },
        startTracking: "Start Tracking",
        stopTracking: "Stop Tracking",
        interval: "Interval",
        mobilityScore: "Mobility Score",
        stepFrequency: "Step Frequency",
        movementSpeed: "Movement Speed",
        accelerometer: "Accelerometer",
        gyroscope: "Gyroscope",
        activities: {
            stationary: "Stationary",
            walking: "Walking",
            running: "Running",
            vehicle: "In Vehicle"
        }
    },
    speech: {
        title: "Speech Analysis",
        description: "Detects early signs of respiratory distress by analyzing your voice.",
        startAnalysis: "Start New Analysis",
        analyzing: "Analyzing your voice...",
        latestAnalysis: "Latest Analysis",
        speechRate: "Speech Rate",
        wpm: "wpm",
        pauseFrequency: "Pause Frequency",
        ppm: "pauses/min",
        articulationScore: "Articulation Score",
        trendTitle: "7-Day Trend",
        speechRateKey: "Speech Rate",
        pauseFrequencyKey: "Pause Freq."
    },
    smoking: {
        title: "Smoking Cessation Support",
        nonSmokerTitle: "Non-Smoker Status",
        nonSmokerDescription: "Excellent! Continuing to be smoke-free is one of the best things you can do for your health.",
        dailyStats: "Today's Statistics",
        smokedToday: "Cigarettes smoked",
        cravingsToday: "Cravings felt",
        smokeFreeDays: "Smoke-free days",
        logCraving: "I had a craving",
        logSmoked: "I smoked",
        weeklyChartTitle: "7-Day History",
        cigarettesLabel: "Cigarettes",
        activityLogTitle: "Activity Log",
        smokedEvent: "Smoked a cigarette",
        cravingEvent: "Felt a craving",
        triggerLabel: "Trigger:",
        noTrigger: "Not specified",
        logModal: {
            titleCraving: "Log a Craving",
            titleSmoked: "Log a Cigarette",
            question: "What was the trigger?",
            placeholder: "e.g., After meal, Stress, Coffee...",
            saveButton: "Save",
            skipButton: "Skip"
        }
    },
    deviceManager: {
        title: "Device Management",
        total: "Total",
        connected: "Connected",
        oximeters: "Oximeters",
        devices: "Devices",
        liveData: "Live Data",
        statusActive: "Active",
        statusInactive: "Inactive",
        connect: "Connect",
        connecting: "Connecting...",
        disconnect: "Disconnect",
        waitingForData: "Waiting for data...",
        connectToSeeData: "Connect a device to see live measurements.",
        liveMeasurement: "Live Measurement",
        quality: "Quality",
        heartRateUnit: "Heart Rate (bpm)",
        scanning: "Scanning...",
        noDevicesFound: "No devices found",
        clickToScan: "Click the refresh icon to scan for devices.",
        errors: {
            noDevicesFound: "No devices found. Make sure your device is turned on and in pairing mode.",
            scanError: "Error while scanning for devices.",
            connectionFailed: "Connection failed",
            unknownError: "Unknown error"
        }
    },
    chatbot: {
        title: "AI Health Assistant",
        enableTTS: "Enable text-to-speech",
        disableTTS: "Disable text-to-speech",
        listening: "Listening...",
        processing: "Processing...",
        askQuestion: "Ask me a question...",
        useVoiceInput: "Use voice input",
        deviceConnected: "Connection successful. Now sending live data to the server for analysis.",
        deviceDisconnected: "You have disconnected. Real-time monitoring has stopped.",
        errors: {
            noSpeech: "I didn't hear anything. Please try again."
        }
    },
    pairing: {
        title: "Welcome to Sentinel",
        description: "To access your personal dashboard, please enter the pairing code provided by your doctor.",
        codeLabel: "Pairing Code",
        connectButton: "Connect",
        connecting: "Verifying...",
        errors: {
            codeRequired: "Please enter a pairing code.",
            invalidCode: "Invalid or unfound pairing code. Please try again.",
            genericError: "An error occurred",
            connectionError: "An unexpected connection error occurred. Check your internet connection."
        }
    },
    treatment: {
        title: "My Treatment",
        addMedication: "Add Medication",
        todaysSchedule: "Today's Schedule",
        myMedications: "My Medications",
        noMedications: "No medications added.",
        noMedicationsDescription: "Click the '+' button to add your first treatment.",
        noTasksToday: "No more doses scheduled for today.",
        taken: "Taken",
        markAsTaken: "Mark as taken",
        missed: "Missed",
        markAsMissed: "Mark as missed",
        errorMarkingTaken: "Error marking dose as taken.",
        addModal: {
            title: "Add New Medication",
            editTitle: "Edit Medication",
            nameLabel: "Medication name",
            dosageLabel: "Dosage (e.g., 1 tablet, 2 puffs)",
            frequencyLabel: "Frequency",
            timesLabel: "Intake times",
            addTime: "Add time",
            everyDay: "Every day",
            twiceADay: "Twice a day",
            threeTimesADay: "3 times a day",
            fourTimesADay: "4 times a day",
            save: "Save",
            saving: "Saving...",
            delete: "Delete",
            deleting: "Deleting...",
            error: "Please fill in all fields.",
            confirmDelete: "Are you sure you want to delete {{name}}?",
            errorGeneric: "An error occurred.",
            errorDelete: "Failed to delete medication."
        },
        notification: {
            title: "Sentinel Reminder",
            body: "It's time to take your {{name}} ({{dosage}}).",
            permissionNeeded: "Notifications are required for medication reminders.",
            permissionGranted: "Notifications enabled.",
            permissionDenied: "Notifications are disabled. You will not receive reminders.",
            actions: {
                taken: "Taken",
                snooze: "Remind in 15 min"
            }
        }
    },
    profile: {
        title: "My Profile",
        patientInfo: "Patient Information",
        emergencyContact: "Emergency Contact",
        emergencyContactDescription: "Add a person to contact in case of an emergency. This information will stay on your device.",
        nameLabel: "Contact name",
        phoneLabel: "Phone number",
        save: "Save",
        saving: "Saving...",
        success: "Emergency contact updated.",
        noContact: "No emergency contact configured.",
        errorSave: "Failed to save contact."
    },
    emergency: {
        title: "Emergency Confirmation",
        confirmMessage: "You are about to contact your emergency contact:",
        callButton: "Make Call",
        smsButton: "Send SMS",
        cancelButton: "Cancel",
        noContactTitle: "No Emergency Contact",
        noContactDescription: "Please set up an emergency contact in your profile to use this feature.",
        configureButton: "Set up now",
        smsBody: "Hello {{contactName}}. This is an alert message from {{patientName}} via the Sentinel app. Please contact them.",
        callInitiated: "Calling {{contactName}}. Press the green button to start the call. Stay calm, help is on the way."
    },
    errors: {
        loadData: "Could not load data. Check the server connection and Supabase configuration.",
        connectionTitle: "Connection Error",
        supabaseConfig: "Please update the values of YOUR_SUPABASE_URL and YOUR_SUPABASE_ANON_KEY in the services/supabaseClient.ts file with your own Supabase API keys.",
        apiConnection: "I'm sorry, I'm having trouble connecting right now. Please try again later.",
        aiWarningTitle: "AI Service Not Configured",
        aiWarningMessage: "The API key for the Gemini service is not provided. AI assistant features are disabled.",
        aiUnavailableTooltip: "The AI assistant is disabled because the API key is not configured."
    },
    doctorDashboard: {
        addPatientError: "Failed to add patient.",
        totalPatients: "Total Patients",
        critical: "Critical",
        warnings: "Warnings",
        stable: "Stable",
        patients: "Patients",
        alerts: "Alerts",
        searchPlaceholder: "Search for a patient...",
        allStatuses: "All Statuses",
        lowRisk: "Low Risk",
        mediumRisk: "Medium Risk",
        highRisk: "High Risk",
        addPatient: "Add Patient",
        patientHeader: "Patient",
        riskScoreHeader: "Risk Score",
        adherence7d: "Adherence (7d)",
        spo2HrHeader: "SpO2 / HR",
        trendHeader: "Trend",
        statusHeader: "Status",
        actionsHeader: "Actions",
        details: "Details",
        view: "View",
        riskLevels: {
            low: "Low",
            medium: "Medium",
            high: "High"
        },
        patientInfo: "Patient Information",
        emergencyContact: "Emergency Contact",
        adherenceDetailTitle: "Medication Adherence",
        currentMedications: "Current Medications",
        scheduledTimes: "Scheduled Times"
    },
    patientDetail: {
        loadingPrediction: "Loading predictive analysis...",
        hourlyActivity: "Hourly Activity (24h)",
        mobilityHeatmap: "Home Mobility Heatmap",
        loadingChat: "Loading chat history...",
        noChatHistory: "No chat history found for this patient.",
        title: "{{name}}'s Dashboard",
        liveAnalysis: "Live Analysis",
        chatHistory: "Assistant History"
    },
    prediction: {
        cardTitle: "Exacerbation Prediction (AI)",
        riskTitle: "Risk of exacerbation within 72h",
        confidence: "Confidence",
        factorsTitle: "Main Contributing Factors",
        impacts: {
            high: "High",
            medium: "Medium",
            low: "Low"
        },
        recommendationsTitle: "Recommended Actions"
    },
    alerts: {
        cardTitle: "Recent Alerts & Anomalies",
        noAnomalies: "No anomalies detected recently.",
        types: {
            vital_sign_anomaly: "Vital Sign Anomaly",
            mobility_decline: "Mobility Decline",
            sleep_disruption: "Sleep Disruption",
            cough_increase: "Cough Increase"
        },
        severity: "Severity:"
    },
    realTimeChart: {
        steps: "Steps",
        activeMinutes: "Active Minutes"
    },
    heatmap: {
        lowActivity: "Low",
        highActivity: "High"
    },
    addPatientModal: {
        errorRequired: "Please fill in all fields.",
        patientCreationFail: "Patient creation failed.",
        errorGeneric: "An error occurred. Please try again.",
        nameLabel: "Full Name",
        ageLabel: "Age",
        conditionLabel: "Main Condition",
        conditionPlaceholder: "e.g., Severe COPD",
        cancel: "Cancel",
        adding: "Adding...",
        addAndGetCode: "Add & Get Code",
        successTitle: "Patient Added!",
        successDescription: "Share this unique code with the patient so they can connect to their app.",
        pairingCode: "Patient's Pairing Code",
        copied: "Copied!",
        addAnother: "Add another patient",
        done: "Done",
        titleSuccess: "Code for {{name}}",
        title: "Add a New Patient",
        subtitleSuccess: "The patient can now use this code.",
        subtitle: "Fill in the information below."
    },
    chatHistory: {
        title: "Conversation History"
    },
    patientInfo: {
        name: "Name",
        age: "Age",
        condition: "Condition",
        pairingCode: "Pairing Code",
        notConfigured: "Not configured"
    },
    medicationAdherence: {
        noMedication: "No medication configured."
    },
    footer: {
        copyright: "© 2025 Sentinel: Simulation application (Patient Interface) developed by Dr Zouhair Souissi. All rights reserved."
    }
};