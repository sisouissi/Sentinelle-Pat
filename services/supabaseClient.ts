import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl: string = "https://kjwncksyayqmevulcpef.supabase.co";
const supabaseAnonKey: string = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtqd25ja3N5YXlxbWV2dWxjcGVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxNjIxNjUsImV4cCI6MjA3MTczODE2NX0.ewHJJdWWv-pKTpVHqQmq-KD2rTZ1z_gnQipdYDX0hgA";

let supabaseInstance: SupabaseClient | null = null;

// Configuration pour éviter les verrous et timeouts
const supabaseConfig = {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
    flowType: 'implicit' as const
  },
  realtime: {
    params: {
      eventsPerSecond: 1
    }
  },
  global: {
    headers: {
      'x-client-info': 'supabase-js-web'
    }
  },
  db: {
    schema: 'public'
  }
};

// Validation et initialisation
function initializeSupabase(): SupabaseClient | null {
  try {
    // Vérification des paramètres
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Configuration Supabase manquante");
      return null;
    }

    if (supabaseUrl === "VOTRE_URL_SUPABASE" || supabaseAnonKey === "VOTRE_CLE_ANON_SUPABASE") {
      console.error("Veuillez configurer vos clés Supabase");
      return null;
    }

    // Validation de l'URL
    new URL(supabaseUrl);

    // Création du client avec configuration anti-timeout
    const client = createClient(supabaseUrl, supabaseAnonKey, supabaseConfig);
    
    console.log("Supabase client initialized successfully");
    return client;

  } catch (error) {
    console.error("Erreur lors de l'initialisation Supabase:", error);
    return null;
  }
}

// Initialisation du client
supabaseInstance = initializeSupabase();

// Nettoyage préventif des verrous existants
if (typeof window !== 'undefined' && 'navigator' in window && 'locks' in navigator) {
  // Libère les verrous existants si possible
  navigator.locks.query().then((locks) => {
    const supabaseLocks = locks.held?.filter(lock => lock.name?.includes('sb-')) || [];
    if (supabaseLocks.length > 0) {
      console.log("Verrous Supabase détectés, redémarrage recommandé");
    }
  }).catch(() => {
    // Ignore les erreurs de locks API
  });
}

export const supabase = supabaseInstance;
