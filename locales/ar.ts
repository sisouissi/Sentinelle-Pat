
export const translations = {
    app: {
        loading: "جارٍ تحميل التطبيق...",
    },
    header: {
        title: "الرقيب لأمراض الانسداد الرئوي المزمن",
        welcomeBack: "مرحباً بعودتك، {{name}}.",
        promptLogin: "يرجى الاتصال باستخدام الرمز الخاص بك.",
        logout: "تسجيل الخروج",
        languageSelectorLabel: "اختر اللغة",
        sos: "تنبيه طوارئ",
        profile: "ملفي الشخصي"
    },
    tabs: {
        trends: "الاتجاهات",
        smartphone: "الهاتف الذكي",
        mobility: "الحركة",
        treatment: "العلاج",
        assistant: "المساعد",
        aiFilter: "مرشح الذكاء الاصطناعي",
        aiFilterTooltip: "تفعيل/تعطيل مرشح تحليل الذكاء الاصطناعي",
    },
    riskScore: {
        score: "النتيجة",
        low: {
            title: "مخاطر منخفضة",
            description: "علاماتك الحيوية مستقرة. استمر في ذلك."
        },
        medium: {
            title: "مخاطر متوسطة",
            description: "بعض علاماتك الحيوية تحتاج إلى اهتمام. راقب أعراضك."
        },
        high: {
            title: "مخاطر عالية",
            description: "يرجى مراجعة خطة العمل الخاصة بك والنظر في الاتصال بطبيبك."
        }
    },
    vitals: {
        spo2: "تشبع الأكسجين",
        heartRate: "معدل ضربات القلب"
    },
    trendsChart: {
        heartRateKey: "معدل ضربات القلب",
        heartRateUnit: "ضربة/دقيقة",
        spo2Unit: "SpO2 (%)",
        alertThreshold: "عتبة التنبيه",
        criticalThreshold: "العتبة الحرجة"
    },
    smartphone: {
        title: "ملخص الهاتف الذكي",
        bestPractices: {
            title: "أفضل الممارسات للمراقبة الليلية:",
            placement: "ضع الهاتف على فراشك بالقرب من جذعك.",
            dnd: "قم بتفعيل وضع \"عدم الإزعاج\" لتجنب الإشعارات.",
            airplane: "قم بتفعيل \"وضع الطيران\" لتعطيل الموجات أثناء نومك."
        },
        activity: {
            title: "النشاط",
            steps: "الخطوات",
            sedentaryTime: "وقت الجلوس",
            walkingSpeed: "سرعة المشي"
        },
        sleep: {
            title: "النوم",
            duration: "المدة الإجمالية",
            efficiency: "الكفاءة",
            nightMovements: "الحركات الليلية"
        },
        cough: {
            title: "السعال",
            frequency: "التردد",
            nightEpisodes: "نوبات ليلية",
            respiratoryRate: "معدل التنفس"
        },
        environment: {
            title: "البيئة",
            airQuality: "جودة الهواء",
            homeTime: "الوقت في المنزل",
            temperature: "درجة الحرارة"
        },
        reported: {
            title: "البيانات المبلغ عنها",
            breathlessness: "ضيق التنفس",
            catScore: "درجة CAT",
            adherence: "الالتزام بالعلاج"
        }
    },
    mobility: {
        loading: "جارٍ تحميل بيانات الحركة...",
        permission: {
            title: "تفعيل تتبع الحركة",
            description: "لتوفير تحليل كامل لنشاطك اليومي، يحتاج الرقيب إلى الوصول إلى مستشعرات الحركة في هاتفك (مثل مقياس التسارع والجيروسكوب).",
            button: "منح الإذن"
        },
        startTracking: "بدء التتبع",
        stopTracking: "إيقاف التتبع",
        interval: "الفاصل الزمني",
        mobilityScore: "درجة الحركة",
        stepFrequency: "تردد الخطوات",
        movementSpeed: "سرعة الحركة",
        accelerometer: "مقياس التسارع",
        gyroscope: "الجيروسكوب",
        activities: {
            stationary: "ثابت",
            walking: "يمشي",
            running: "يجري",
            vehicle: "في مركبة"
        }
    },
    deviceManager: {
        title: "إدارة الأجهزة",
        total: "المجموع",
        connected: "متصل",
        oximeters: "مقاييس الأكسجة",
        devices: "الأجهزة",
        liveData: "البيانات الحية",
        statusActive: "نشط",
        statusInactive: "غير نشط",
        connect: "اتصال",
        connecting: "جارٍ الاتصال...",
        disconnect: "قطع الاتصال",
        waitingForData: "في انتظار البيانات...",
        connectToSeeData: "قم بتوصيل جهاز لرؤية القياسات الحية.",
        liveMeasurement: "القياس المباشر",
        quality: "الجودة",
        heartRateUnit: "معدل ضربات القلب (bpm)",
        scanning: "جارٍ البحث...",
        noDevicesFound: "لم يتم العثور على أجهزة",
        clickToScan: "انقر فوق أيقونة التحديث للبحث عن الأجهزة.",
        errors: {
            noDevicesFound: "لم يتم العثور على أجهزة. تأكد من أن جهازك قيد التشغيل وفي وضع الاقتران.",
            scanError: "خطأ أثناء البحث عن الأجهزة.",
            connectionFailed: "فشل الاتصال",
            unknownError: "خطأ غير معروف"
        }
    },
    chatbot: {
        title: "مساعد الصحة بالذكاء الاصطناعي",
        enableTTS: "تفعيل تحويل النص إلى كلام",
        disableTTS: "تعطيل تحويل النص إلى كلام",
        listening: "أستمع...",
        processing: "جارٍ التحليل...",
        askQuestion: "اسألني سؤالاً...",
        useVoiceInput: "استخدام الإدخال الصوتي",
        deviceConnected: "تم الاتصال بنجاح. يتم الآن إرسال البيانات الحية إلى الخادم لتحليلها.",
        deviceDisconnected: "لقد قمت بقطع الاتصال. توقفت المراقبة في الوقت الفعلي."
    },
    pairing: {
        title: "مرحباً بك في الرقيب",
        description: "للوصول إلى لوحة التحكم الشخصية الخاصة بك، يرجى إدخال رمز الاقتران الذي قدمه طبيبك.",
        codeLabel: "رمز الاقتران",
        connectButton: "اتصال",
        connecting: "جارٍ التحقق...",
        errors: {
            codeRequired: "الرجاء إدخال رمز الاقتران.",
            invalidCode: "رمز الاقتران غير صالح أو لم يتم العثور عليه. يرجى المحاولة مرة أخرى.",
            genericError: "حدث خطأ",
            connectionError: "حدث خطأ اتصال غير متوقع. تحقق من اتصالك بالإنترنت."
        }
    },
    treatment: {
        title: "علاجي",
        addMedication: "إضافة دواء",
        todaysSchedule: "جرعات اليوم",
        myMedications: "أدويتي",
        noMedications: "لم تتم إضافة أي أدوية.",
        noMedicationsDescription: "انقر على زر '+' لإضافة علاجك الأول.",
        noTasksToday: "لا توجد جرعات أخرى مجدولة لهذا اليوم.",
        taken: "تم أخذها",
        markAsTaken: "وضع علامة كـ 'تم أخذها'",
        missed: "فاتت",
        markAsMissed: "وضع علامة كـ 'فاتت'",
        errorMarkingTaken: "خطأ في تحديد الجرعة على أنها مأخوذة.",
        addModal: {
            title: "إضافة دواء جديد",
            editTitle: "تعديل الدواء",
            nameLabel: "اسم الدواء",
            dosageLabel: "الجرعة (مثال: قرص واحد، بختان)",
            frequencyLabel: "التكرار",
            timesLabel: "أوقات الجرعة",
            addTime: "إضافة وقت",
            everyDay: "كل يوم",
            twiceADay: "مرتان في اليوم",
            threeTimesADay: "3 مرات في اليوم",
            fourTimesADay: "4 مرات في اليوم",
            save: "حفظ",
            saving: "جارٍ الحفظ...",
            delete: "حذف",
            deleting: "جارٍ الحذف...",
            error: "يرجى ملء جميع الحقول.",
            confirmDelete: "هل أنت متأكد أنك تريد حذف {{name}}؟",
            errorGeneric: "حدث خطأ.",
            errorDelete: "فشل حذف الدواء."
        },
        notification: {
            title: "تذكير من الرقيب",
            body: "حان وقت تناول {{name}} ({{dosage}}).",
            permissionNeeded: "الإشعارات مطلوبة لتذكيرات الأدوية.",
            permissionGranted: "تم تفعيل الإشعارات.",
            permissionDenied: "تم تعطيل الإشعارات. لن تتلقى تذكيرات.",
            actions: {
                taken: "تم أخذها",
                snooze: "تذكير بعد 15 دقيقة"
            }
        }
    },
    profile: {
        title: "ملفي الشخصي",
        patientInfo: "معلومات المريض",
        emergencyContact: "جهة اتصال للطوارئ",
        emergencyContactDescription: "أضف شخصًا للاتصال به في حالة الطوارئ. ستبقى هذه المعلومات على جهازك.",
        nameLabel: "اسم جهة الاتصال",
        phoneLabel: "رقم الهاتف",
        save: "حفظ",
        saving: "جارٍ الحفظ...",
        success: "تم تحديث جهة اتصال الطوارئ.",
        noContact: "لم يتم تكوين جهة اتصال للطوارئ.",
        errorSave: "فشل حفظ جهة الاتصال."
    },
    emergency: {
        title: "تأكيد الطوارئ",
        confirmMessage: "أنت على وشك الاتصال بجهة اتصال الطوارئ الخاصة بك:",
        callButton: "إجراء مكالمة",
        smsButton: "إرسال رسالة نصية",
        cancelButton: "إلغاء",
        noContactTitle: "لا توجد جهة اتصال للطوارئ",
        noContactDescription: "يرجى إعداد جهة اتصال للطوارئ في ملفك الشخصي لاستخدام هذه الميزة.",
        configureButton: "إعداد الآن",
        smsBody: "مرحباً {{contactName}}. هذه رسالة تنبيه من {{patientName}} عبر تطبيق الرقيب. يرجى الاتصال به/بها.",
        callInitiated: "بدء الاتصال بـ {{contactName}}. اضغط على الزر الأخضر لبدء المكالمة. ابق هادئًا، المساعدة في الطريق."
    },
    errors: {
        loadData: "تعذر تحميل البيانات. تحقق من الاتصال بالخادم وتكوين Supabase.",
        connectionTitle: "خطأ في الاتصال",
        supabaseConfig: "يرجى تحديث قيم YOUR_SUPABASE_URL و YOUR_SUPABASE_ANON_KEY في ملف services/supabaseClient.ts باستخدام مفاتيح API Supabase الخاصة بك.",
        apiConnection: "أنا آسف، أواجه صعوبة في الاتصال الآن. يرجى المحاولة مرة أخرى لاحقًا.",
        aiWarningTitle: "خدمة الذكاء الاصطناعي غير مكونة",
        aiWarningMessage: "مفتاح API لخدمة Gemini غير متوفر. ميزات مساعد الذكاء الاصطناعي معطلة.",
        aiUnavailableTooltip: "مساعد الذكاء الاصطناعي معطل لعدم تكوين مفتاح API."
    },
    doctorDashboard: {
        addPatientError: "فشل في إضافة المريض.",
        totalPatients: "إجمالي المرضى",
        critical: "حالات حرجة",
        warnings: "تحذيرات",
        stable: "مستقر",
        patients: "المرضى",
        alerts: "التنبيهات",
        searchPlaceholder: "ابحث عن مريض...",
        allStatuses: "جميع الحالات",
        lowRisk: "مخاطر منخفضة",
        mediumRisk: "مخاطر متوسطة",
        highRisk: "مخاطر عالية",
        addPatient: "إضافة مريض",
        patientHeader: "المريض",
        riskScoreHeader: "درجة الخطورة",
        adherence7d: "الالتزام (7 أيام)",
        spo2HrHeader: "SpO2 / معدل النبض",
        trendHeader: "الاتجاه",
        statusHeader: "الحالة",
        actionsHeader: "الإجراءات",
        details: "التفاصيل",
        view: "عرض",
        riskLevels: {
            low: "منخفض",
            medium: "متوسط",
            high: "مرتفع"
        },
        patientInfo: "معلومات المريض",
        emergencyContact: "جهة اتصال للطوارئ",
        adherenceDetailTitle: "الالتزام الدوائي",
        currentMedications: "الأدوية الحالية",
        scheduledTimes: "الأوقات المجدولة"
    },
    patientDetail: {
        loadingPrediction: "جارٍ تحميل التحليل التنبؤي...",
        hourlyActivity: "النشاط كل ساعة (24 ساعة)",
        mobilityHeatmap: "خريطة حرارية للحركة في المنزل",
        loadingChat: "جارٍ تحميل سجل الدردشة...",
        noChatHistory: "لم يتم العثور على سجل دردشة لهذا المريض.",
        title: "لوحة تحكم {{name}}",
        liveAnalysis: "تحليل مباشر",
        chatHistory: "سجل المساعد"
    },
    prediction: {
        cardTitle: "توقع التفاقم (AI)",
        riskTitle: "خطر التفاقم خلال 72 ساعة",
        confidence: "الثقة",
        factorsTitle: "العوامل المساهمة الرئيسية",
        impacts: {
            high: "مرتفع",
            medium: "متوسط",
            low: "منخفض"
        },
        recommendationsTitle: "الإجراءات الموصى بها"
    },
    alerts: {
        cardTitle: "التنبيهات والتشوهات الأخيرة",
        noAnomalies: "لم يتم الكشف عن أي تشوهات مؤخرًا.",
        types: {
            vital_sign_anomaly: "شذوذ في العلامات الحيوية",
            mobility_decline: "انخفاض الحركة",
            sleep_disruption: "اضطراب النوم",
            cough_increase: "زيادة السعال"
        },
        severity: "الشدة:"
    },
    realTimeChart: {
        steps: "خطوات",
        activeMinutes: "دقائق نشطة"
    },
    heatmap: {
        lowActivity: "منخفض",
        highActivity: "مرتفع"
    },
    addPatientModal: {
        errorRequired: "يرجى ملء جميع الحقول.",
        patientCreationFail: "فشل إنشاء المريض.",
        errorGeneric: "حدث خطأ. يرجى المحاولة مرة أخرى.",
        nameLabel: "الاسم الكامل",
        ageLabel: "العمر",
        conditionLabel: "الحالة الرئيسية",
        conditionPlaceholder: "مثال: انسداد رئوي مزمن حاد",
        cancel: "إلغاء",
        adding: "جارٍ الإضافة...",
        addAndGetCode: "إضافة والحصول على الرمز",
        successTitle: "تمت إضافة المريض!",
        successDescription: "شارك هذا الرمز الفريد مع المريض حتى يتمكن من الاتصال بتطبيقه.",
        pairingCode: "رمز الاقتران للمريض",
        copied: "تم النسخ!",
        addAnother: "إضافة مريض آخر",
        done: "تم",
        titleSuccess: "رمز لـ {{name}}",
        title: "إضافة مريض جديد",
        subtitleSuccess: "يمكن للمريض الآن استخدام هذا الرمز.",
        subtitle: "املأ المعلومات أدناه."
    },
    chatHistory: {
        title: "سجل المحادثة"
    },
    patientInfo: {
        name: "الاسم",
        age: "العمر",
        condition: "الحالة",
        pairingCode: "رمز الاقتران",
        notConfigured: "غير مهيأ"
    },
    medicationAdherence: {
        noMedication: "لا توجد أدوية مهيأة."
    },
    footer: {
        copyright: "© 2025 الرقيب: تطبيق تم تطويره بواسطة الدكتور زهير السويسي. جميع الحقوق محفوظة"
    }
};
