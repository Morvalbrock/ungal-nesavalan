import { orderRepo, userRepo } from "@/server/repositories";
import { getMailProvider } from "@/features/mail";
import { adminNewOrderEmail, orderConfirmationEmail } from "@/features/mail/templates";

const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL ?? "ungalnesavalan01@gmail.com";

/**
 * Sends order notification emails to both the store admin (ungalnesavalan01@gmail.com)
 * and the customer after an order is placed and confirmed.
 *
 * Idempotent: checks order.notifiedAt to prevent duplicate emails if both
 * the client payment confirmation and Razorpay webhook trigger.
 */
export async function sendOrderPlacedNotifications(orderId: string): Promise<void> {
  try {
    const order = await orderRepo.findById(orderId);
    if (!order) {
      console.warn(`[order-notification] Order ${orderId} not found`);
      return;
    }

    // Skip if already notified to prevent duplicate emails
    if (order.notifiedAt) {
      return;
    }

    // Mark order as notified immediately to avoid race conditions
    await orderRepo.markNotified(orderId);

    const user = await userRepo.findById(order.userId);
    const customer = {
      name: user?.name || order.addressSnapshot.fullName,
      email: user?.email,
      phone: order.addressSnapshot.phone
    };

    const mail = getMailProvider();

    // 1. Send Admin Notification Email to ungalnesavalan01@gmail.com
    try {
      const adminMail = adminNewOrderEmail(order, customer);
      await mail.send({
        to: ADMIN_EMAIL,
        subject: adminMail.subject,
        html: adminMail.html,
        tags: { orderId: order.id, orderNumber: order.orderNumber, recipient: "admin" }
      });
      console.log(`[order-notification] Admin notification sent to ${ADMIN_EMAIL} for order #${order.orderNumber}`);
    } catch (err) {
      console.error("[order-notification] Failed to send admin email:", (err as Error).message);
    }

    // 2. Send Customer Confirmation Email
    if (customer.email) {
      try {
        const customerMail = orderConfirmationEmail(order, customer.name);
        await mail.send({
          to: customer.email,
          subject: customerMail.subject,
          html: customerMail.html,
          tags: { orderId: order.id, orderNumber: order.orderNumber, recipient: "customer" }
        });
        console.log(`[order-notification] Customer confirmation sent to ${customer.email} for order #${order.orderNumber}`);
      } catch (err) {
        console.error("[order-notification] Failed to send customer confirmation:", (err as Error).message);
      }
    }
  } catch (err) {
    console.error("[order-notification] Unexpected error:", (err as Error).message);
  }
}
