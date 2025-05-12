"use server";

import {
	ActivitySchema,
	ActivityState,
	Activity_DB,
	Activity_FullCalendar
} from "@/app/lib/definitions/def_actv";
import { ObjectId } from "mongodb";
import { ACTIVITIES, deleteDB, findAllDB, insertDB } from "../../lib/mongodb";
import { getCurrentID } from "../auth_logic";
import { notif_time_handler } from "../notif_logic/push_logic";

// Funzione per parsare l'array di attività in un formato compatibile con FullCalendar
// (Per adesso diamo per scontato che l'attività sia sempre all-day)
function FullCalendar_ActivityParser(activity_array: Activity_DB[]) {
	return activity_array.map((activity: Activity_DB) => {
		return {
			id: activity._id.toString(),
			allDay: true,
			title: activity.title,
			// Lo salviamo come start solo per compatibilità con FullCalendar
			start: activity.expiration,
			color: activity.color,
			extendedProps: {
				description: activity.description,
				type: "ACTIVITY" as const,
				notification: activity.notification,
				notificationtime: activity.notificationtime,
				notificationtype: activity.notificationtype,
				specificday: activity.specificday
			}
		};
	});
}

// Funzione per parsare la data e ora in un formato compatibile con lo Date standard
function parseDate(date: Date | "", time: string) {
	if (time == "") {
		return date;
	}
	if (date == "") {
		return "";
	}

	const dateTime = new Date(date);
	const [hours, minutes] = time.split(":").map(Number);

	// Aggiungi ore e minuti alla data
	dateTime.setHours(hours);
	dateTime.setMinutes(minutes);

	return dateTime;
}

export async function create_activity(
	state: ActivityState,
	formData: FormData
) {
	// Validate the form data using the schema
	const validatedFields = ActivitySchema.safeParse({
		title: formData.get("title"),
		description: formData.get("description"),
		expiration: formData.get("expiration"),
		notification: formData.get("notification"),
		notificationtime: formData.get("notificationtime"),
		notificationtype: formData.get("notificationtype"),
		specificday: formData.get("specificday")
	});

	// If any form field is invalid, return the error
	if (!validatedFields.success) {
		console.log(
			"Validation failed",
			validatedFields.error.flatten().fieldErrors
		);
		return {
			errors: validatedFields.error.flatten().fieldErrors
		};
	}

	const {
		title,
		description,
		expiration,
		notification,
		notificationtime,
		notificationtype,
		specificday
	} = validatedFields.data;

	const activityColor = "#0000FF"; // color = blue

	const userId = await getCurrentID();

	const expiration_parsed = parseDate(expiration, notificationtime);
	const specificday_parsed = parseDate(specificday, notificationtime);

	const Activity = {
		userId,
		title,
		description,
		expiration: expiration_parsed,
		color: activityColor,
		notification,
		notificationtime,
		notificationtype,
		specificday: specificday_parsed
	};

	// Insert the activity into the database
	await insertDB(ACTIVITIES, Activity);

	// Effettivamente andrebbe fatto un check per vedere se l'activity è stata
	// inserita correttamente, quando puliamo il codice ricordiamoci di farlo
	return { message: "Activity created successfully" };
}

// Funzione per eliminare un'attività
export async function delete_activity(activity_id: string) {
	const activityObjectId = new ObjectId(activity_id);

	// Eliminiamo l'attività dal database
	await deleteDB(ACTIVITIES, {
		_id: activityObjectId
	});
}

// Funzione per ottenere tutte le attività dell'utente
export async function getAllActivities(): Promise<Activity_FullCalendar[]> {
	const ID = await getCurrentID();

	// Check banale
	if (!ID) {
		console.log("User not found");
	}

	const all_activities = (await findAllDB(ACTIVITIES, {
		userId: ID
	})) as Activity_DB[];

	// Ritorniamo le attività parsate in un formato compatibile con FullCalendar
	return FullCalendar_ActivityParser(all_activities);
}

// Funzione per ottenere le attività in scadenza
export async function getActivitiesToNotify(
	current_date: Date
): Promise<Activity_DB[]> {
	// Otteniamo tutte le attività dell'utente con le notifiche attive
	const all_activities = (await findAllDB(ACTIVITIES, {
		notification: "on"
	})) as Activity_DB[];

	// Prima generiamo un array di booleani che ci dice se l'attività è in scadenza o meno
	const checkResults = await Promise.all(
		all_activities.map((activity) =>
			notif_time_handler(activity, current_date)
		)
	);
	// Dopo di che filtriamo le attività in base a questo array
	const activities_to_notify = all_activities.filter(
		(_, i) => checkResults[i]
	);

	// Ritorniamo le attività in scadenza
	return activities_to_notify;
}

// Funzione per creare la lista delle attività in ordine di scadenza più vicina
export async function getActivitiesList() {
	// Otteniamo tutte le attività
	const all_activities = await getAllActivities();

	// Sortiamo le attività in base alla data di scadenza
	all_activities.sort(
		(a: Activity_FullCalendar, b: Activity_FullCalendar) => {
			// Initializziamo le date di scadenza
			const a_scadenza = new Date(a.start);
			const b_scadenza = new Date(b.start);

			// Ritorniamo il sorting
			return a_scadenza.getTime() - b_scadenza.getTime();
		}
	);

	return all_activities;
}


