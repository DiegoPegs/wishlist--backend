import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { IEmailService } from '../../domain/services/email.service.interface';

@Injectable()
export class EmailService implements IEmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const smtpConfig = {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true para 465, false para outras portas
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    };

    // Validação das configurações SMTP
    if (!smtpConfig.host || !smtpConfig.auth.user || !smtpConfig.auth.pass) {
      this.logger.warn(
        'Configurações SMTP incompletas. Serviço de email desabilitado.',
      );
      return;
    }

    this.transporter = nodemailer.createTransport(smtpConfig);

    // Verificar conexão
    this.transporter.verify((error, success) => {
      if (error) {
        this.logger.error('Erro na configuração SMTP:', error);
      } else {
        this.logger.log('Serviço de email configurado com sucesso');
      }
    });
  }

  async sendInvitationEmail(
    recipientEmail: string,
    inviterName: string,
    dependentName: string,
    token: string,
  ): Promise<boolean> {
    if (!this.transporter) {
      this.logger.warn('Transporter SMTP não configurado. Email não enviado.');
      return false;
    }

    try {
      const invitationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/accept-invitation?token=${token}`;

      const mailOptions = {
        from: `"${inviterName}" <${process.env.SMTP_USER}>`,
        to: recipientEmail,
        subject: `Convite para ser guardião de ${dependentName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Você foi convidado para ser um guardião!</h2>
            <p>Olá!</p>
            <p><strong>${inviterName}</strong> convidou você para ser guardião de <strong>${dependentName}</strong> na plataforma Wishlist.</p>
            <p>Como guardião, você poderá:</p>
            <ul>
              <li>Visualizar a wishlist de ${dependentName}</li>
              <li>Reservar itens para compra</li>
              <li>Conversar anonimamente sobre os itens</li>
            </ul>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${invitationUrl}"
                 style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Aceitar Convite
              </a>
            </div>
            <p style="color: #666; font-size: 12px;">
              Este convite expira em 7 dias. Se você não solicitou este convite, pode ignorar este email.
            </p>
          </div>
        `,
      };

      const result = await this.transporter.sendMail(mailOptions);
      this.logger.log(
        `Email de convite enviado para ${recipientEmail}: ${result.messageId}`,
      );
      return true;
    } catch (error) {
      this.logger.error(`Erro ao enviar email para ${recipientEmail}:`, error);
      return false;
    }
  }

  async sendPasswordResetEmail(
    recipientEmail: string,
    resetToken: string,
  ): Promise<boolean> {
    if (!this.transporter) {
      this.logger.warn('Transporter SMTP não configurado. Email não enviado.');
      return false;
    }

    try {
      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

      const mailOptions = {
        from: `"Wishlist" <${process.env.SMTP_USER}>`,
        to: recipientEmail,
        subject: 'Redefinição de Senha - Wishlist',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Redefinição de Senha</h2>
            <p>Olá!</p>
            <p>Você solicitou a redefinição da sua senha na plataforma Wishlist.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}"
                 style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Redefinir Senha
              </a>
            </div>
            <p style="color: #666; font-size: 12px;">
              Este link expira em 1 hora. Se você não solicitou esta redefinição, pode ignorar este email.
            </p>
          </div>
        `,
      };

      const result = await this.transporter.sendMail(mailOptions);
      this.logger.log(
        `Email de redefinição enviado para ${recipientEmail}: ${result.messageId}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Erro ao enviar email de redefinição para ${recipientEmail}:`,
        error,
      );
      return false;
    }
  }
}
