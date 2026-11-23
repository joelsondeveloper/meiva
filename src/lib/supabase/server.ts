import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase para o SERVIDOR (route handlers, server actions).
 *
 * Usa a service role key, que IGNORA o RLS. Nunca importe este arquivo em
 * componente "use client" e nunca exponha a chave com prefixo NEXT_PUBLIC_.
 */

export function getSupabaseServerClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY não definidas (veja .env.example).",
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
