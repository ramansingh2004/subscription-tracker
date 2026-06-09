import { Notification } from '@/models/Notification.model';
import { NotificationQueue } from '@/models/NotificationQueue.model';
import { User } from '@/models/User.model';
import nodemailer from 'nodemailer';

// ============ EMAIL TRANSPORTER SETUP ============
const emailTransporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// ============ NOTIFICATION SERVICE ============

export class NotificationService {
  /**
   * Create a notification based on user's frequency preference
   * - instant: Create immediately in DB + send email
   * - daily: Queue and send in daily batch
   * - weekly: Queue and send in weekly batch
   */
  static async createNotification(
    userId: string,
    type: 'renewal' | 'recommendation' | 'report' | 'share',
    title: string,
    message: string,
    subscriptionId?: string
  ) {
    try {
      // Get user preferences
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');

      const frequency = user.preferences.notificationFrequency;
      const emailNotificationsEnabled = user.preferences.emailNotifications;

      console.log(
        `📨 Creating notification - User: ${userId}, Frequency: ${frequency}, Type: ${type}`
      );

      if (frequency === 'instant') {
        // ← INSTANT: Create in DB immediately + send email now
        return await this.sendInstantNotification(
          userId,
          type,
          title,
          message,
          subscriptionId,
          emailNotificationsEnabled,
          user.email
        );
      } else if (frequency === 'daily') {
        // ← DAILY: Queue for daily batch
        return await this.queueNotification(
          userId,
          type,
          title,
          message,
          subscriptionId,
          'daily',
          emailNotificationsEnabled
        );
      } else if (frequency === 'weekly') {
        // ← WEEKLY: Queue for weekly batch
        return await this.queueNotification(
          userId,
          type,
          title,
          message,
          subscriptionId,
          'weekly',
          emailNotificationsEnabled
        );
      }
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Send notification immediately (instant frequency)
   */
  private static async sendInstantNotification(
    userId: string,
    type: string,
    title: string,
    message: string,
    subscriptionId: string | undefined,
    emailEnabled: boolean,
    userEmail: string
  ) {
    try {
      // 1. Create in-app notification
      const notification = new Notification({
        userId,
        type,
        title,
        message,
        subscriptionId,
        read: false,
      });

      await notification.save();
      console.log(`✅ Instant notification created: ${notification._id}`);

      // 2. Send email if enabled
      if (emailEnabled) {
        await this.sendNotificationEmail(userEmail, title, message);
        console.log(`✅ Email sent to ${userEmail}`);
      }

      return {
        success: true,
        notificationId: notification._id,
        delivered: 'instant',
        emailSent: emailEnabled,
      };
    } catch (error) {
      console.error('Error sending instant notification:', error);
      throw error;
    }
  }

  /**
   * Queue notification for batch delivery (daily/weekly)
   */
  private static async queueNotification(
    userId: string,
    type: string,
    title: string,
    message: string,
    subscriptionId: string | undefined,
    frequency: 'daily' | 'weekly',
    emailEnabled: boolean
  ) {
    try {
      // Calculate when to send
      const scheduledFor = this.calculateScheduleTime(frequency);

      // Check if queue already exists for this user and time
      const existingQueue = await NotificationQueue.findOne({
        userId,
        scheduledFor: {
          $gte: new Date(scheduledFor.getTime() - 3600000), // Within 1 hour
          $lte: new Date(scheduledFor.getTime() + 3600000),
        },
        status: 'pending',
      });

      let queue;

      if (existingQueue) {
        // Add to existing queue
        existingQueue.notifications.push({
          type: type as any,
          title,
          message,
          subscriptionId: subscriptionId as any,
          createdAt: new Date(),
        });
        queue = await existingQueue.save();
        console.log(
          `✅ Notification queued (added to existing): ${existingQueue._id}`
        );
      } else {
        // Create new queue
        queue = new NotificationQueue({
          userId,
          notifications: [
            {
              type,
              title,
              message,
              subscriptionId,
              createdAt: new Date(),
            },
          ],
          scheduledFor,
          status: 'pending',
          emailSent: false,
          inAppCreated: false,
        });
        await queue.save();
        console.log(`✅ New queue created: ${queue._id}`);
      }

      return {
        success: true,
        queueId: queue._id,
        delivered: frequency,
        scheduledFor,
        queuedCount: queue.notifications.length,
        emailEnabled,
      };
    } catch (error) {
      console.error('Error queuing notification:', error);
      throw error;
    }
  }

  /**
   * Calculate scheduled delivery time based on frequency
   */
  private static calculateScheduleTime(frequency: 'daily' | 'weekly'): Date {
    const now = new Date();

    if (frequency === 'daily') {
      // Send tomorrow at 9 AM
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0);
      return tomorrow;
    } else {
      // Send next Monday at 9 AM
      const daysUntilMonday = (1 - now.getDay() + 7) % 7 || 7;
      const nextMonday = new Date(now);
      nextMonday.setDate(nextMonday.getDate() + daysUntilMonday);
      nextMonday.setHours(9, 0, 0, 0);
      return nextMonday;
    }
  }

  /**
   * Process queued notifications (called by cron job)
   */
  static async processQueuedNotifications() {
    try {
      console.log('🔄 Processing queued notifications...');

      // Find all pending notifications scheduled for now or earlier
      const now = new Date();
      const pendingQueues = await NotificationQueue.find({
        status: 'pending',
        scheduledFor: { $lte: now },
      }).populate('userId');

      console.log(`📊 Found ${pendingQueues.length} queues to process`);

      for (const queue of pendingQueues) {
        try {
          const user = queue.userId as any;

          // 1. Create all in-app notifications
          const notificationIds = [];
          for (const notif of queue.notifications) {
            const notification = new Notification({
              userId: queue.userId,
              type: notif.type,
              title: notif.title,
              message: notif.message,
              subscriptionId: notif.subscriptionId,
              read: false,
            });
            await notification.save();
            notificationIds.push(notification._id);
          }

          console.log(
            `✅ Created ${notificationIds.length} in-app notifications for user ${queue.userId}`
          );

          // 2. Send batch email if enabled
          if (user.preferences.emailNotifications) {
            const subject = `Your ${this.getFrequencyLabel(queue)} Notifications`;
            const htmlContent = this.generateBatchEmailContent(queue.notifications);

            await this.sendNotificationEmail(user.email, subject, htmlContent);
            console.log(`✅ Batch email sent to ${user.email}`);
            queue.emailSent = true;
          }

          // 3. Mark queue as sent
          queue.status = 'sent';
          queue.inAppCreated = true;
          queue.sentAt = new Date();
          await queue.save();

          console.log(`✅ Queue ${queue._id} processed successfully`);
        } catch (error) {
          console.error(`❌ Error processing queue ${queue._id}:`, error);
          queue.status = 'failed';
          queue.failureReason = (error as Error).message;
          await queue.save();
        }
      }

      console.log(
        `✅ Processed ${pendingQueues.length} notification queues`
      );
      return { processed: pendingQueues.length };
    } catch (error) {
      console.error('Error processing queued notifications:', error);
      throw error;
    }
  }

  /**
   * Send email with notification content
   */
  private static async sendNotificationEmail(
    email: string,
    title: string,
    htmlContent: string
  ) {
    try {
      await emailTransporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: title,
        html: htmlContent,
      });
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  /**
   * Generate HTML email content for batch notifications
   */
  private static generateBatchEmailContent(
    notifications: Array<{
      type: string;
      title: string;
      message: string;
      createdAt: Date;
    }>
  ): string {
    const notificationsList = notifications
      .map(
        (notif) =>
          `
      <div style="margin: 15px 0; padding: 15px; border-left: 4px solid #3b82f6; background: #f0f9ff;">
        <h3 style="margin: 0 0 8px 0; color: #1e40af;">${notif.title}</h3>
        <p style="margin: 8px 0; color: #334155;">${notif.message}</p>
        <small style="color: #64748b;">${new Date(notif.createdAt).toLocaleDateString()}</small>
      </div>
    `
      )
      .join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3b82f6; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
          .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #64748b; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2 style="margin: 0;">💰 SubTrack Notifications</h2>
          </div>
          <div class="content">
            <p>Hi there! Here are your notifications:</p>
            ${notificationsList}
            <div class="footer">
              <p>You're receiving this because you have notifications enabled. <a href="${process.env.NEXT_PUBLIC_APP_URL}/settings">Update your preferences</a></p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Get frequency label for email subject
   */
  private static getFrequencyLabel(queue: any): string {
    // Determine if daily or weekly based on scheduledFor
    const daysUntilScheduled = Math.ceil(
      (new Date(queue.scheduledFor).getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24)
    );
    return daysUntilScheduled <= 1 ? 'Daily' : 'Weekly';
  }

  /**
   * Get notification stats for user
   */
  static async getNotificationStats(userId: string) {
    try {
      const unreadCount = await Notification.countDocuments({
        userId,
        read: false,
      });

      const pendingBatches = await NotificationQueue.countDocuments({
        userId,
        status: 'pending',
      });

      const sentCount = await Notification.countDocuments({
        userId,
      });

      return {
        unreadCount,
        pendingBatches,
        totalSent: sentCount,
      };
    } catch (error) {
      console.error('Error getting notification stats:', error);
      throw error;
    }
  }
}