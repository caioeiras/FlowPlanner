import { createClient } from '@supabase/supabase-js'

// Conexão com o banco. As chaves entram na Etapa 7 (arquivo .env.local).
// Enquanto não existirem, `supabase` fica null e o app roda com o mock.
const url = import.meta.env?.VITE_SUPABASE_URL
// Chave publicável (sb_publishable_...).
const key = import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY

export const supabase = url && key ? createClient(url, key) : null
