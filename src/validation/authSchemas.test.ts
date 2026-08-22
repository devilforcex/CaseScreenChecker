import { describe, expect, it } from 'vitest';
import { authCredentialsSchema, registrationSchema } from './authSchemas';

describe('auth validation', () => {
  it('accepts valid login credentials', () => {
    expect(authCredentialsSchema.safeParse({ email: 'admin@example.com', password: 'strong-pass-123' }).success).toBe(true);
  });

  it('rejects invalid email and short password', () => {
    const result = authCredentialsSchema.safeParse({ email: 'not-an-email', password: 'short' });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues.map((issue) => issue.path.join('.'))).toEqual(expect.arrayContaining(['email', 'password']));
  });

  it('requires matching registration passwords', () => {
    const result = registrationSchema.safeParse({ email: 'admin@example.com', password: 'strong-pass-123', confirmPassword: 'different-pass' });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues.some((issue) => issue.path[0] === 'confirmPassword')).toBe(true);
  });
});
