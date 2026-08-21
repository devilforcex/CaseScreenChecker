export interface ClientEnvironmentInput {
  url?: string;
  anonKey?: string;
}

export interface ClientEnvironmentStatus {
  configured: boolean;
  urlPresent: boolean;
  anonKeyPresent: boolean;
  hostname: string | null;
  issues: string[];
}

const PLACEHOLDER_PATTERNS = [
  /your[-_]/i,
  /<[^>]+>/,
  /replace[-_]?me/i,
  /change[-_]?me/i,
];

export function inspectClientEnvironment(input: ClientEnvironmentInput): ClientEnvironmentStatus {
  const url = input.url?.trim() ?? '';
  const anonKey = input.anonKey?.trim() ?? '';
  const issues: string[] = [];
  let hostname: string | null = null;

  if (!url) issues.push('VITE_SUPABASE_URL is missing.');
  else {
    try {
      const parsed = new URL(url);
      if (!['http:', 'https:'].includes(parsed.protocol)) issues.push('VITE_SUPABASE_URL must use HTTP(S).');
      hostname = parsed.hostname;
    } catch {
      issues.push('VITE_SUPABASE_URL is not a valid URL.');
    }
  }

  if (!anonKey) issues.push('VITE_SUPABASE_ANON_KEY is missing.');
  else if (PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(anonKey))) issues.push('VITE_SUPABASE_ANON_KEY is a placeholder.');
  if (PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(url))) issues.push('VITE_SUPABASE_URL is a placeholder.');

  return {
    configured: issues.length === 0,
    urlPresent: Boolean(url),
    anonKeyPresent: Boolean(anonKey),
    hostname,
    issues,
  };
}
