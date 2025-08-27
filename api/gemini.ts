import { GoogleGenAI, Type } from '@google/genai';
import type { PatientData, ChatMessage, RiskLevel } from '../types';

export const config = {
  runtime: 'edge',
};

type Language = 'fr' | 'en' | 'ar';

// --- System Instruction Helper ---
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
            }
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
            }
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
            }
        }
    }
    return instruction;
};


// --- Main Handler ---
export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return new Response('API key is not configured on the server.', { status: 500 });
  }

  const ai = new GoogleGenAI({ apiKey });
  const body = await req.json();
  const { type, lang = 'fr' } = body;

  try {
    switch (type) {
        case 'greeting':
            return handleGreeting(ai, lang);
        case 'stream':
            return handleStream(ai, body.history, body.patientData, lang);
        case 'proactive_question':
            return handleProactiveQuestion(ai, body.patientData, body.riskLevel, lang);
        case 'analyze_response':
            return handleAnalyzeResponse(ai, body.originalQuestion, body.userResponse, body.patientData, lang);
        default:
            return new Response('Invalid request type', { status: 400 });
    }
  } catch (error) {
    console.error(`Error in Gemini API handler for type "${type}":`, error);
    return new Response('An error occurred while processing your request.', { status: 500 });
  }
}

// --- Handler Functions for Each Type ---

async function handleGreeting(ai: GoogleGenAI, lang: Language) {
    const prompt = lang === 'en' 
        ? "Give me a friendly and short greeting to start the day."
        : lang === 'ar'
        ? "أعطني تحية ودية وقصيرة لبدء اليوم."
        : "Donnez-moi un message d'accueil amical et court pour commencer la journée.";
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{role: 'user', parts: [{text: prompt}]}],
        config: { systemInstruction: getSystemInstruction(undefined, lang) }
    });

    return new Response(JSON.stringify({ text: response.text }), { headers: { 'Content-Type': 'application/json' } });
}

async function handleStream(ai: GoogleGenAI, history: ChatMessage[], patientData: PatientData, lang: Language) {
    const contents = history.map((msg: ChatMessage) => ({
      role: msg.role,
      parts: [{ text: msg.text }],
    }));

    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        systemInstruction: getSystemInstruction(patientData, lang),
      },
    });

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        for await (const chunk of responseStream) {
          controller.enqueue(encoder.encode(chunk.text));
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });
}

async function handleProactiveQuestion(ai: GoogleGenAI, patientData: PatientData, riskLevel: RiskLevel, lang: Language) {
    const translatedRisk = lang === 'en' ? riskLevel : lang === 'ar' ? (riskLevel === 'High' ? 'مرتفع' : riskLevel === 'Medium' ? 'متوسط' : 'منخفض') : (riskLevel === 'High' ? 'Élevé' : riskLevel === 'Medium' ? 'Moyen' : 'Faible');
    const prompt = lang === 'en' ? `Generate an empathetic multiple-choice question for a COPD patient whose risk level is now ${translatedRisk}. Focus on potential causes like low activity, poor sleep, or high breathlessness. Provide 3 concise options.` : lang === 'ar' ? `أنشئ سؤالاً متعاطفًا متعدد الخيارات لمريض COPD أصبح مستوى الخطر لديه الآن ${translatedRisk}. ركز على الأسباب المحتملة مثل انخفاض النشاط أو قلة النوم أو ضيق التنفس الشديد. قدم 3 خيارات موجزة.` : `Générez une question à choix multiples empathique pour un patient BPCO dont le niveau de risque est maintenant ${translatedRisk}. Concentrez-vous sur les causes potentielles comme une faible activité, un mauvais sommeil ou un essoufflement élevé. Fournissez 3 options concises.`;

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
                    options: { type: Type.ARRAY, items: { type: Type.STRING } }
                }
            }
        }
    });

    return new Response(response.text, { headers: { 'Content-Type': 'application/json' } });
}

async function handleAnalyzeResponse(ai: GoogleGenAI, originalQuestion: string, userResponse: string, patientData: PatientData, lang: Language) {
    const prompt = lang === 'en' ? `A patient was asked: "${originalQuestion}". They replied: "${userResponse}". Generate a short, empathetic, reassuring follow-up message in English (less than 50 words).` : lang === 'ar' ? `سُئل مريض: "${originalQuestion}". فأجاب: "${userResponse}". أنشئ رسالة متابعة قصيرة ومتعاطفة ومطمئنة باللغة العربية (أقل من 50 كلمة).` : `Un patient a été interrogé : "${originalQuestion}". Il a répondu : "${userResponse}". Générez un message de suivi court, empathique et rassurant en français (moins de 50 mots).`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: { systemInstruction: getSystemInstruction(patientData, lang) }
    });

    return new Response(JSON.stringify({ text: response.text }), { headers: { 'Content-Type': 'application/json' } });
}