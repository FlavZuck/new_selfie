"use server";

import {
	ActivitySchema,
	ActivityState,
	Activity_DB,
	Activity_FullCalendar
} from "@/app/lib/definitions/def_actv";
import { UpdateSchema, UpdateState } from "@/app/lib/definitions/def_updt";
import { ObjectId } from "mongodb";
import {
	ACTIVITIES,
	deleteDB,
	findAllDB,
	insertDB,
	updateDB
} from "../../lib/mongodb";
import { getCurrentID } from "../auth_logic";
import {
	activity_notif_time_handler,
	reminder_time_handler
} from "../sched_logic";
import { currentDate, getVirtualDate } from "../timemach_logic";

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
				place: activity.place,
				type: "ACTIVITY" as const,
				notification: activity.notification,
				reminder: activity.reminder,
				notificationtime: activity.notificationtime,
				notificationtype: activity.notificationtype,
				specificday: activity.specificday,
				completed: activity.completed
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
	// Validate the form data using the schema (await async refinements)
	const validatedFields = await ActivitySchema.safeParseAsync({
		title: formData.get("title"),
		description: formData.get("description"),
		place: formData.get("place"),
		expiration: formData.get("expiration"),
		notification: formData.get("notification"),
		reminder: formData.get("reminder"),
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
		place,
		expiration,
		notification,
		reminder,
		notificationtime,
		notificationtype,
		specificday
	} = validatedFields.data;

	// Costanti per l'attività
	const activityColor = "#0000FF"; // color = blue
	const userId = await getCurrentID();

	// Parsiamo le date
	const expiration_parsed = parseDate(expiration, notificationtime);
	const specificday_parsed = parseDate(specificday, notificationtime);

	// Costanti per le notifiche reminder
	const lastsent_reminder = false;
	const completed = false;

	// Payload attività
	const Activity = {
		userId,
		title,
		description,
		place,
		expiration: expiration_parsed,
		color: activityColor,
		notification,
		notificationtime,
		notificationtype,
		specificday: specificday_parsed,
		reminder,
		lastsent_reminder,
		completed
	};

	// Insert the activity into the database
	await insertDB(ACTIVITIES, Activity);

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

export async function complete_activity(activity_id: string) {
	const activityObjectId = new ObjectId(activity_id);

	// Updatiamo a true il completamento della attività
	await updateDB(
		ACTIVITIES,
		{
			_id: activityObjectId
		},
		{
			completed: true
		}
	);
}

// Funzione per ottenere tutte le attività dell'utente
export async function getAllActivities(): Promise<Activity_FullCalendar[]> {
	const ID = await getCurrentID();

	// Check banale
	if (!ID) {
		console.log("User not found");
		return []; // return empty array to avoid undefined usage
	}

	const all_activities = (await findAllDB(ACTIVITIES, {
		userId: ID
	})) as Activity_DB[];

	// Ritorniamo le attività parsate in un formato compatibile con FullCalendar
	return FullCalendar_ActivityParser(all_activities);
}

// Funzione per ottenere le attività in scadenza
export async function getActvToNotify(
	current_date: Date
): Promise<Activity_DB[]> {
	// Otteniamo tutte le attività dell'utente con le notifiche attive
	const all_activitiesToNotify = (await findAllDB(ACTIVITIES, {
		notification: "on"
	})) as Activity_DB[];

	// Filtriamo le attività in scadenza
	const activities_to_notify: Activity_DB[] = [];
	for (const activity of all_activitiesToNotify) {
		if (await activity_notif_time_handler(activity, current_date)) {
			activities_to_notify.push(activity);
		}
	}

	// Ritorniamo le attività in scadenza
	return activities_to_notify;
}

// Funzione per ottenere le attività scadute con reminder attivo e non-completate
export async function getExpActvToRemind(current_date: Date) {
	// Otteniamo tutte le attività non completate con reminder attivo
	const all_activitiesToRemind = (await findAllDB(ACTIVITIES, {
		notification: "on",
		reminder: "on",
		completed: false
	})) as Activity_DB[];

	const expired_activities: Activity_DB[] = [];

	for (const activity of all_activitiesToRemind) {
		// Controlliamo se l'attività è da "remindare"
		if (await reminder_time_handler(activity, current_date)) {
			expired_activities.push(activity);
		}
	}

	return expired_activities;
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

// Funzione per ottenere l'attività più vicina in scadenza
export async function getNearestActivityTitle(): Promise<string | null> {
	// Otteniamo tutte le attività
	const ID = await getCurrentID();

	// Check banale
	if (!ID) {
		console.log("User not found");
		return null;
	}

	const all_activities = (await findAllDB(ACTIVITIES, {
		userId: ID
	})) as Activity_DB[];

	// Filtriamo le attività future
	const current_date = (await getVirtualDate()) ?? (await currentDate());
	const future_activities = all_activities.filter(
		(activity) => activity.expiration >= current_date
	);
	// Ritorniamo l'attività più vicina o null se non ci sono attività future
	return future_activities[0] ? future_activities[0].title : null;
}

// Funzione per ottenere un'attività specifica in base al suo ID nella sua forma parsata da FullCalendar
export async function get_ActivityById(
	activity_id: string | null
): Promise<Activity_FullCalendar | null> {
	const activity_array = await getAllActivities();
	const activity = activity_array.find(
		(activity) => activity.id === activity_id
	);
	return activity || null;
}

export async function update_activity(
	activityId: string,
	ActivityState: UpdateState,
	formData: FormData
) {
	// Validate form fields
	const validatedFields = UpdateSchema.safeParse({
		// The only fields that need to be updated
		title: formData.get("title"),
		place: formData.get("place"),
		description: formData.get("description")
	});

	if (!validatedFields.success) {
		console.log(
			"Validation failed",
			validatedFields.error.flatten().fieldErrors
		);
		return {
			errors: validatedFields.error.flatten().fieldErrors
		};
	}

	// Prepare data for insertion into database
	const { title, place, description } = validatedFields.data;

	const updates = {
		title,
		place,
		description
	};

	const userId = await getCurrentID();
	const objectId = new ObjectId(activityId);

	// Update the activity in the database
	await updateDB(ACTIVITIES, { _id: objectId, userId }, updates);

	return { message: "Activity updated successfully" };
}
