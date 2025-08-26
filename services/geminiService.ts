import { GoogleGenAI, Type } from '@google/genai';
import type { PatientData, ChatMessage, RiskLevel } from '../types';
import { translations } from '../locales/fr'; // Default language for structure

// The API key is retrieved from the environment variable `process.env.API_KEY`.
// This variable is expected to be set in the deployment environment (e.g., Vercel).
const API_KEY = process.env.API_KEY;

// Check if the API key is provided.
export const isAiAvailable = !!API_KEY;


if (!isAiAvailable) {
  console.warn("La clé API Gemini (API_KEY) n'est pas configurée dans les variables d'environnement. Les fonctionnalités d'IA seront désactivées.");
}

// Initialize the AI only if the API key is provided.
const ai = isAiAvailable ? new GoogleGenAI({ apiKey: API_KEY }) : null;

type Language = 'fr' | 'en' | 'ar';

const getSystemInstruction = (patientData?: PatientData, lang: Language = 'fr') => {
    let instruction;
    if (lang === 'en') {
        instruction = `You are "Sentinel AI", a friendly and empathetic AI health assistant for COPD patients. Your primary goal is to help the user monitor their condition, understand their data, and follow their health plan. Be reassuring, clear, and concise. Never provide a medical diagnosis. Always advise consulting a doctor for medical advice.

Current user context:
`;
        if (patientData) {
            const latestMeasurement = patientData.measurements.length > 0 ? patientData.measurements[patientData.measurements.length - 1] : null;
            instruction += `- Condition: ${patientData.condition}, Age: ${patientData.age}\n`;
            if (latestMeasurement) {
                instruction += `- Latest SpO2: ${latestMeasurement.spo2}%\n`;
                instruction += `- Latest Heart Rate: ${latestMeasurement.heartRate} bpm\n`;
            } else {
                instruction += `- No recent vital signs available.\n`;
            }
            instruction += `- Steps today: ${patientData.smartphone.activity.steps}\n`;
            instruction += `- Medication Adherence (last 7 days): ${patientData.smartphone.reported.medication.adherencePercent}%\n`;
        } else {
            instruction += `- No patient data available.`;
        }
    } else if (lang === 'ar') {
        instruction = `أنت "الرقيب AI"، مساعد صحي يعمل بالذكاء الاصطناعي، ودود ومتعاطف مع مرضى الانسداد الرئوي المزمن. هدفك الأساسي هو مساعدة المستخدم على مراقبة حالته، وفهم بياناته، واتباع خطته الصحية. كن مطمئناً وواضحاً وموجزاً. لا تقدم أبداً تشخيصاً طبياً. انصح دائماً باستشارة الطبيب للحصول على مشورة طبية.

سياق المستخدم الحالي:
`;
        if (patientData) {
            const latestMeasurement = patientData.measurements.length > 0 ? patientData.measurements[patientData.measurements.length - 1] : null;
            instruction += `- الحالة: ${patientData.condition}, العمر: ${patientData.age}\n`;
            if (latestMeasurement) {
                instruction += `- آخر قياس لـ SpO2: ${latestMeasurement.spo2}%\n`;
                instruction += `- آخر قياس لمعدل ضربات القلب: ${latestMeasurement.heartRate} bpm\n`;
            } else {
                instruction += `- لا توجد علامات حيوية حديثة متاحة.\n`;
            }
            instruction += `- عدد الخطوات اليوم: ${patientData.smartphone.activity.steps}\n`;
            instruction += `- الالتزام بالأدوية (آخر 7 أيام): ${patientData.smartphone.reported.medication.adherencePercent}%\n`;
        } else {
            instruction += `- لا توجد بيانات للمريض متاحة.`;
        }
    } else {
        instruction = `Vous êtes "Sentinelle IA", un assistant de santé IA amical et empathique pour les patients atteints de BPCO. Votre objectif principal est d'aider l'utilisateur à surveiller son état, à comprendre ses données et à suivre son plan de santé. Soyez rassurant, clair et concis. Ne fournissez jamais de diagnostic médical. Conseillez toujours de consulter un médecin pour un avis médical.
    
Contexte utilisateur actuel :
`;
        if (patientData) {
            const latestMeasurement = patientData.measurements.length > 0 ? patientData.measurements[patientData.measurements.length - 1] : null;
            instruction += `- Condition : ${patientData.condition}, Âge : ${patientData.age}\n`;
            if (latestMeasurement) {
                instruction += `- Dernière SpO2 : ${latestMeasurement.spo2}%\n`;
                instruction += `- Dernière fréquence cardiaque : ${latestMeasurement.heartRate} bpm\n`;
            } else {
                instruction += `- Aucune mesure de signes vitaux récente disponible.\n`;
            }
            instruction += `- Pas aujourd'hui : ${patientData.smartphone.activity.steps}\n`;
            instruction += `- Adhésion au traitement (7 derniers jours) : ${patientData.smartphone.reported.medication.adherencePercent}%\n`;
        } else {
            instruction += `- Aucune donnée patient disponible.`;
        }
    }
    return instruction;
};


