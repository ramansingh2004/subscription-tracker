import dbConnect from './mongodb';
import { Subscription } from '@/models/Subscription.model';
import { User } from '@/models/User.model';
import { sendReminderEmail } from './email-service';
import { createNotification } from './notification-helper';

function calculateNextRenewalDate(currentDate: Date, billingCycle: string): Date {
  const nextDate = new Date(currentDate);
  if (billingCycle === 'monthly') {
    nextDate.setMonth(nextDate.getMonth() + 1);
  } else if (billingCycle === 'yearly') {
    nextDate.setFullYear(nextDate.getFullYear() + 1);
  } else if (billingCycle === 'quarterly') {
    nextDate.setMonth(nextDate.getMonth() + 3);
  } else {
    nextDate.setMonth(nextDate.getMonth() + 1);
  }
  return nextDate;
}

export async function checkAndProcessSubRenewals(userId?: string): Promise<number> {
  try {
    await dbConnect();
    
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Build filter: active subscriptions, optionally for a specific user
    const filter: any = { status: 'active' };
    if (userId) {
      filter.userId = userId;
    }

    const subscriptions = await Subscription.find(filter);

    let processedCount = 0;

    for (const sub of subscriptions) {
      const user = await User.findById(sub.userId);
      if (!user) continue;

      const renewalDate = new Date(sub.nextRenewalDate);

      // --- SCENARIO A: Next renewal is in the past (needs roll over or expiration) ---
      if (renewalDate < todayStart) {
        if (sub.autoRenew) {
          const nextRenewal = calculateNextRenewalDate(renewalDate, sub.billingCycle);
          
          await Subscription.findByIdAndUpdate(sub._id, {
            nextRenewalDate: nextRenewal,
            reminderSent7Days: false,
            reminderSentToday: false,
          });

          await createNotification({
            userId: sub.userId,
            type: 'renewal',
            title: `🔄 Subscription Renewed`,
            message: `Your subscription for ${sub.name} has renewed. Next renewal date: ${nextRenewal.toLocaleDateString()}`,
            subscriptionId: sub._id,
          });
          
          processedCount++;
        } else {
          await Subscription.findByIdAndUpdate(sub._id, {
            status: 'cancelled',
          });

          await createNotification({
            userId: sub.userId,
            type: 'renewal',
            title: `⌛ Subscription Expired`,
            message: `Your subscription for ${sub.name} expired on ${renewalDate.toLocaleDateString()}`,
            subscriptionId: sub._id,
          });
          
          processedCount++;
        }
      }

      // --- SCENARIO B: Next renewal is TODAY ---
      else if (renewalDate >= todayStart && renewalDate <= todayEnd) {
        if (!sub.reminderSentToday) {
          await createNotification({
            userId: sub.userId,
            type: 'renewal',
            title: `🔔 ${sub.name} renews TODAY`,
            message: `Your subscription is renewing today. Cost: ${sub.currency} ${sub.cost}`,
            subscriptionId: sub._id,
          });

          await Subscription.findByIdAndUpdate(sub._id, {
            reminderSentToday: true,
            lastReminderSentDate: now,
          });

          if (user.preferences?.emailNotifications) {
            try {
              await sendReminderEmail({
                userEmail: user.email,
                userName: user.firstName || user.username,
                subscriptionName: sub.name,
                cost: sub.cost,
                currency: sub.currency,
                renewalDate: 'Today',
                website: sub.website,
                type: 'today',
              });
            } catch (err) {
              console.error(`Email send failed for ${user.email} (today renewal):`, err);
            }
          }
          
          processedCount++;
        }
      }

      // --- SCENARIO C: Next renewal is in 7 days ---
      else if (renewalDate > todayEnd && renewalDate <= sevenDaysFromNow) {
        if (!sub.reminderSent7Days) {
          const formattedRenewalDate = renewalDate.toLocaleDateString();

          await createNotification({
            userId: sub.userId,
            type: 'renewal',
            title: `📅 ${sub.name} renews in 7 days`,
            message: `Your subscription will renew on ${formattedRenewalDate}. Cost: ${sub.currency} ${sub.cost}`,
            subscriptionId: sub._id,
          });

          await Subscription.findByIdAndUpdate(sub._id, {
            reminderSent7Days: true,
            lastReminderSentDate: now,
          });

          if (user.preferences?.emailNotifications) {
            try {
              await sendReminderEmail({
                userEmail: user.email,
                userName: user.firstName || user.username,
                subscriptionName: sub.name,
                cost: sub.cost,
                currency: sub.currency,
                renewalDate: formattedRenewalDate,
                website: sub.website,
                type: '7days',
              });
            } catch (err) {
              console.error(`Email send failed for ${user.email} (7-day renewal):`, err);
            }
          }
          
          processedCount++;
        }
      }
    }
    return processedCount;
  } catch (error) {
    console.error('Error in checkAndProcessSubRenewals:', error);
    return 0;
  }
}
