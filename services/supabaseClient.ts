import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl: string = "https://kjwncksyayqmevulcpef.supabase.co";
const supabaseAnonKey: string = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtqd25ja3N5YXlxbWV2dWxjcGVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxNjIxNjUsImV4cCI6MjA3MTczODE2NX0.ewHJJdWWv-pKTpVHqQmq-KD2rTZ1z_gnQipdYDX0hgA";

let supabaseInstance: SupabaseClient | null = null;

// Vérification de la configuration
const isValidUrl = (url: string): boolean => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

const isConfigured = 
    supabaseUrl && 
    supabaseAnonKey && 
    supabaseUrl !== "VOTRE_URL_SUPABASE" && 
    supabaseAnonKey !== "VOTRE_CLE_ANON_SUPABASE" &&
    isValidUrl(supabaseUrl);

if (isConfigured) {
    try {
        supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
            auth: {
                persistSession: false,
            },
        });
        console.log("Supabase client initialized successfully");
    } catch (error) {
        console.error("Failed to initialize Supabase client:", error);
        supabaseInstance = null;
    }
} else {
    console.error("Supabase configuration is invalid or missing");
    supabaseInstance = null;
}

// Export du client Supabase
export const supabase = supabaseInstance;
