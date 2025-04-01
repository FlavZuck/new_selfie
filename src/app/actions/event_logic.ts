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
		datestart: formData.get("datestart"),
		allDay: formData.get("allDay"),
		time: formData.get("timestart"),
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
	const { title, datestart, allDay, time, description } =
		validatedFields.data;

	// Parse date and time
	const start = parseDate(datestart, time);

	// Create event object
	const event = {
		userId,
		allDay,
		title,
		start,
		description
	};

	// Insert event into database
	await insertDB(EVENTS, event);

	return { message: "Event created successfully" };
}

// Funzione per formattare gli eventi per FullCalendar
function FullCalendar_EventParser(event_array: any) {
	return event_array.map((event: any) => {
		return {
			id: event._id.toString(),
			allDay: event.allDay,
			title: event.title,
			start: event.start.toISOString(),
			description: event.description
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
