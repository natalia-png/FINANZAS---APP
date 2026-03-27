import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

  if (!url.startsWith('http')) {
    // Durante build/SSR sin configuración real, devuelve un cliente vacío
    return createBrowserClient('https://placeholder.supabase.co', key || 'placeholder')
  }

  return createBrowserClient(url, key)
}
