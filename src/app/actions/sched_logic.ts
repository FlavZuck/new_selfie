"use server";

import { RRule } from "rrule";
import { Activity_DB } from "../lib/definitions/def_actv";
import { Event_DB } from "../lib/definitions/def_event";
import { payload_type } from "../lib/definitions/def_notf";
import { ACTIVITIES, updateDB } from "../lib/mongodb";

async function parseDate(date: Date, time: string) {
	if (time == "") {
		return date;
	}

	const dateTime = new Date(date);
	const [hours, minutes] = time.split(":").map(Number);

	// Aggiungi ore e minuti alla data
	dateTime.setHours(hours);
	dateTime.setMinutes(minutes);

	return dateTime;
}

export async function activity_payload_creator(
	activity: Activity_DB
): Promise<payload_type> {
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

export async function urgency_payload(
	activity: Activity_DB
): Promise<payload_type | null> {
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

export async function event_payload_creator(
	event: Event_DB
): Promise<payload_type> {
	// In base al tipo di notifica, creiamo il payload da inviare con titolo e corpo
	switch (event.notificationtype) {
		case "stesso":
			return {
				title: event.title,
				body: `L'evento "${event.title}" inizia ora!`,
				data: { url: "/" }
			} as payload_type;
		case "prima":
			return {
				title: event.title,
				body: `L'evento "${event.title}" inizia tra 24 ore!`,
				data: { url: "/" }
			} as payload_type;
		case "specifico":
			return {
				title: event.title,
				body: `L'evento "${event.title}" inizia tra ${event.specificdelay} ore!`,
				data: { url: "/" }
			} as payload_type;
		default:
			console.log(
				"Notification type not recognized: " + event.notificationtype
			);
			throw new Error("Invalid notification type");
	}
}

// Funzione per capire se l'attività sta per scadere o meno
export async function activity_notif_time_handler(
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

// Funzione per capire se l'evento sta per avvenire o meno
export async function event_notif_time_handler(
	event: Event_DB,
	current_date: Date
): Promise<boolean> {
	// Rimuoviamo i millisecondi per evitare problemi di confronto
	current_date.setMilliseconds(0);

	switch (event.notificationtype) {
		case "stesso": {
			const start = new Date(event.start);
			const notif_time = await parseDate(start, event.notificationtime);
			return current_date.getTime() === notif_time.getTime();
		}
		case "prima": {
			const start = new Date(event.start);
			const notif_time = await parseDate(start, event.notificationtime);
			const earlier_day = notif_time.getTime() - 24 * 60 * 60 * 1000;
			return current_date.getTime() === earlier_day;
		}
		case "specifico": {
			// Calcoliamo il tempo di notifica specifico (n ore prima dell'inizio)
			const start = new Date(event.start);
			const delayMs = event.specificdelay * 60 * 60 * 1000;
			const notifDate = new Date(start.getTime() - delayMs);
			// Azzeriamo millisecondi per confronto preciso
			notifDate.setMilliseconds(0);
			return current_date.getTime() === notifDate.getTime();
		}
		default:
			console.log(
				"Notification type not recognized: " + event.notificationtype
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

export async function recurrent_notif_time_handler(
	event: Event_DB,
	current_date: Date
): Promise<boolean> {
	// Rimuoviamo i millisecondi per evitare problemi di confronto
	current_date.setMilliseconds(0);

	// Confine con cui delimitare le date accettabili per la
	const oneday = 24 * 60 * 60 * 1000;
	const week_before = new Date(current_date.getTime() - 8 * oneday);
	const day_after = new Date(current_date.getTime() + 2 * oneday);

	const rrule = new RRule(event.rrule);
	const between_dates = rrule.between(week_before, day_after, true);
	console.log("Between dates for event: ", between_dates);

	switch (event.notificationtype) {
		case "stesso": {
			for (const eventdate of between_dates) {
				const notif_time = await parseDate(
					eventdate,
					event.notificationtime
				);
				if (notif_time.getTime() === current_date.getTime()) {
					return true;
				}
			}
			return false;
		}
		case "prima": {
			for (const eventdate of between_dates) {
				const notif_time = await parseDate(
					eventdate,
					event.notificationtime
				);
				const earlier_day = notif_time.getTime() - oneday;
				if (earlier_day === current_date.getTime()) {
					return true;
				}
			}
			return false;
		}
		case "specifico": {
			// Calcoliamo il tempo di notifica specifico per ogni occorrenza (n ore prima)
			for (const eventdate of between_dates) {
				const delayMs = event.specificdelay * 60 * 60 * 1000;
				const notifDate = new Date(eventdate.getTime() - delayMs);
				// Azzeriamo millisecondi per confronto preciso
				notifDate.setMilliseconds(0);
				if (current_date.getTime() === notifDate.getTime()) {
					return true;
				}
			}
			return false;
		}
		default:
			console.log(
				"Notification type not recognized: " + event.notificationtype
			);
			return false;
	}
}
