import {
	getActivitiesToNotify,
	getExpiredActvitiesToRemind
} from "../actions/cale_logic/activity_logic";
import { sendNotification_forActivity } from "../actions/notif_logic/push_logic";
import { getVirtualDate } from "../actions/timemach_logic";
import { Activity_DB } from "../lib/definitions/def_actv";
import { payload_type } from "../lib/definitions/def_notf";

function payload_creator(activity: Activity_DB) {
	// In base al tipo di notifica, creiamo il payload da inviare con titolo e corpo
	switch (activity.notificationtype) {
		case "stesso":
			return {
				title: activity.title,
				body: `L'attività "${activity.title}" è in scadenza ora!`,
				data: { url: "/" }
			} as payload_type;
		case "prima":
			return {
				title: activity.title,
				body: `L'attività "${activity.title}" scade nelle prossime 24 ore!`,
				data: { url: "/" }
			} as payload_type;
		case "specifico":
			return {
				title: activity.title,
				body: `L'attività "${activity.title}" scade il ${activity.specificday?.toLocaleDateString()}!`,
				data: { url: "/" }
			} as payload_type;
		default:
			console.log(
				"Notification type not recognized: " + activity.notificationtype
			);
			throw new Error("Invalid notification type");
	}
}

async function urgency_level_reminder(activity: Activity_DB): Promise<number> {
	// Calcola il livello di urgenza del promemoria in base alla data di scadenza
	const current_date = (await getVirtualDate()) ?? new Date();
	const expiration_date = activity.expiration;
	const time_difference = expiration_date.getTime() - current_date.getTime();

	const one_day_in_ms = 24 * 60 * 60 * 1000;

	if (time_difference == one_day_in_ms) {
		// Se l'attività è scaduta da un giorno
		return 1; // Low
	} else if (time_difference == 7 * one_day_in_ms) {
		// Se l'attività è scaduta da una settimana
		return 2; // Medium
	} else if (time_difference == 30 * one_day_in_ms) {
		// Se l'attività è scaduta da un mese
		return 3; // High
	} else {
		// Se l'attività non corrisponde a nessun livello di urgenza
		return -1; // Invalid
	}
}

async function urgency_payload(
	activity: Activity_DB
): Promise<payload_type | null> {
	// Crea un payload di notifica in base al livello di urgenza
	const urgency = await urgency_level_reminder(activity);

	switch (urgency) {
		case 1:
			return {
				title: activity.title,
				body: `L'attività "${activity.title}" è scaduta da un giorno!`,
				data: { url: "/" }
			} as payload_type;
		case 2:
			return {
				title: activity.title,
				body: `L'attività "${activity.title}" è scaduta da una settimana!`,
				data: { url: "/" }
			} as payload_type;
		case 3:
			return {
				title: activity.title,
				body: `L'attività "${activity.title}" è scaduta da un mese!`,
				data: { url: "/" }
			} as payload_type;
		case -1:
			return null;
		default:
			console.log("Unexpected urgency level: ", urgency);
			throw new Error("Unexpected urgency level");
	}
}

export async function scheduler_routine() {
	setInterval(async () => {
		const current_date = (await getVirtualDate()) ?? new Date();
		// Funzione che si occupa di fornire l'array delle attività da notificare
		const activities_to_notify = await getActivitiesToNotify(current_date);
		const expired_activities = await getExpiredActvitiesToRemind();

		if (
			activities_to_notify.length === 0 &&
			expired_activities.length === 0
		) {
			console.log("No activities to notify...");
		} else {
			console.log("There are activities to notify!!!");

			// Occupiamoci di inviare le notifiche per ogni attività in scadenza
			for (const activity of activities_to_notify) {
				const payload = payload_creator(activity);
				await sendNotification_forActivity(activity, payload);
			}
			for (const activity of expired_activities) {
				const payload = await urgency_payload(activity);
				if (payload != null) {
					await sendNotification_forActivity(activity, payload);
				}
			}
		}
	}, 1000); // Esegui ogni secondo
}
