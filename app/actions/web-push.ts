"use server";

import webpush from "web-push";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const VAPID_SUBJECT = "mailto:admin@gymcoaching.com";
const NEXT_PUBLIC_VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY!;

if (NEXT_PUBLIC_VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  try {
    webpush.setVapidDetails(
      VAPID_SUBJECT,
      NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      VAPID_PRIVATE_KEY
    );
  } catch (err) {
    console.warn("web-push VAPID config issue", err);
  }
}

export async function savePushSubscription(subscription: any) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Usuario no autenticado.");
    }

    const { endpoint, keys } = subscription;
    const { p256dh, auth } = keys;

    // Remove older subscriptions with this endpoint (e.g., re-subscribing)
    await supabase.from("push_subscriptions").delete().match({ user_id: user.id, endpoint });

    const { error: insertError } = await supabase
      .from("push_subscriptions")
      .insert({
        user_id: user.id,
        endpoint,
        p256dh,
        auth,
      });

    if (insertError) throw insertError;

    return { success: true };
  } catch (error: any) {
    console.error("Error guardando suscripción push:", error);
    return { success: false, error: error.message };
  }
}

export async function sendPushNotification(userId: string, payload: { title: string; body: string; data?: any }) {
  try {
    const adminSupabase = createAdminClient();
    const { data: subscriptions, error } = await adminSupabase
      .from("push_subscriptions")
      .select("*")
      .eq("user_id", userId);

    if (error) throw error;
    if (!subscriptions || subscriptions.length === 0) return { success: false, error: "No subscriptions found" };

    const notifications = subscriptions.map((sub) => {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth,
        },
      };

      return webpush.sendNotification(pushSubscription, JSON.stringify(payload)).catch((err) => {
        // If the subscription is gone, delete it from our db
        if (err.statusCode === 404 || err.statusCode === 410) {
          adminSupabase.from("push_subscriptions").delete().eq("id", sub.id).then();
        } else {
          console.error("Error enviando push a", sub.endpoint, err);
        }
      });
    });

    await Promise.allSettled(notifications);
    return { success: true };
  } catch (error: any) {
    console.error("Error en sendPushNotification:", error);
    return { success: false, error: error.message };
  }
}
