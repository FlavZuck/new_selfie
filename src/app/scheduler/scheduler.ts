import {
	getActvToNotify,
	getExpActvToRemind
} from "../actions/cale_logic/activity_logic";
import { sendNotification_forActivity } from "../actions/notif_logic/push_logic";
import { getVirtualDate } from "../actions/timemach_logic";
import { Activity_DB } from "../lib/definitions/def_actv";
import { payload_type } from "../lib/definitions/def_notf";
import { sendEmail } from "../lib/nodemailer";

function payload_creator(activity: Activity_DB): payload_type {
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

function urgency_payload(activity: Activity_DB): payload_type | null {
	if (activity.lastsent_reminder === false) {
		return {
			title: activity.title,
			body: `L'attività "${activity.title}" è scaduta da un giorno!`,
			data: { url: "/" }
		} as payload_type;
	} else {
		console.log("Sent email for activity: ", activity.title);
		return null; // Non inviamo notifiche push per attività scadute che hanno già ricevuto un promemoria
	}
}

export async function scheduler_routine(): Promise<void> {
	setInterval(async () => {
		const current_date = (await getVirtualDate()) ?? new Date();
		// Funzione che si occupa di fornire l'array delle attività da notificare
		const activities_to_notify = await getActvToNotify(current_date);
		const expired_activities = await getExpActvToRemind(current_date);

		if (
			activities_to_notify.length === 0 &&
			expired_activities.length === 0
		) {
			console.log(
				"No activities,Current date: ",
				current_date.toISOString()
			);
		} else {
			console.log("There are activities to notify!!!");

			// Occupiamoci di inviare le notifiche per ogni attività in scadenza
			for (const activity of activities_to_notify) {
				const payload = payload_creator(activity);
				await sendNotification_forActivity(activity, payload);
			}
			for (const activity of expired_activities) {
				const payload = urgency_payload(activity);
				if (payload != null) {
					await sendNotification_forActivity(activity, payload);
				} else {
					console.log("Sent email for activity: ", activity.title);
					// Invia l'email di promemoria
					await sendEmail(
						activity.userId,
						`Attività scaduta: ${activity.title}`,
						`L'attività "${activity.title}" è scaduta da due giorni.`
					);
				}
			}
		}
	}, 1000); // Esegui ogni secondo
}
