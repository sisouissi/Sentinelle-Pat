
export const translations = {
    app: {
        loading: "Chargement de l'application...",
    },
    header: {
        title: "Sentinelle BPCO",
        welcomeBack: "Ravi de vous revoir, {{name}}.",
        promptLogin: "Veuillez vous connecter avec votre code.",
        logout: "Déconnexion",
        languageSelectorLabel: "Sélectionner la langue",
        sos: "Alerte d'urgence",
        profile: "Mon Profil"
    },
    tabs: {
        trends: "Tendances",
        smartphone: "Smartphone",
        mobility: "Mobilité",
        treatment: "Traitement",
        assistant: "Assistant",
        aiFilter: "Filtre IA",
        aiFilterTooltip: "Activer/Désactiver le filtre d'analyse IA",
    },
    riskScore: {
        score: "Score",
        low: {
            title: "Risque Faible",
            description: "Vos signes vitaux sont stables. Continuez comme ça."
        },
        medium: {
            title: "Risque Moyen",
            description: "Certains de vos signes vitaux nécessitent une attention. Surveillez vos symptômes."
        },
        high: {
            title: "Risque Élevé",
            description: "Veuillez consulter votre plan d'action et envisager de contacter votre médecin."
        }
    },
    vitals: {
        spo2: "Saturation en Oxygène",
        heartRate: "Fréquence Cardiaque"
    },
    trendsChart: {
        heartRateKey: "Fréquence Cardiaque",
        heartRateUnit: "FC (bpm)",
        spo2Unit: "SpO2 (%)",
        alertThreshold: "Seuil d'alerte",
        criticalThreshold: "Seuil critique"
    },
    smartphone: {
        title: "Résumé du Smartphone",
        bestPractices: {
            title: "Bonnes pratiques pour le suivi nocturne :",
            placement: "Placez le téléphone sur votre matelas, près de votre torse.",
            dnd: "Activez le mode \"Ne pas déranger\" pour éviter les notifications.",
            airplane: "Activez le \"Mode Avion\" pour désactiver les ondes pendant votre sommeil."
        },
        activity: {
            title: "Activité",
            steps: "Pas",
            sedentaryTime: "Temps sédentaire",
            walkingSpeed: "Vitesse de marche"
        },
        sleep: {
            title: "Sommeil",
            duration: "Durée totale",
            efficiency: "Efficacité",
            nightMovements: "Mouvements nocturnes"
        },
        cough: {
            title: "Toux",
            frequency: "Fréquence",
            nightEpisodes: "Épisodes nocturnes",
            respiratoryRate: "Fréq. respiratoire"
        },
        environment: {
            title: "Environnement",
            airQuality: "Qualité de l'air",
            homeTime: "Temps à la maison",
            temperature: "Température"
        },
        reported: {
            title: "Données rapportées",
            breathlessness: "Essoufflement",
            catScore: "Score CAT",
            adherence: "Adhésion traitement"
        }
    },
    mobility: {
        loading: "Chargement des données de mobilité...",
        permission: {
            title: "Activer le suivi de mobilité",
            description: "Pour fournir une analyse complète de votre activité quotidienne, Sentinelle a besoin d'accéder aux capteurs de mouvement de votre téléphone (comme l'accéléromètre et le gyroscope).",
            button: "Donner la permission"
        },
        startTracking: "Démarrer le suivi",
        stopTracking: "Arrêter le suivi",
        interval: "Intervalle",
        mobilityScore: "Score Mobilité",
        stepFrequency: "Fréquence Pas",
        movementSpeed: "Vitesse Déplacement",
        accelerometer: "Accéléromètre",
        gyroscope: "Gyroscope",
        activities: {
            stationary: "Immobile",
            walking: "Marche",
            running: "Course",
            vehicle: "En Véhicule"
        }
    },
    deviceManager: {
        title: "Gestion des Appareils",
        total: "Total",
        connected: "Connectés",
        oximeters: "Oxymètres",
        devices: "Appareils",
        liveData: "Données en direct",
        statusActive: "Actif",
        statusInactive: "Inactif",
        connect: "Connecter",
        connecting: "Connexion...",
        disconnect: "Déconnecter",
        waitingForData: "En attente de données...",
        connectToSeeData: "Connectez un appareil pour voir les mesures en direct.",
        liveMeasurement: "Mesure en Direct",
        quality: "Qualité",
        heartRateUnit: "Fréq. Cardiaque (bpm)",
        scanning: "Recherche...",
        noDevicesFound: "Aucun appareil trouvé",
        clickToScan: "Cliquez sur l'icône de rafraîchissement pour rechercher.",
        errors: {
            noDevicesFound: "Aucun appareil trouvé. Assurez-vous que votre appareil est allumé et en mode d'appairage.",
            scanError: "Erreur lors de la recherche d'appareils.",
            connectionFailed: "Échec de la connexion",
            unknownError: "Erreur inconnue"
        }
    },
    chatbot: {
        title: "Assistant Santé IA",
        enableTTS: "Activer la lecture vocale",
        disableTTS: "Désactiver la lecture vocale",
        listening: "Je vous écoute...",
        processing: "Analyse...",
        askQuestion: "Posez-moi une question...",
        useVoiceInput: "Utiliser la saisie vocale",
        deviceConnected: "Connexion réussie. J'envoie maintenant les données en direct au serveur pour analyse.",
        deviceDisconnected: "Vous vous êtes déconnecté. La surveillance en temps réel est arrêtée."
    },
    pairing: {
        title: "Bienvenue sur Sentinelle",
        description: "Pour accéder à votre tableau de bord personnel, veuillez entrer le code de jumelage fourni par votre médecin.",
        codeLabel: "Code de Jumelage",
        connectButton: "Se Connecter",
        connecting: "Vérification...",
        errors: {
            codeRequired: "Veuillez entrer un code de jumelage.",
            invalidCode: "Code de jumelage invalide ou introuvable. Veuillez réessayer.",
            genericError: "Une erreur est survenue",
            connectionError: "Une erreur de connexion inattendue est survenue. Vérifiez votre connexion internet."
        }
    },
    treatment: {
        title: "Mon Traitement",
        addMedication: "Ajouter un médicament",
        todaysSchedule: "Prises d'aujourd'hui",
        myMedications: "Mes Médicaments",
        noMedications: "Aucun médicament ajouté.",
        noMedicationsDescription: "Cliquez sur le bouton '+' pour ajouter votre premier traitement.",
        noTasksToday: "Aucune prise prévue pour le reste de la journée.",
        taken: "Pris",
        markAsTaken: "Marquer comme pris",
        missed: "Manqué",
        markAsMissed: "Marquer comme manqué",
        errorMarkingTaken: "Erreur lors du marquage de la dose comme prise.",
        addModal: {
            title: "Ajouter un nouveau médicament",
            editTitle: "Modifier le médicament",
            nameLabel: "Nom du médicament",
            dosageLabel: "Dosage (ex: 1 comprimé, 2 inhalations)",
            frequencyLabel: "Fréquence",
            timesLabel: "Heures de prise",
            addTime: "Ajouter une heure",
            everyDay: "Tous les jours",
            twiceADay: "2 fois par jour",
            threeTimesADay: "3 fois par jour",
            fourTimesADay: "4 fois par jour",
            save: "Enregistrer",
            saving: "Enregistrement...",
            delete: "Supprimer",
            deleting: "Suppression...",
            error: "Veuillez remplir tous les champs.",
            confirmDelete: "Êtes-vous sûr de vouloir supprimer {{name}} ?",
            errorGeneric: "Une erreur est survenue.",
            errorDelete: "Échec de la suppression du médicament."
        },
        notification: {
            title: "Rappel Sentinelle",
            body: "Il est temps de prendre votre {{name}} ({{dosage}}).",
            permissionNeeded: "Les notifications sont nécessaires pour les rappels de médicaments.",
            permissionGranted: "Notifications activées.",
            permissionDenied: "Les notifications sont désactivées. Vous ne recevrez pas de rappels.",
            actions: {
                taken: "Pris",
                snooze: "Rappeler dans 15 min"
            }
        }
    },
    profile: {
        title: "Mon Profil",
        patientInfo: "Informations du patient",
        emergencyContact: "Contact d'Urgence",
        emergencyContactDescription: "Ajoutez une personne à contacter en cas d'urgence. Ces informations resteront sur votre appareil.",
        nameLabel: "Nom du contact",
        phoneLabel: "Numéro de téléphone",
        save: "Enregistrer",
        saving: "Enregistrement...",
        success: "Contact d'urgence mis à jour.",
        noContact: "Aucun contact d'urgence configuré.",
        errorSave: "Échec de la sauvegarde du contact."
    },
    emergency: {
        title: "Confirmation d'Urgence",
        confirmMessage: "Vous êtes sur le point de contacter votre personne d'urgence :",
        callButton: "Lancer l'appel",
        smsButton: "Envoyer un SMS",
        cancelButton: "Annuler",
        noContactTitle: "Aucun Contact d'Urgence",
        noContactDescription: "Veuillez configurer un contact d'urgence dans votre profil pour utiliser cette fonctionnalité.",
        configureButton: "Configurer maintenant",
        smsBody: "Bonjour {{contactName}}. Ceci est un message d'alerte de la part de {{patientName}} via l'application Sentinelle. Merci de le/la contacter.",
        callInitiated: "Appel vers {{contactName}} initié. Appuyez sur le bouton vert pour démarrer l'appel. Restez calme, l'aide arrive."
    },
    errors: {
        loadData: "Impossible de charger les données. Vérifiez la connexion au serveur et la configuration de Supabase.",
        connectionTitle: "Erreur de Connexion",
        supabaseConfig: "Veuillez mettre à jour les valeurs de VOTRE_URL_SUPABASE et VOTRE_CLE_ANON_SUPABASE dans le fichier services/supabaseClient.ts avec vos propres clés d'API Supabase.",
        apiConnection: "Je suis désolé, j'ai des difficultés à me connecter en ce moment. Veuillez réessayer plus tard.",
        aiWarningTitle: "Service IA non configuré",
        aiWarningMessage: "La clé API pour le service Gemini n'est pas fournie. Les fonctionnalités de l'assistant IA sont désactivées.",
        aiUnavailableTooltip: "L'assistant IA est désactivé car la clé API n'est pas configurée."
    },
    doctorDashboard: {
        addPatientError: "Échec de l'ajout du patient.",
        totalPatients: "Patients Totals",
        critical: "Critiques",
        warnings: "Avertissements",
        stable: "Stables",
        patients: "Patients",
        alerts: "Alertes",
        searchPlaceholder: "Rechercher un patient...",
        allStatuses: "Tous les statuts",
        lowRisk: "Risque Faible",
        mediumRisk: "Risque Moyen",
        highRisk: "Risque Élevé",
        addPatient: "Ajouter Patient",
        patientHeader: "Patient",
        riskScoreHeader: "Score Risque",
        adherence7d: "Adhérence (7j)",
        spo2HrHeader: "SpO2 / FC",
        trendHeader: "Tendance",
        statusHeader: "Statut",
        actionsHeader: "Actions",
        details: "Détails",
        view: "Voir",
        riskLevels: {
            low: "Faible",
            medium: "Moyen",
            high: "Élevé"
        },
        patientInfo: "Informations Patient",
        emergencyContact: "Contact d'Urgence",
        adherenceDetailTitle: "Adhérence au Traitement",
        currentMedications: "Médicaments Actuels",
        scheduledTimes: "Prises prévues"
    },
    patientDetail: {
        loadingPrediction: "Chargement de l'analyse prédictive...",
        hourlyActivity: "Activité horaire (24h)",
        mobilityHeatmap: "Carte de chaleur de la mobilité à domicile",
        loadingChat: "Chargement de l'historique de discussion...",
        noChatHistory: "Aucun historique de discussion trouvé pour ce patient.",
        title: "Tableau de bord de {{name}}",
        liveAnalysis: "Analyse en direct",
        chatHistory: "Historique de l'assistant"
    },
    prediction: {
        cardTitle: "Prédiction d'Exacerbation (IA)",
        riskTitle: "Risque d'exacerbation dans les 72h",
        confidence: "Confiance",
        factorsTitle: "Principaux facteurs contributifs",
        impacts: {
            high: "Élevé",
            medium: "Moyen",
            low: "Faible"
        },
        recommendationsTitle: "Actions recommandées"
    },
    alerts: {
        cardTitle: "Alertes et anamalies récentes",
        noAnomalies: "Aucune anomalie détectée récemment.",
        types: {
            vital_sign_anomaly: "Anomalie de signe vital",
            mobility_decline: "Baisse de mobilité",
            sleep_disruption: "Perturbation du sommeil",
            cough_increase: "Augmentation de la toux"
        },
        severity: "Sévérité :"
    },
    realTimeChart: {
        steps: "Pas",
        activeMinutes: "Minutes actives"
    },
    heatmap: {
        lowActivity: "Faible",
        highActivity: "Élevée"
    },
    addPatientModal: {
        errorRequired: "Veuillez remplir tous les champs.",
        patientCreationFail: "La création du patient a échoué.",
        errorGeneric: "Une erreur est survenue. Veuillez réessayer.",
        nameLabel: "Nom complet",
        ageLabel: "Âge",
        conditionLabel: "Condition principale",
        conditionPlaceholder: "ex: BPCO Sévère",
        cancel: "Annuler",
        adding: "Ajout en cours...",
        addAndGetCode: "Ajouter & Obtenir le code",
        successTitle: "Patient ajouté !",
        successDescription: "Partagez ce code unique avec le patient pour qu'il puisse se connecter à son application.",
        pairingCode: "Code de jumelage du patient",
        copied: "Copié !",
        addAnother: "Ajouter un autre patient",
        done: "Terminé",
        titleSuccess: "Code pour {{name}}",
        title: "Ajouter un nouveau patient",
        subtitleSuccess: "Le patient peut maintenant utiliser ce code.",
        subtitle: "Remplissez les informations ci-dessous."
    },
    chatHistory: {
        title: "Historique de la conversation"
    },
    patientInfo: {
        name: "Nom",
        age: "Âge",
        condition: "Condition",
        pairingCode: "Code de jumelage",
        notConfigured: "Non configuré"
    },
    medicationAdherence: {
        noMedication: "Aucun médicament configuré."
    },
    footer: {
        copyright: "© 2025 Sentinelle : Application développée par Dr Zouhair Souissi. Tous droits réservés"
    }
};
