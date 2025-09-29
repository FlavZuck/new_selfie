import {
	getActvToNotify,
	getExpActvToRemind
} from "../actions/cale_logic/activity_logic";
import {
	getEventsToNotify,
	getRecEventsToNotify
} from "../actions/cale_logic/event_logic";
import { sendNotification_forCalendar } from "../actions/notif_logic/push_logic";
import {
	activity_payload_creator,
	debt_handler,
	event_payload_creator,
	urgency_payload
} from "../actions/sched_logic";
import { getVirtualDate } from "../actions/timemach_logic";
import { sendEmail } from "../lib/nodemailer";

// Funzione per gestire il loop principale delle notifiche
// Tipizzazione degli array di input poco rigida, ma va bene cosi
async function main_notification_loop(
	activities_to_notify: any[],
	events_to_notify: any[],
	expired_activities: any[],
	recurrent_events_to_notify: any[]
) {
	// Loop per le attività da notificare
	for (const activity of activities_to_notify) {
		const payload = await activity_payload_creator(activity);
		await sendNotification_forCalendar(activity, payload);
	}
	// Loop per gli eventi da notificare
	for (const event of events_to_notify) {
		const payload = await event_payload_creator(event);
		await sendNotification_forCalendar(event, payload);
	}
	// Loop per le attività scadute con reminder attivo
	for (const activity of expired_activities) {
		const payload = await urgency_payload(activity);
		if (payload != null) {
			await sendNotification_forCalendar(activity, payload);
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
	// Loop per gli eventi ricorrenti da notificare
	for (const event of recurrent_events_to_notify) {
		const payload = await event_payload_creator(event);
		await sendNotification_forCalendar(event, payload);
	}
}

export default async function scheduler_routine(): Promise<void> {
	setInterval(async () => {
		// Facciamo prima il controllo dei debiti pomodoro
		await debt_handler();

		// Ora possiamo occuparci con le notifiche

		const current_date = (await getVirtualDate()) ?? new Date();
		// Gettiamo gli array di roba da notificare
		const activities_to_notify = await getActvToNotify(current_date);
		const events_to_notify = await getEventsToNotify(current_date);
		const expired_activities = await getExpActvToRemind(current_date);
		const recurrent_events_to_notify =
			await getRecEventsToNotify(current_date);
		console.log(events_to_notify);

		if (
			activities_to_notify.length === 0 &&
			expired_activities.length === 0 &&
			events_to_notify.length === 0 &&
			recurrent_events_to_notify.length === 0
		) {
			console.log(
				"Nothing to notify, Current date: ",
				current_date.toISOString()
			);
		} else {
			console.log("There is something to notify!!!");

			await main_notification_loop(
				activities_to_notify,
				events_to_notify,
				expired_activities,
				recurrent_events_to_notify
			);
		}
	}, 1000); // Esegui ogni secondo
}
