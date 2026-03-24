import { z } from 'zod';

export const createInvitationSchema = z.object({
  email: z.string().email('Invalid email format'),
  role: z.enum(['admin', 'member']),
});

export type CreateInvitationDto = z.infer<typeof createInvitationSchema>;
