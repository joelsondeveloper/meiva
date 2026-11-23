import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase para o NAVEGADOR (componentes "use client").
 *
 * Usa a anon key, que é pública por definição. A segurança dos dados vem
 * das policies de RLS no banco, não de esconder essa chave.
 */

let browserClient: SupabaseClient | null = null;

export function getSupabaseBrowserClient(): SupabaseClient {
  if (browserClient) return browserClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY não definidas (veja .env.example).",
    );
  }

  browserClient = createClient(url, anonKey);
  return browserClient;
}
