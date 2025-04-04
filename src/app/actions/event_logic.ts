"use server";

import { EventFormSchema, EventState } from "@/app/lib/definitions";
import { EVENTS, findAllDB, insertDB } from "../lib/mongodb";
import { getCurrentID } from "./auth";

// Funzione per parsare la data e ora in un formato compatibile con FullCalendar
function parseDate(date: Date, time: string) {
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

export async function create_event(state: EventState, formData: FormData) {
	const userId = await getCurrentID();

	if (!userId) {
		return {
			message: "You must be logged in to create events"
		};
	}

	// Validate form fields
	const validatedFields = EventFormSchema.safeParse({
		title: formData.get("title"),
		place: formData.get("place"),
		datestart: formData.get("datestart"),
		allDay: formData.get("allDay"),
		dateend: formData.get("dateend"),
		time: formData.get("time"),
		duration: formData.get("duration"),
		description: formData.get("description")
	});

	// If any form fields are invalid, return early
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
	const {
		title,
		place,
		datestart,
		allDay,
		dateend,
		time,
		duration,
		description
	} = validatedFields.data;

	// Parse date and time
	const start = parseDate(datestart, time);

	// Create event object
	const event = {
		userId,
		allDay,
		title,
		start,
		dateend,
		duration,
		description,
		place
	};

	// Insert event into database
	await insertDB(EVENTS, event);

	return { message: "Event created successfully" };
}

// Funzione per formattare gli eventi per FullCalendar
function FullCalendar_EventParser(event_array: any) {
	return event_array.map((event: any) => {
		return {
			// Nei seguenti campi non serve fare niente di particolare
			id: event._id.toString(),
			allDay: event.allDay,
			title: event.title,
			start: event.start.toISOString(),
			// The end date sometimes is not present, so we need to check if it exists
			end: event.dateend ? event.dateend.toISOString() : null,
			// Qui vanno i dati che non riconosciuti da FullCalendar
			extendedProps: {
				duration: event.duration,
				description: event.description,
				place: event.place
			}
		};
	});
}

// Funzione per recuperare tutti gli eventi dell'utente corrente
export async function getAllEvents() {
	const ID = await getCurrentID();

	if (!ID) {
		return {
			message: "User not found"
		};
	}

	const all_events = await findAllDB(EVENTS, { userId: ID });

	// Formattiamo gli eventi per FullCalendar
	return FullCalendar_EventParser(all_events);
}
