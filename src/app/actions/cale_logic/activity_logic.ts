"use server";

import {
	ActivitySchema,
	ActivityState,
	Activity_DB,
	Activity_FullCalendar
} from "@/app/lib/definitions/def_actv";
import { ObjectId } from "mongodb";
import { ACTIVITIES, deleteDB, findAllDB, insertDB } from "../../lib/mongodb";
import { getCurrentID } from "../auth";

// NOTA BENE:
// Molta della logica usata è piuttosto simile a quella usata per gli eventi,
// per cui appena abbiam tempo meglio se asportiamo le cose in comune in un file
// separato e importiamo quello.

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
				type: "ACTIVITY" as const
			}
		};
	});
}

export async function create_activity(
	state: ActivityState,
	formData: FormData
) {
	// Validate the form data using the schema
	const validatedFields = ActivitySchema.safeParse({
		title: formData.get("title"),
		description: formData.get("description"),
		expiration: formData.get("expiration")
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

	const { title, description, expiration } = validatedFields.data;

	const activityColor = "#0000FF"; // color = blue

	const userId = await getCurrentID();

	const Activity = {
		userId,
		title,
		description,
		expiration,
		color: activityColor
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
