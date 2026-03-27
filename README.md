# Finanzas App

App de finanzas personales construida con Next.js 16 y Supabase.

## Desarrollo local

1. Instala dependencias:

```bash
npm install
```

2. Crea el archivo `.env.local` con estas variables:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

3. Inicia el proyecto:

```bash
npm run dev
```

La app quedara disponible en `http://localhost:3000`.

## Verificar antes de desplegar

```bash
npm run build
```

## Despliegue en Vercel

### Opcion 1: desde la web de Vercel

1. Sube este proyecto a GitHub.
2. Entra a Vercel y crea un proyecto nuevo importando ese repositorio.
3. Si el repositorio contiene varias carpetas, usa `finanzas-app` como `Root Directory`.
4. Agrega estas variables de entorno en Vercel:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

5. Ejecuta el deploy.

### Opcion 2: con Vercel CLI

```bash
npm install -g vercel
vercel
```

Luego:

1. Inicia sesion.
2. Selecciona esta carpeta.
3. Confirma `finanzas-app` como proyecto.
4. Agrega las variables de entorno cuando Vercel las solicite o desde el dashboard.

Para produccion:

```bash
vercel --prod
```

## Configuracion de Supabase

Despues del deploy, ve a Supabase:

1. `Authentication` -> `URL Configuration`
2. Define tu URL de Vercel como `Site URL`
3. Agrega tambien esa misma URL en `Redirect URLs`

Ejemplo:

```text
https://tu-proyecto.vercel.app
```

Si luego conectas un dominio propio, agregalo tambien en Supabase.
