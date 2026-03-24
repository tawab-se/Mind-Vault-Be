import { Resend } from 'resend';
import { Logger } from '@nestjs/common';

const logger = new Logger('EmailService');

export interface SendInvitationEmailParams {
  to: string;
  inviterName: string;
  organizationName: string;
  inviteToken: string;
  role: string;
}

export class EmailService {
  /**
   * Send invitation email to a new user
   */
  static async sendInvitationEmail(
    params: SendInvitationEmailParams,
  ): Promise<void> {
    const { to, inviterName, organizationName, inviteToken, role } = params;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const inviteUrl = `${frontendUrl}/auth/accept-invite?token=${inviteToken}`;

    // Check if Resend API key is configured
    if (
      !process.env.RESEND_API_KEY ||
      process.env.RESEND_API_KEY === 'your-resend-api-key-here'
    ) {
      logger.warn('⚠️  RESEND_API_KEY not configured. Email will NOT be sent.');
      logger.warn('⚠️  Get your free API key at: https://resend.com/api-keys');
      logger.warn(`⚠️  Invitation created but email not sent to: ${to}`);
      logger.warn(`⚠️  Share this link manually: ${inviteUrl}`);
      return;
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev';

    try {
      logger.log(`📧 Sending invitation email to: ${to}`);
      logger.log(`📧 From: ${fromEmail}`);
      logger.log(`📧 Organization: ${organizationName}`);

      const result = await resend.emails.send({
        from: fromEmail,
        to,
        subject: `You've been invited to join ${organizationName}`,
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invitation to ${organizationName}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #f8f9fa; border-radius: 10px; padding: 30px; margin-bottom: 20px;">
    <h1 style="color: #2c3e50; margin-top: 0;">You're Invited! 🎉</h1>
    <p style="font-size: 16px;">
      <strong>${inviterName}</strong> has invited you to join <strong>${organizationName}</strong> as a <strong>${role}</strong>.
    </p>
  </div>

  <div style="background-color: #ffffff; border: 1px solid #e9ecef; border-radius: 10px; padding: 30px; margin-bottom: 20px;">
    <h2 style="color: #495057; margin-top: 0;">Getting Started</h2>
    <p style="font-size: 14px; color: #6c757d;">
      Click the button below to accept your invitation and create your account:
    </p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${inviteUrl}"
         style="background-color: #007bff; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
        Accept Invitation
      </a>
    </div>

    <p style="font-size: 12px; color: #6c757d; margin-top: 20px;">
      Or copy and paste this link in your browser:<br>
      <a href="${inviteUrl}" style="color: #007bff; word-break: break-all;">${inviteUrl}</a>
    </p>
  </div>

  <div style="background-color: #fff3cd; border: 1px solid #ffc107; border-radius: 10px; padding: 20px; margin-bottom: 20px;">
    <p style="font-size: 13px; color: #856404; margin: 0;">
      ⏰ <strong>Note:</strong> This invitation will expire in 7 days.
    </p>
  </div>

  <div style="text-align: center; font-size: 12px; color: #6c757d; padding-top: 20px; border-top: 1px solid #e9ecef;">
    <p>If you didn't expect this invitation, you can safely ignore this email.</p>
    <p style="margin-top: 10px;">© ${new Date().getFullYear()} ${organizationName}. All rights reserved.</p>
  </div>
</body>
</html>
        `,
      });

      logger.log(
        `✅ Email sent successfully! Email ID: ${result.data?.id || 'N/A'}`,
      );
    } catch (error) {
      logger.error('❌ Failed to send invitation email:', error);
      logger.error(`Email was not sent to: ${to}`);
      logger.error(`Invite link (share manually): ${inviteUrl}`);
      // Don't throw error - we don't want to fail the invitation creation if email fails
    }
  }
}
