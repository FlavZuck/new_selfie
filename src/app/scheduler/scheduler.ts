import { getActivitiesToNotify } from "../actions/cale_logic/activity_logic";
import { sendNotification_forActivity } from "../actions/notif_logic/push_logic";
import { Activity_DB } from "../lib/definitions/def_actv";
import {
	payload_prima,
	payload_specifico,
	payload_stesso
} from "../lib/definitions/def_notf";

function payload_handler(activity: Activity_DB) {
	// Funzione per gestire il payload in base al tipo di notifica
	switch (activity.notificationtype) {
		case "stesso":
			return payload_stesso;
		case "prima":
			return payload_prima;
		case "specifico":
			return payload_specifico;
		default:
			console.log(
				"Notification type not recognized" + activity.notificationtype
			);
			throw new Error("Invalid notification type");
	}
}

export async function scheduler_routine() {
	setInterval(async () => {
		console.log("Scheduler routine started");
		// Funzione che si occupa di fornire l'array delle attività da notificare
		const activities_to_notify = await getActivitiesToNotify(new Date());
		// Facciamo un log delle attività da notificare per debug

		if (activities_to_notify.length === 0) {
			console.log("No activities to notify");
			return;
		} else {
			console.log("There are activities to notify");
			console.log(activities_to_notify);
		}
		// Occupiamoci di inviare le notifiche per ogni attività in scadenza
		for (const activity of activities_to_notify) {
			const payload = payload_handler(activity);
			await sendNotification_forActivity(activity, payload);
		}
		console.log("Scheduler routine finished");
	}, 1000); // Esegui ogni secondo
}
