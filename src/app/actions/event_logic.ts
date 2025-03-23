"use server";

import { EventFormSchema, EventState } from "@/app/lib/definitions";
import { ObjectId } from "mongodb";
import { EVENTS, findAllDB, insertDB } from "../lib/mongodb";
import { getCurrentID } from "./auth";

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
		timestart: formData.get("timestart"),
		description: formData.get("description")
	});

	// If any form fields are invalid, return early
	if (!validatedFields.success) {
		return {
			errors: validatedFields.error.flatten().fieldErrors
		};
	}

	// Prepare data for insertion into database
	const { title, datestart, timestart, description } = validatedFields.data;

	// Create event object
	const event = {
		userId,
		title,
		datestart,
		timestart,
		description
	};

	// Insert event into database
	await insertDB(EVENTS, event);

	return { message: "Event created successfully" };
}


// Funzione per formattare gli eventi per FullCalendar
// MANCA IL TIME QUA SOTTO UOMO DIO CARO
function FullCalendar_EventParser(event_array: any) {
	return event_array.map((event: any) => {
		return {
			id: event._id.toString(),
			title: event.title,
			start: event.datestart.toISOString(),
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
	const obj_ID = new ObjectId(ID);

	const all_events = await findAllDB(EVENTS, { user_id: obj_ID });

	// Formattiamo gli eventi per FullCalendar
	return FullCalendar_EventParser(all_events);
}
