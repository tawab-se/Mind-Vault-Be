import { z } from 'zod';

export const signupSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  organization_name: z
    .string()
    .min(1, 'Organization name is required')
    .optional(),
  invitation_token: z.string().optional(),
});

export type SignupDto = z.infer<typeof signupSchema>;
