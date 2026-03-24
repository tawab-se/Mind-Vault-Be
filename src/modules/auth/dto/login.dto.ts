import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
  invitation_token: z.string().optional(),
});

export type LoginDto = z.infer<typeof loginSchema>;
