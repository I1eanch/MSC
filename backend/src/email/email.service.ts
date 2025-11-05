import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private sesClient: SESClient;
  private fromEmail: string;

  constructor(private configService: ConfigService) {
    const region = this.configService.get<string>('aws.region');
    const accessKeyId = this.configService.get<string>('aws.accessKeyId');
    const secretAccessKey = this.configService.get<string>('aws.secretAccessKey');
    
    this.fromEmail = this.configService.get<string>('aws.sesFromEmail');

    if (accessKeyId && secretAccessKey) {
      this.sesClient = new SESClient({
        region,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });
    } else {
      this.logger.warn('AWS credentials not configured. Email sending will be skipped.');
    }
  }

  async sendPasswordResetEmail(to: string, token: string): Promise<void> {
    if (!this.sesClient) {
      this.logger.warn(`Email sending skipped for ${to}. Password reset token: ${token}`);
      return;
    }

    const frontendUrl = this.configService.get<string>('frontendUrl');
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;

    const params = {
      Source: this.fromEmail,
      Destination: {
        ToAddresses: [to],
      },
      Message: {
        Subject: {
          Data: 'Password Reset Request',
          Charset: 'UTF-8',
        },
        Body: {
          Html: {
            Data: this.getPasswordResetEmailTemplate(resetLink),
            Charset: 'UTF-8',
          },
          Text: {
            Data: `You requested a password reset. Click the following link to reset your password: ${resetLink}\n\nIf you didn't request this, please ignore this email.\n\nThis link will expire in 1 hour.`,
            Charset: 'UTF-8',
          },
        },
      },
    };

    try {
      const command = new SendEmailCommand(params);
      await this.sesClient.send(command);
      this.logger.log(`Password reset email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${to}`, error);
      throw error;
    }
  }

  async sendWelcomeEmail(to: string, email: string): Promise<void> {
    if (!this.sesClient) {
      this.logger.warn(`Email sending skipped for ${to}. Welcome email.`);
      return;
    }

    const params = {
      Source: this.fromEmail,
      Destination: {
        ToAddresses: [to],
      },
      Message: {
        Subject: {
          Data: 'Welcome to Our Platform',
          Charset: 'UTF-8',
        },
        Body: {
          Html: {
            Data: this.getWelcomeEmailTemplate(email),
            Charset: 'UTF-8',
          },
          Text: {
            Data: `Welcome to our platform!\n\nYour account has been successfully created with email: ${email}\n\nThank you for joining us!`,
            Charset: 'UTF-8',
          },
        },
      },
    };

    try {
      const command = new SendEmailCommand(params);
      await this.sesClient.send(command);
      this.logger.log(`Welcome email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${to}`, error);
    }
  }

  private getPasswordResetEmailTemplate(resetLink: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2c3e50;">Password Reset Request</h2>
            <p>You requested a password reset for your account.</p>
            <p>Click the button below to reset your password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" 
                 style="background-color: #3498db; 
                        color: white; 
                        padding: 12px 30px; 
                        text-decoration: none; 
                        border-radius: 5px;
                        display: inline-block;">
                Reset Password
              </a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #7f8c8d;">${resetLink}</p>
            <p style="color: #e74c3c; margin-top: 30px;">
              <strong>This link will expire in 1 hour.</strong>
            </p>
            <p style="color: #7f8c8d; font-size: 12px; margin-top: 30px;">
              If you didn't request this password reset, please ignore this email.
            </p>
          </div>
        </body>
      </html>
    `;
  }

  private getWelcomeEmailTemplate(email: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2c3e50;">Welcome to Our Platform!</h2>
            <p>Thank you for registering with us.</p>
            <p>Your account has been successfully created with the email: <strong>${email}</strong></p>
            <p>You can now log in and start using our services.</p>
            <p style="margin-top: 30px;">Best regards,<br>The Team</p>
          </div>
        </body>
      </html>
    `;
  }
}
