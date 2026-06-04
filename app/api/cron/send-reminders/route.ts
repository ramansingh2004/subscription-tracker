import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Subscription } from '@/models/Subscription.model';
import { User } from '@/models/User.model';
import { sendReminderEmail } from '@/lib/email-service';
import { createNotification } from '@/lib/notification-helper';

// ============ SEND REMINDERS (Called by cron job) ============

export async function POST(request: NextRequest) {
  try {
    // Verify the request has correct authorization header
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { success: false, error: { message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    await dbConnect();

    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const tomorrowStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      0,
      0,
      0
    );
    const tomorrowEnd = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      23,
      59,
      59
    );

    let sentReminders = 0;
    let errors = 0;

    // ============ 7-DAY REMINDERS ============
    console.log('📧 Sending 7-day reminders...');

    const sevenDaySubscriptions = await Subscription.find({
      nextRenewalDate: {
        $gte: sevenDaysFromNow,
        $lte: new Date(sevenDaysFromNow.getTime() + 60 * 60 * 1000), // Within the 7-day window
      },
      reminderSent7Days: false,
      status: 'active',
    }).populate('userId');

    for (const subscription of sevenDaySubscriptions) {
      try {
        const user = await User.findById(subscription.userId);

        if (!user || !user.preferences.emailNotifications) {
          console.log(`⏭️  Skipping: User ${user?.email} has notifications disabled`);
          continue;
        }

        const renewalDate = new Date(subscription.nextRenewalDate).toLocaleDateString();

        // Send email
        const emailSent = await sendReminderEmail({
          userEmail: user.email,
          userName: user.firstName || user.username,
          subscriptionName: subscription.name,
          cost: subscription.cost,
          currency: subscription.currency,
          renewalDate,
          website: subscription.website,
          type: '7days',
        });

        if (emailSent) {
          // Create in-app notification
          await createNotification({
            userId: subscription.userId,
            type: 'renewal',
            title: `${subscription.name} renews in 7 days`,
            message: `Your subscription will renew on ${renewalDate}. Cost: ${subscription.currency} ${subscription.cost}`,
            subscriptionId: subscription._id,
          });

          // Mark reminder as sent
          await Subscription.findByIdAndUpdate(subscription._id, {
            reminderSent7Days: true,
            lastReminderSentDate: now,
          });

          sentReminders++;
        } else {
          errors++;
        }
      } catch (error) {
        console.error(`Error processing subscription ${subscription._id}:`, error);
        errors++;
      }
    }

    // ============ TODAY REMINDERS ============
    console.log('📧 Sending renewal-today reminders...');

    const todaySubscriptions = await Subscription.find({
      nextRenewalDate: {
        $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
        $lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
      },
      reminderSentToday: false,
      status: 'active',
    }).populate('userId');

    for (const subscription of todaySubscriptions) {
      try {
        const user = await User.findById(subscription.userId);

        if (!user || !user.preferences.emailNotifications) {
          console.log(`⏭️  Skipping: User ${user?.email} has notifications disabled`);
          continue;
        }

        // Send email
        const emailSent = await sendReminderEmail({
          userEmail: user.email,
          userName: user.firstName || user.username,
          subscriptionName: subscription.name,
          cost: subscription.cost,
          currency: subscription.currency,
          renewalDate: 'Today',
          website: subscription.website,
          type: 'today',
        });

        if (emailSent) {
          // Create in-app notification
          await createNotification({
            userId: subscription.userId,
            type: 'renewal',
            title: `${subscription.name} renews TODAY`,
            message: `Your subscription is renewing today. Cost: ${subscription.currency} ${subscription.cost}`,
            subscriptionId: subscription._id,
          });

          // Mark reminder as sent
          await Subscription.findByIdAndUpdate(subscription._id, {
            reminderSentToday: true,
            lastReminderSentDate: now,
          });

          sentReminders++;
        } else {
          errors++;
        }
      } catch (error) {
        console.error(`Error processing subscription ${subscription._id}:`, error);
        errors++;
      }
    }

    console.log(`✅ Cron job completed: ${sentReminders} sent, ${errors} errors`);

    return NextResponse.json(
      {
        success: true,
        data: {
          sent: sentReminders,
          errors,
          message: `Sent ${sentReminders} reminders successfully`,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { message: 'Failed to send reminders' },
      },
      { status: 500 }
    );
  }
}