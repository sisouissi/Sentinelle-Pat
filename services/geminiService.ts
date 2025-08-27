import type { PatientData, ChatMessage, RiskLevel } from '../types';

// La clé API a été déplacée vers le backend (api/gemini.ts).
// Le frontend n'a plus besoin de la connaître.
// Nous considérons que l'IA est toujours disponible si le backend est configuré.
export const isAiAvailable = true;

type Language = 'fr' | 'en' | 'ar';

export async function getInitialGreeting(lang: Language = 'fr'): Promise<string> {
    const fallbackGreeting = lang === 'en' 
        ? "Hello! I am your AI health assistant. How are you feeling today?"
        : lang === 'ar'
        ? "مرحباً! أنا مساعدك الصحي بالذكاء الاصطناعي. كيف تشعر اليوم؟"
        : "Bonjour ! Je suis votre assistant de santé IA. Comment vous sentez-vous aujourd'hui ?";
    
    try {
        const response = await fetch('/api/gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'greeting', lang }),
        });
        if (!response.ok) throw new Error('Failed to fetch initial greeting');
        const data = await response.json();
        return data.text;
    } catch (error) {
        console.error("Error getting initial greeting from backend:", error);
        return fallbackGreeting;
    }
}

export async function* getAIResponseStream(
    history: ChatMessage[],
    patientData: PatientData,
    lang: Language = 'fr'
): AsyncGenerator<string, void, undefined> {
    
    try {
        const response = await fetch('/api/gemini', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ type: 'stream', history, patientData, lang }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API error: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
            throw new Error('Failed to get response reader');
        }

        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                break;
            }
            yield decoder.decode(value, { stream: true });
        }

    } catch (error) {
        console.error("Error getting AI response stream from backend:", error);
        if (lang === 'en') yield "I'm sorry, I encountered an error. Please try again.";
        else if (lang === 'ar') yield "أنا آسف، لقد واجهت خطأ. يرجى المحاولة مرة أخرى.";
        else yield "Je suis désolé, j'ai rencontré une erreur. Veuillez réessayer.";
    }
}

export async function getProactiveQuestion(patientData: PatientData, riskLevel: RiskLevel, lang: Language = 'fr'): Promise<ChatMessage | null> {
    try {
        const response = await fetch('/api/gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'proactive_question', patientData, riskLevel, lang }),
        });

        if (!response.ok) throw new Error('Failed to fetch proactive question');
        
        const json = await response.json();
        
        return {
            role: 'model',
            text: json.question,
            questionType: json.type,
            options: json.options,
        };

    } catch (error) {
        console.error("Error generating proactive question from backend:", error);
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

    try {
        const response = await fetch('/api/gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'analyze_response', originalQuestion, userResponse, patientData, lang }),
        });

        if (!response.ok) throw new Error('Failed to fetch analysis response');
        
        const data = await response.json();
        return data.text;
    } catch (error) {
        console.error("Error analyzing user response from backend:", error);
        return fallbackResponse;
    }
}