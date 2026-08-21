import { describe, expect, it } from 'vitest';
import { inspectClientEnvironment } from './clientEnv';

describe('inspectClientEnvironment', () => {
  it('accepts a valid Supabase URL and key', () => {
    const result = inspectClientEnvironment({
      url: 'https://example.supabase.co',
      anonKey: 'eyJhbGciOiJIUzI1NiJ9.valid-key',
    });
    expect(result.configured).toBe(true);
    expect(result.hostname).toBe('example.supabase.co');
  });

  it('reports missing values without exposing their contents', () => {
    const result = inspectClientEnvironment({});
    expect(result.configured).toBe(false);
    expect(result.issues).toEqual(expect.arrayContaining([
      'VITE_SUPABASE_URL is missing.',
      'VITE_SUPABASE_ANON_KEY is missing.',
    ]));
  });

  it('rejects placeholder configuration', () => {
    const result = inspectClientEnvironment({
      url: 'https://your-project.supabase.co',
      anonKey: 'your-publishable-anon-key',
    });
    expect(result.configured).toBe(false);
    expect(result.issues).toEqual(expect.arrayContaining([
      'VITE_SUPABASE_URL is a placeholder.',
      'VITE_SUPABASE_ANON_KEY is a placeholder.',
    ]));
  });
});
