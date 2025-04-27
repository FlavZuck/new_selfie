"use server";

import webpush from "web-push";
import { getAllSubscriptions } from "./sub_logic";

// Set VAPID details
const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const privateVapidKey = process.env.NEXT_VAPID_PRIVATE_KEY;
// Quick control for ensuring that the keys are set
if (!publicVapidKey) {
	console.error("VAPID public key is not set");
	throw new Error("VAPID public key is not set");
} else if (!privateVapidKey) {
	console.error("VAPID private key is not set");
	throw new Error("VAPID private key is not set");
}
webpush.setVapidDetails(
	"mailto:flavio.zhuka@studio.unibo.it",
	publicVapidKey,
	privateVapidKey
);

export async function sendNotification(
	subscription: webpush.PushSubscription,
	payload: any
) {
	try {
		await webpush.sendNotification(subscription, JSON.stringify(payload));
	} catch (err: any) {
		throw new Error("Error sending notification: " + err);
	}
}

export async function send_TEST_NotificationToAll() {
	// Test payload
	const payload = {
		title: "Test Notification",
		body: "This is a test push notification",
		data: { url: "/" }
	};

	const all_subscriptions = await getAllSubscriptions();
	await Promise.all(
		all_subscriptions.map((data) => {
			const subscription = data.subscription as webpush.PushSubscription;

			sendNotification(subscription, payload);
		})
	);
}
