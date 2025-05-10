"use server";

import { Activity_DB } from "@/app/lib/definitions/def_actv";
import { payload_type } from "@/app/lib/definitions/def_notf";
import webpush from "web-push";
import { getAllSubscriptions, getUserSubscription } from "./sub_logic";

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
		console.log("Error sending notification: ", err);
		throw new Error("Error sending notification: " + err);
	}
}

export async function sendNotification_forActivity(
	activity: Activity_DB,
	payload: payload_type
) {
	const userId = activity.userId;
	const user_sub = await getUserSubscription(userId);
	if (!user_sub) {
		throw new Error("User subscription not found");
	}
	const subscription = user_sub.subscription as webpush.PushSubscription;

	// Proviamo a inviare la notifica
	try {
		await sendNotification(subscription, payload);
	} catch (err: any) {
		console.log("Activity causing the error: ", activity.title);
		//throw new Error("Error sending notification: " + err);
		console.log("Error sending notification: ", err);
	}
}

// Funzione per capire se l'attività è scaduta o meno in base al time di notifica e noticationtype
export async function notif_time_handler(
	activity: Activity_DB,
	current_date: Date
): Promise<boolean> {
	switch (activity.notificationtype) {
		case "stesso":
			// Togliamo i millisecondi e i secondi dalla data corrente
			current_date.setMilliseconds(0);

			// DEBUG
			console.log("Current date: ", current_date);
			console.log("Notification time: ", activity.expiration);

			if (current_date.getTime() === activity.expiration.getTime()) {
				return true;
			} else {
				return false;
			}

		case "specifico":
			let notif_time_specific;
			if (activity.specificday) {
				notif_time_specific = new Date(activity.specificday);
			} else {
				throw new Error("Specific day not set");
			}

			// Togliamo i millisecondi e i secondi dalla data corrente
			current_date.setMilliseconds(0);

			// DEBUG
			console.log("Current date: ", current_date);
			console.log("Notification time: ", notif_time_specific);

			if (current_date.getTime() === notif_time_specific.getTime()) {
				return true;
			} else {
				return false;
			}

		case "prima":
			const notif_time_prima = new Date(
				activity.expiration.getTime() - 24 * 60 * 60 * 1000
			);
			// Togliamo i millisecondi e i secondi dalla data corrente
			current_date.setMilliseconds(0);

			// DEBUG
			console.log("Current date: ", current_date);
			console.log("Notification time: ", notif_time_prima);

			if (current_date.getTime() === notif_time_prima.getTime()) {
				return true;
			} else {
				return false;
			}
		default:
			console.log(
				"Notification type not recognized" + activity.notificationtype
			);
			return false;
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