export async function getInitialGreeting(lang: Language = 'fr'): Promise<string> {
    const fallbackGreeting = lang === 'en' 
        ? "Hello! I am your AI health assistant. How are you feeling today?"
        : lang === 'ar'
        ? "مرحباً! أنا مساعدك الصحي بالذكاء الاصطناعي. كيف تشعر اليوم؟"
        : "Bonjour ! Je suis votre assistant de santé IA. Comment vous sentez-vous aujourd'hui ?";
        
    if (!ai) return fallbackGreeting;

    const prompt = lang === 'en' 
        ? "Give me a friendly and short greeting to start the day."
        : lang === 'ar'
        ? "أعطني تحية ودية وقصيرة لبدء اليوم."
        : "Donnez-moi un message d'accueil amical et court pour commencer la journée.";

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{role: 'user', parts: [{text: prompt}]}],
            config: { systemInstruction: getSystemInstruction(undefined, lang) }
        });
        return response.text;
    } catch (error) {
        console.error("Error getting initial greeting:", error);
        return fallbackGreeting;
    }
}

export async function* getAIResponseStream(
    history: ChatMessage[],
    patientData: PatientData,
    lang: Language = 'fr'
): AsyncGenerator<string, void, undefined> {
    
    if (!ai) {
      if (lang === 'en') yield "The AI service is not configured. Please contact support.";
      else if (lang === 'ar') yield "خدمة الذكاء الاصطناعي غير مكونة. يرجى الاتصال بالدعم.";
      else yield "Le service IA n'est pas configuré. Veuillez contacter le support.";
      return;
    }

    const contents = history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
    }));

    try {
        const responseStream = await ai.models.generateContentStream({
            model: 'gemini-2.5-flash',
            contents: contents,
            config: {
                systemInstruction: getSystemInstruction(patientData, lang)
            }
        });

        for await (const chunk of responseStream) {
            yield chunk.text;
        }
    } catch (error) {
        console.error("Error getting AI response stream:", error);
        if (lang === 'en') yield "I'm sorry, I encountered an error. Please try again.";
        else if (lang === 'ar') yield "أنا آسف، لقد واجهت خطأ. يرجى المحاولة مرة أخرى.";
        else yield "Je suis désolé, j'ai rencontré une erreur. Veuillez réessayer.";
    }
}

