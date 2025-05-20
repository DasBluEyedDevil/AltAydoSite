import nodemailer from 'nodemailer';

// Email configuration
const emailConfig = {
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
};

// Create a transporter
const createTransporter = () => {
  return nodemailer.createTransport(emailConfig);
};

// Send a password reset email
export async function sendPasswordResetEmail(
  email: string, 
  resetToken: string, 
  aydoHandle: string
): Promise<boolean> {
  try {
    const transporter = createTransporter();
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: `"AydoCorp Security" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'AydoCorp Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ccc;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #0070f3;">AYDO<span style="font-weight: 300;">CORP</span></h1>
            <p style="color: #666; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">SECURITY DEPARTMENT</p>
          </div>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #0070f3; margin-bottom: 20px;">
            <p>Hello, <strong>${aydoHandle}</strong>,</p>
            <p>We received a request to reset your AydoCorp account password. If you did not make this request, please ignore this email.</p>
          </div>
          
          <div style="margin-bottom: 30px;">
            <p>To reset your password, click the button below:</p>
            <div style="text-align: center;">
              <a href="${resetUrl}" style="display: inline-block; background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Reset Password</a>
            </div>
            <p style="margin-top: 20px; font-size: 12px; color: #666;">This link will expire in 1 hour for security reasons.</p>
          </div>
          
          <div style="font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 15px;">
            <p>If the button doesn't work, copy and paste this URL into your browser:</p>
            <p style="word-break: break-all;">${resetUrl}</p>
            <p style="margin-top: 15px;">© ${new Date().getFullYear()} AydoCorp. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
}

// Verify email service configuration
export async function verifyEmailConfig(): Promise<boolean> {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    return true;
  } catch (error) {
    console.error('Email configuration error:', error);
    return false;
  }
} 