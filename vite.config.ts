import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  if (mode === 'production') {
    const missing = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'].filter((name) => !env[name]?.trim());
    const placeholders = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'].filter((name) => /your[-_]|<[^>]+>|replace[-_]?me|change[-_]?me/i.test(env[name] ?? ''));
    if (missing.length || placeholders.length) {
      throw new Error(`Production Supabase configuration is invalid. Missing: ${missing.join(', ') || 'none'}. Placeholders: ${placeholders.join(', ') || 'none'}.`);
    }
  }

  return {
    plugins: [react(), tailwindcss()],
    server: {
      host: '0.0.0.0',
      port: 3000,
      allowedHosts: true,
    },
  };
});
