import nodemailer from 'nodemailer';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const emailService = {
  // Create nodemailer transporter
  createTransporter() {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  },

  // Load email template and replace placeholders
  async loadEmailTemplate(templateName, data) {
    try {
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      const templatePath = path.join(__dirname, '../templates/emails', `${templateName}.html`);
      let template = await fs.readFile(templatePath, 'utf8');
      
      // Replace placeholders with actual data
      Object.keys(data).forEach(key => {
        const placeholder = new RegExp(`{{${key}}}`, 'g');
        template = template.replace(placeholder, data[key]);
      });
      
      return template;
    } catch (error) {
      console.error('Error loading email template:', error);
      // Return fallback template if file not found
      return this.getFallbackTemplate(data);
    }
  },

  // Fallback template if HTML template is not found
  getFallbackTemplate(data) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Welcome to Finova Fitness</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2c3e50; text-align: center;">🏋️‍♂️ Finova Fitness</h1>
          <h2 style="color: #3498db;">Welcome ${data.first_name} ${data.last_name}!</h2>
          <p>Welcome to the Finova Fitness family! Your account has been successfully created.</p>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #2c3e50;">🔐 Your Login Credentials</h3>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Default Password:</strong> ${data.default_password}</p>
            <p style="color: #e74c3c; font-weight: bold;">⚠️ Please change your password after your first login for security.</p>
          </div>
          
          <div style="background-color: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #27ae60;">📋 Membership Details</h3>
            <p><strong>Plan:</strong> ${data.membership_plan}</p>
            <p><strong>Price:</strong> $${data.membership_price}</p>
          </div>
          
          <p>We're excited to have you as part of our fitness community!</p>
          <p>Best regards,<br>The Finova Fitness Team</p>
        </div>
      </body>
      </html>
    `;
  },

  // Send welcome email to new member
  async sendWelcomeEmail(email, memberData) {
    try {
      // Check if SMTP credentials are configured
      if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.log('SMTP credentials not configured. Skipping email sending.');
        console.log('Email would be sent to:', email);
        console.log('Email content:', await this.loadEmailTemplate('welcomeMember', memberData));
        return { messageId: 'skipped-no-credentials' };
      }

      const transporter = this.createTransporter();
      
      const htmlContent = await this.loadEmailTemplate('welcomeMember', memberData);
      
      const mailOptions = {
        from: process.env.SMTP_FROM || 'noreply@finovafitness.com',
        to: email,
        subject: 'Welcome to Finova Fitness - Your Account is Ready!',
        html: htmlContent
      };

      const result = await transporter.sendMail(mailOptions);
      console.log('Welcome email sent successfully:', result.messageId);
      return result;
    } catch (error) {
      console.error('Error sending welcome email:', error);
      // Don't throw error, just log it and continue
      console.log('Email sending failed, but member creation will continue');
      return { messageId: 'failed', error: error.message };
    }
  },

  // Send password reset email
  async sendPasswordResetEmail(email, resetToken) {
    try {
      const transporter = this.createTransporter();
      
      const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
      
      const mailOptions = {
        from: process.env.SMTP_FROM || 'noreply@finovafitness.com',
        to: email,
        subject: 'Password Reset Request - Finova Fitness',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2c3e50;">🔐 Password Reset Request</h1>
            <p>You requested a password reset for your Finova Fitness account.</p>
            <p>Click the link below to reset your password:</p>
            <a href="${resetLink}" style="background-color: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">
              Reset Password
            </a>
            <p>If you didn't request this, please ignore this email.</p>
            <p>This link will expire in 1 hour.</p>
          </div>
        `
      };

      const result = await transporter.sendMail(mailOptions);
      console.log('Password reset email sent successfully:', result.messageId);
      return result;
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw error;
    }
  }
};

export default emailService;