export async function getProactiveQuestion(patientData: PatientData, riskLevel: RiskLevel, lang: Language = 'fr'): Promise<ChatMessage | null> {
    if (!ai) return null;

    const latestMeasurement = patientData.measurements.length > 0 ? patientData.measurements[patientData.measurements.length - 1] : null;

    const translatedRisk = lang === 'en'
        ? riskLevel
        : lang === 'ar'
        ? riskLevel === 'High' ? 'مرتفع' : riskLevel === 'Medium' ? 'متوسط' : 'منخفض'
        : riskLevel === 'High' ? 'Élevé' : riskLevel === 'Medium' ? 'Moyen' : 'Faible';

    const vitalsPrompt = latestMeasurement
        ? `- SpO2: ${latestMeasurement.spo2}%\n    - Heart Rate: ${latestMeasurement.heartRate} bpm\n`
        : `- Vital signs data not available.\n`;

    let prompt;
    if (lang === 'en') {
        prompt = `Based on the following patient data, generate an empathetic and relevant multiple-choice question to gather more subjective context. The patient's risk level has just been identified as ${translatedRisk}.

Patient Data:
${vitalsPrompt}- Steps today: ${patientData.smartphone.activity.steps}
- Reported breathlessness: ${patientData.smartphone.reported.symptoms.breathlessness}/10
- Hours of sleep: ${patientData.smartphone.sleep.totalSleepHours}
- Medication adherence: ${patientData.smartphone.reported.medication.adherencePercent}%

Instructions:
1. The question should be directly related to a potential reason for the increased risk. For example, if adherence is low, ask about it. If breathlessness is high, ask about it.
2. Provide 3 concise and distinct options for the user to choose from.
3. The tone should be caring and encouraging, not alarming.
4. The question and options must be in English.`;
    } else if (lang === 'ar') {
        prompt = `بناءً على بيانات المريض التالية، قم بإنشاء سؤال متعاطف وذي صلة متعدد الخيارات لجمع المزيد من السياق الشخصي. تم تحديد مستوى خطورة المريض للتو على أنه ${translatedRisk}.

بيانات المريض:
${vitalsPrompt}- عدد الخطوات اليوم: ${patientData.smartphone.activity.steps}
- ضيق التنفس المبلغ عنه: ${patientData.smartphone.reported.symptoms.breathlessness}/10
- ساعات النوم: ${patientData.smartphone.sleep.totalSleepHours}
- الالتزام بالدواء: ${patientData.smartphone.reported.medication.adherencePercent}%

التعليمات:
1. يجب أن يكون السؤال مرتبطًا مباشرة بسبب محتمل لزيادة المخاطر. على سبيل المثال، إذا كان الالتزام منخفضًا، اسأل عنه. إذا كان ضيق التنفس مرتفعًا، اسأل عنه.
2. قدم 3 خيارات موجزة ومميزة ليختار المستخدم من بينها.
3. يجب أن تكون النبرة مهتمة ومشجعة، وليست مقلقة.
4. يجب أن يكون السؤال والخيارات باللغة العربية.`;
    } else {
        prompt = `En vous basant sur les données patient suivantes, générez une question à choix multiples, empathique et pertinente pour recueillir plus de contexte subjectif. Le niveau de risque du patient vient d'être identifié comme ${translatedRisk}.

Données du patient :
${vitalsPrompt}    - Pas aujourd'hui : ${patientData.smartphone.activity.steps}
    - Essoufflement rapporté : ${patientData.smartphone.reported.symptoms.breathlessness}/10
    - Heures de sommeil : ${patientData.smartphone.sleep.totalSleepHours}
    - Adhésion au traitement : ${patientData.smartphone.reported.medication.adherencePercent}%

Instructions :
1. La question doit être directement liée à une raison potentielle de l'augmentation du risque. Par exemple, si l'adhésion est faible, demandez pourquoi. Si l'essoufflement est élevé, posez une question à ce sujet.
2. Fournissez 3 options concises et distinctes parmi lesquelles l'utilisateur peut choisir.
3. Le ton doit être bienveillant et encourageant, pas alarmant.
4. La question et les options doivent être en français.`;
    }


    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: {
                systemInstruction: getSystemInstruction(patientData, lang),
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        question: { type: Type.STRING },
                        type: { type: Type.STRING },
                        options: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        }
                    }
                }
            }
        });

        const json = JSON.parse(response.text);
        return {
            role: 'model',
            text: json.question,
            questionType: json.type,
            options: json.options,
        };

    } catch (error) {
        console.error("Error generating proactive question:", error);
        return {
            role: 'model',
            text: lang === 'en' ? "I've noticed a change in your measurements. How are you feeling right now?" : lang === 'ar' ? "لقد لاحظت تغيراً في قياساتك. كيف تشعر الآن؟" : "J'ai remarqué un changement dans vos mesures. Comment vous sentez-vous en ce moment ?",
        };
    }
}


export async function analyzeUserResponse(
    originalQuestion: string,
    userResponse: string,
    patientData: PatientData,
    lang: Language = 'fr'
): Promise<string> {
    const fallbackResponse = lang === 'en' 
        ? "Thank you for sharing that with me. Please continue to monitor how you feel and rest if you need to."
        : lang === 'ar'
        ? "شكراً لمشاركتك هذا معي. يرجى الاستمرار في مراقبة شعورك والراحة إذا احتجت إلى ذلك."
        : "Merci d'avoir partagé cela avec moi. Continuez à surveiller comment vous vous sentez et reposez-vous si nécessaire.";

    if (!ai) return fallbackResponse;

    let prompt;
    if (lang === 'en') {
        prompt = `A patient was asked the following question based on their health data: "${originalQuestion}".
    
The patient replied: "${userResponse}".

Based on their response, generate a short, empathetic, and reassuring follow-up message in English.
- Acknowledge their response.
- If the response is concerning, gently advise them to monitor their symptoms and rest.
- Do not give medical advice.
- The message should be less than 50 words.`;
    } else if (lang === 'ar') {
        prompt = `تم طرح السؤال التالي على المريض بناءً على بياناته الصحية: "${originalQuestion}".
    
أجاب المريض: "${userResponse}".

بناءً على إجابته، قم بإنشاء رسالة متابعة قصيرة ومتعاطفة ومطمئنة باللغة العربية.
- اعترف بإجابته.
- إذا كانت الإجابة مقلقة، انصحه بلطف بمراقبة أعراضه والراحة.
- لا تقدم نصيحة طبية.
- يجب أن تكون الرسالة أقل من 50 كلمة.`;
    } else {
        prompt = `Un patient a reçu la question suivante basée sur ses données de santé : "${originalQuestion}".
    
Le patient a répondu : "${userResponse}".

En fonction de sa réponse, générez un message de suivi court, empathique et rassurant en français.
- Accusez réception de sa réponse.
- Si la réponse est préoccupante, conseillez-lui gentiment de surveiller ses symptômes et de se reposer.
- Ne donnez pas de conseils médicaux.
- Le message doit faire moins de 50 mots.`;
    }

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: {
                systemInstruction: getSystemInstruction(patientData, lang)
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error analyzing user response:", error);
        return fallbackResponse;
    }
}