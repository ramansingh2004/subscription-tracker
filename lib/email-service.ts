import nodemailer from 'nodemailer';

// ============ CONFIGURE NODEMAILER ============

const emailConfig = {
  // For Gmail: Use App Passwords
  // For Outlook: Use App Passwords
  // For Custom SMTP: Use your provider's details
  
  service: process.env.EMAIL_SERVICE || 'gmail', // 'gmail', 'outlook', or leave empty for custom
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
};

// Create transporter
const transporter = nodemailer.createTransport(emailConfig as any);

// Test connection (optional - run once to verify)
export const testEmailConnection = async () => {
  try {
    await transporter.verify();
    console.log('✅ Email service connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Email service connection failed:', error);
    return false;
  }
};

// ============ EMAIL TEMPLATES ============

export const emailTemplates = {
  // 7 days before renewal
  reminderSevenDays: (data: {
    name: string;
    subscriptionName: string;
    cost: number;
    currency: string;
    renewalDate: string;
    website?: string;
  }) => ({
    subject: `Reminder: ${data.subscriptionName} renews in 7 days`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
        <h2 style="color: #1f2937; margin-bottom: 16px;">Subscription Renewal Reminder</h2>
        
        <p style="color: #4b5563; font-size: 16px; margin-bottom: 20px;">
          Hi ${data.name},
        </p>
        
        <p style="color: #4b5563; font-size: 16px; margin-bottom: 24px;">
          Your subscription <strong>${data.subscriptionName}</strong> will renew in 7 days.
        </p>
        
        <div style="background-color: white; border-left: 4px solid #3b82f6; padding: 16px; margin-bottom: 24px; border-radius: 4px;">
          <p style="color: #6b7280; margin: 8px 0;"><strong>Subscription:</strong> ${data.subscriptionName}</p>
          <p style="color: #6b7280; margin: 8px 0;"><strong>Renewal Date:</strong> ${data.renewalDate}</p>
          <p style="color: #6b7280; margin: 8px 0;"><strong>Amount:</strong> ${data.currency} ${data.cost}</p>
          ${data.website ? `<p style="color: #6b7280; margin: 8px 0;"><strong>Website:</strong> <a href="${data.website}" style="color: #3b82f6; text-decoration: none;">${data.website}</a></p>` : ''}
        </div>
        
        <p style="color: #4b5563; font-size: 16px; margin-bottom: 24px;">
          Make sure you have enough funds available if you want to continue with this subscription. If you want to cancel it, you still have time!
        </p>
        
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/subscriptions" style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-bottom: 24px;">View in SubTrack</a>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
        
        <p style="color: #9ca3af; font-size: 14px; text-align: center;">
          You're receiving this because you have email notifications enabled. 
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/settings" style="color: #3b82f6; text-decoration: none;">Update preferences</a>
        </p>
      </div>
    `,
  }),

  // Renewal day
  renewalToday: (data: {
    name: string;
    subscriptionName: string;
    cost: number;
    currency: string;
    website?: string;
  }) => ({
    subject: `🔔 Today: ${data.subscriptionName} renews today!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
        <h2 style="color: #1f2937; margin-bottom: 16px;">Your Subscription Renews Today!</h2>
        
        <p style="color: #4b5563; font-size: 16px; margin-bottom: 20px;">
          Hi ${data.name},
        </p>
        
        <p style="color: #4b5563; font-size: 16px; margin-bottom: 24px;">
          <strong>${data.subscriptionName}</strong> is renewing today. Your payment will be processed.
        </p>
        
        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin-bottom: 24px; border-radius: 4px;">
          <p style="color: #78350f; margin: 8px 0;"><strong>Subscription:</strong> ${data.subscriptionName}</p>
          <p style="color: #78350f; margin: 8px 0;"><strong>Amount:</strong> ${data.currency} ${data.cost}</p>
          ${data.website ? `<p style="color: #78350f; margin: 8px 0;"><strong>Website:</strong> <a href="${data.website}" style="color: #d97706; text-decoration: none;">${data.website}</a></p>` : ''}
        </div>
        
        <p style="color: #4b5563; font-size: 16px; margin-bottom: 24px;">
          If you don't recognize this charge or want to cancel, log in to your SubTrack dashboard to manage this subscription.
        </p>
        
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/subscriptions" style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-bottom: 24px;">Manage Subscriptions</a>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
        
        <p style="color: #9ca3af; font-size: 14px; text-align: center;">
          You're receiving this because you have email notifications enabled. 
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/settings" style="color: #3b82f6; text-decoration: none;">Update preferences</a>
        </p>
      </div>
    `,
  }),
};

// ============ SEND EMAIL FUNCTION ============

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async (options: SendEmailOptions): Promise<boolean> => {
  try {
    // Check if email service is configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.warn('⚠️ Email service not configured. Skipping email send.');
      return false;
    }

    const result = await transporter.sendMail({
      from: `SubTrack <${process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    console.log(`✅ Email sent successfully to ${options.to}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send email to ${options.to}:`, error);
    return false;
  }
};

// ============ SEND REMINDER EMAIL ============

export const sendReminderEmail = async (data: {
  userEmail: string;
  userName: string;
  subscriptionName: string;
  cost: number;
  currency: string;
  renewalDate: string;
  website?: string;
  type: '7days' | 'today';
}): Promise<boolean> => {
  try {
    const template =
      data.type === '7days'
        ? emailTemplates.reminderSevenDays({
            name: data.userName,
            subscriptionName: data.subscriptionName,
            cost: data.cost,
            currency: data.currency,
            renewalDate: data.renewalDate,
            website: data.website,
          })
        : emailTemplates.renewalToday({
            name: data.userName,
            subscriptionName: data.subscriptionName,
            cost: data.cost,
            currency: data.currency,
            website: data.website,
          });

    return await sendEmail({
      to: data.userEmail,
      subject: template.subject,
      html: template.html,
    });
  } catch (error) {
    console.error('Error sending reminder email:', error);
    return false;
  }
};