
import type { PatientData, ChatMessage, RiskLevel } from '../types';

// In demo mode, AI is always available.
export const isAiAvailable = true;

type Language = 'fr' | 'en' | 'ar';

export async function getInitialGreeting(lang: Language = 'fr'): Promise<string> {
    const greetings = {
        fr: "Bonjour ! Je suis votre assistant de santé IA. Comment puis-je vous aider aujourd'hui ?",
        en: "Hello! I am your AI health assistant. How can I help you today?",
        ar: "مرحباً! أنا مساعدك الصحي بالذكاء الاصطناعي. كيف يمكنني مساعدتك اليوم؟"
    };
    return Promise.resolve(greetings[lang]);
}

export async function* getAIResponseStream(
    history: ChatMessage[],
    patientData: PatientData,
    lang: Language = 'fr'
): AsyncGenerator<string, void, undefined> {
    
    const responses = {
        fr: "Bien sûr. D'après vos dernières données, votre saturation en oxygène est stable. C'est une bonne nouvelle. Assurez-vous de bien suivre votre traitement et de vous reposer suffisamment. N'hésitez pas si vous avez d'autres questions.",
        en: "Of course. Based on your latest data, your oxygen saturation is stable. That's good news. Make sure to follow your treatment plan and get enough rest. Don't hesitate if you have other questions.",
        ar: "بالطبع. بناءً على أحدث بياناتك، فإن تشبع الأكسجين لديك مستقر. هذه أخبار جيدة. تأكد من اتباع خطة العلاج الخاصة بك والحصول على قسط كافٍ من الراحة. لا تتردد إذا كان لديك أسئلة أخرى."
    };
    const fullText = responses[lang] || responses['fr'];
    
    for (const char of fullText) {
        yield char;
        await new Promise(resolve => setTimeout(resolve, 15)); // Simulate streaming delay
    }
}

export async function getProactiveQuestion(patientData: PatientData, riskLevel: RiskLevel, lang: Language = 'fr'): Promise<ChatMessage | null> {
    const questions = {
        fr: {
            role: 'model' as const,
            text: "J'ai remarqué une légère baisse de votre activité aujourd'hui. Comment vous sentez-vous ?",
            questionType: 'multiple_choice' as const,
            options: ['Je me sens bien', 'Un peu plus fatigué que d\'habitude', 'J\'ai plus de mal à respirer'],
        },
        en: {
            role: 'model' as const,
            text: "I've noticed a slight decrease in your activity today. How are you feeling?",
            questionType: 'multiple_choice' as const,
            options: ['I feel fine', 'A bit more tired than usual', 'I have more trouble breathing'],
        },
        ar: {
            role: 'model' as const,
            text: "لاحظت انخفاضًا طفيفًا في نشاطك اليوم. كيف تشعر؟",
            questionType: 'multiple_choice' as const,
            options: ['أشعر أنني بحالة جيدة', 'أشعر بالتعب أكثر من المعتاد', 'أواجه صعوبة أكبر في التنفس'],
        }
    };
    return Promise.resolve(questions[lang] || questions['fr']);
}

export async function analyzeUserResponse(
    originalQuestion: string,
    userResponse: string,
    patientData: PatientData,
    lang: Language = 'fr'
): Promise<string> {
    const responses = {
        fr: "Merci pour cette information. Je l'ai notée. N'hésitez pas à me solliciter si vous avez d'autres questions. Pensez à bien vous hydrater.",
        en: "Thank you for that information. I've made a note of it. Feel free to reach out if you have any other questions. Remember to stay hydrated.",
        ar: "شكراً لك على هذه المعلومة. لقد سجلتها. لا تتردد في التواصل معي إذا كان لديك أي أسئلة أخرى. تذكر أن تشرب كمية كافية من الماء."
    };
    return Promise.resolve(responses[lang] || responses['fr']);
}
