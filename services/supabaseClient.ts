
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// IMPORTANT: Remplacez ces valeurs par l'URL et la clé Anon de votre projet Supabase.
// Vous pouvez les trouver dans les paramètres API de votre projet Supabase.
const supabaseUrl: string = "https://kjwncksyayqmevulcpef.supabase.co"; // Exemple : "https://abcedfghijklmnopqrst.supabase.co"
const supabaseAnonKey: string = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtqd25ja3N5YXlxbWV2dWxjcGVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxNjIxNjUsImV4cCI6MjA3MTczODE2NX0.ewHJJdWWv-pKTpVHqQmq-KD2rTZ1z_gnQipdYDX0hgA"; // Exemple : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdX..."

let supabaseInstance: SupabaseClient | null = null;

// On vérifie que les valeurs par défaut ont bien été changées.
const isConfigured = supabaseUrl !== "VOTRE_URL_SUPABASE" && supabaseAnonKey !== "VOTRE_CLE_ANON_SUPABASE";

if (isConfigured) {
    try {
        // On valide que l'URL a un format correct avant d'initialiser le client.
        // Cela évite un crash si l'URL copiée est malformée.
        new URL(supabaseUrl);
        supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
    } catch (e) {
        console.error("L'URL Supabase fournie dans `services/supabaseClient.ts` n'est pas valide :", supabaseUrl);
        // supabaseInstance reste null, ce qui déclenchera l'erreur dans l'interface.
    }
} else {
    // Si ce n'est pas configuré, on affiche un message clair dans la console pour le développeur.
    console.error("Veuillez configurer votre URL et votre clé Supabase dans le fichier `services/supabaseClient.ts`.");
}

// On exporte l'instance, qui sera `null` si la configuration est absente ou invalide.
// Le reste de l'application est conçu pour gérer ce cas et afficher une erreur à l'utilisateur.
export const supabase = supabaseInstance;