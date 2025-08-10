"use server";

import { Activity_DB } from "@/app/lib/definitions/def_actv";
import { Subscription_DB, payload_type } from "@/app/lib/definitions/def_notf";
import { ACTIVITIES, updateDB } from "@/app/lib/mongodb";
import webpush from "web-push";
import {
	deleteSubscription,
	getAllSubscriptions,
	getUserSubscriptions
} from "./sub_logic";

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

// Funzione per inviare una notifica (primitiva)
export async function sendNotification(
	subscriptionDB: Subscription_DB,
	payload: any
) {
	try {
		const subscription =
			subscriptionDB.subscription as webpush.PushSubscription;
		await webpush.sendNotification(subscription, JSON.stringify(payload));
	} catch (err: any) {
		if (err.statusCode === 410 || err.statusCode === 404) {
			await deleteSubscription(subscriptionDB);
		}
		console.log("Error sending notification: ", err);
		throw new Error("Error sending notification: " + err);
	}
}

// Funzione per inviare la notifica all'utente su tutti i dispositivi
export async function sendNotificationToAllDevices(
	subscription_array: Subscription_DB[],
	payload: any
) {
	if (!subscription_array) {
		throw new Error("Subscription array is empty");
	}

	//

	await Promise.all(
		subscription_array.map((subscription) => {
			sendNotification(subscription, payload);
		})
	);
}

export async function sendNotification_forActivity(
	activity: Activity_DB,
	payload: payload_type
) {
	const userId = activity.userId;
	const subscription_array = await getUserSubscriptions(userId);

	// Controlliamo se l'array è vuoto
	if (!subscription_array) {
		throw new Error("User subscription not found");
	}
	// Controlliamo se l'array è un array
	if (!Array.isArray(subscription_array)) {
		throw new Error("Subscription array is not an array");
	}
	// Stampiamo l'array per debug
	console.log("Subscription array: ", subscription_array);

	// Proviamo a inviare la notifica
	try {
		await sendNotificationToAllDevices(subscription_array, payload);
	} catch (err: any) {
		console.log("Activity causing the error: ", activity.title);
		//throw new Error("Error sending notification: " + err);
		console.log("Error sending notification: ", err);
	}
}

// Funzione per capire se l'attività sta per scadere o meno
export async function notif_time_handler(
	activity: Activity_DB,
	current_date: Date
): Promise<boolean> {
	current_date.setMilliseconds(0); // Rimuoviamo i millisecondi per evitare problemi di confronto

	switch (activity.notificationtype) {
		case "stesso":
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

			if (current_date.getTime() === notif_time_specific.getTime()) {
				return true;
			} else {
				return false;
			}

		case "prima":
			const notif_time_prima = new Date(
				activity.expiration.getTime() - 24 * 60 * 60 * 1000
			);

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

// Funzione che indica se l'attività va remindata o meno
export async function reminder_time_handler(
	activity: Activity_DB,
	current_date: Date
): Promise<boolean> {
	current_date.setMilliseconds(0); // Rimuoviamo i millisecondi per evitare problemi di confronto
	const one_day = 24 * 60 * 60 * 1000; // Un giorno in millisecondi
	const two_days = 2 * one_day; // Due giorni in millisecondi

	if (activity.lastsent_reminder === false) {
		// Caso notifica push
		if (
			current_date.getTime() ===
			activity.expiration.getTime() + one_day
		) {
			// Aggiorniamo il campo lastsent_reminder a true
			await updateDB(
				ACTIVITIES,
				{ _id: activity._id },
				{ lastsent_reminder: true }
			);
			return true;
		} else {
			return false;
		}
	} else {
		// Caso email
		return (
			current_date.getTime() === activity.expiration.getTime() + two_days
		);
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
			const subscription = data as Subscription_DB;

			sendNotification(subscription, payload);
		})
	);
}
