import { z } from 'zod';

export const authCredentialsSchema = z.object({
  email: z.string().trim().email('Enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.').max(128, 'Password is too long.'),
});

export const registrationSchema = authCredentialsSchema.extend({
  confirmPassword: z.string().min(1, 'Confirm your password.'),
}).superRefine((value, context) => {
  if (value.password !== value.confirmPassword) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['confirmPassword'], message: 'Passwords do not match.' });
  }
});

export type AuthCredentials = z.infer<typeof authCredentialsSchema>;
export type RegistrationInput = z.infer<typeof registrationSchema>;
