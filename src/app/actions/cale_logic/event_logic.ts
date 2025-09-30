"use server";

import {
	EventFormSchema,
	EventState,
	Event_DB,
	Event_FullCalendar
} from "@/app/lib/definitions/def_event";
import { UpdateSchema, UpdateState } from "@/app/lib/definitions/def_updt";
import { ObjectId } from "mongodb";
import { RRule } from "rrule";
import {
	EVENTS,
	deleteDB,
	findAllDB,
	insertDB,
	updateDB
} from "../../lib/mongodb";
import { getCurrentID } from "../auth_logic";
import {
	event_notif_time_handler,
	recurrent_notif_time_handler
} from "../sched_logic";
import { currentDate, getVirtualDate } from "../timemach_logic";

// Funzione per parsare la data e ora in un formato compatibile con lo Date standard
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

// Funzione per formattare l'array di giorni in un formato compatibile con RRule
function formatDaysArray(dayarray: string[] | string = "") {
	if (dayarray == "") {
		return dayarray;
	}

	if (typeof dayarray === "string") {
		return dayarray.split(",").filter(Boolean);
	}

	const daysMap: { [key: string]: string } = {
		Lunedì: "MO",
		Martedì: "TU",
		Mercoledì: "WE",
		Giovedì: "TH",
		Venerdì: "FR",
		Sabato: "SA",
		Domenica: "SU"
	};
	// Mappa i giorni dell'array in base alla mappa definita sopra
	// e filtra i giorni non validi
	return dayarray.map((day) => daysMap[day] || null).filter(Boolean);
}

// Funzione per formattare gli eventi per FullCalendar
function FullCalendar_EventParser(event_array: any) {
	return event_array.map((event: any) => {
		return {
			// Nei seguenti campi non serve fare niente di particolare
			id: event._id.toString(),
			allDay: event.allDay,
			title: event.title,
			start: event.start,
			// La data di fine talvolta non è presente, quindi controlliamo se esiste
			end: event.dateend ? event.dateend.toISOString() : null,
			// Passiamo il colore dell'evento
			color: event.color,
			// La ricorrenza talvolta non è presente, quindi controlliamo se esiste
			rrule: event.rrule ? event.rrule : null,

			// Qui vanno i dati che non riconosciuti da FullCalendar
			extendedProps: {
				duration: event.duration,
				description: event.description,
				place: event.place,
				type: "EVENT"
			}
		};
	});
}

// Funzione per parsare l'oggetto RRule per la ricorrenza
function parseRrule(
	freq: string,
	dayarray: string[] | string = "",
	mh_day: number | string = "",
	yh_month: number | string = "",
	yh_day: number | string = "",
	count: number,
	until: Date | string = "",
	datestart: Date
) {
	// Map string freq to RRule constant
	const freqMap: Record<string, number> = {
		DAILY: RRule.DAILY,
		WEEKLY: RRule.WEEKLY,
		MONTHLY: RRule.MONTHLY,
		YEARLY: RRule.YEARLY
	};
	const freqNum = freqMap[freq] || RRule.DAILY;
	// Abbiamo dovuto gestire count in sto modo
	if (count > 0) {
		if (freq == "DAILY") {
			return {
				freq: freqNum,
				dtstart: datestart,
				count: count,
				until: until
			};
		} else if (freq == "WEEKLY") {
			return {
				freq: freqNum,
				byweekday: formatDaysArray(dayarray),
				dtstart: datestart,
				count: count,
				until: until
			};
		} else if (freq == "MONTHLY") {
			return {
				freq: freqNum,
				bymonthday: mh_day,
				dtstart: datestart,
				count: count,
				until: until
			};
		} else if (freq == "YEARLY") {
			return {
				freq: freqNum,
				bymonth: yh_month,
				bymonthday: yh_day,
				dtstart: datestart,
				count: count,
				until: until
			};
		}
	} else {
		if (freq == "DAILY") {
			return {
				freq: freqNum,
				dtstart: datestart,
				until: until
			};
		} else if (freq == "WEEKLY") {
			return {
				freq: freqNum,
				byweekday: formatDaysArray(dayarray),
				dtstart: datestart,
				until: until
			};
		} else if (freq == "MONTHLY") {
			return {
				freq: freqNum,
				bymonthday: mh_day,
				dtstart: datestart,
				until: until
			};
		} else if (freq == "YEARLY") {
			return {
				freq: freqNum,
				bymonth: yh_month,
				bymonthday: yh_day,
				dtstart: datestart,
				until: until
			};
		}
	}
}

export async function create_event(state: EventState, formData: FormData) {
	// Validate form fields (await async refinements)
	const validatedFields = await EventFormSchema.safeParseAsync({
		// Base event fields
		title: formData.get("title"),
		place: formData.get("place"),
		datestart: formData.get("datestart"),
		description: formData.get("description"),
		// Timed/allDay event fields
		allDay: formData.get("allDay"),
		dateend: formData.get("dateend"),
		time: formData.get("time"),
		duration: formData.get("duration"),
		// Notification fields
		notification: formData.get("notification"),
		notificationtime: formData.get("notificationtime"),
		notificationtype: formData.get("notificationtype"),
		specificdelay: formData.get("specificdelay"),
		// Recurrence fields
		recurrence: formData.get("recurrence"),
		frequency: formData.get("frequency"),
		dayarray: formData.get("dayarray"),
		mh_day: formData.get("mh_day"),
		yh_month: formData.get("yh_month"),
		yh_day: formData.get("yh_day"),
		undef: formData.get("undef"),
		count: formData.get("count"),
		until: formData.get("until")
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
		description,
		allDay,
		dateend,
		time,
		duration,
		notification,
		notificationtime,
		notificationtype,
		specificdelay,
		recurrence,
		frequency,
		dayarray,
		mh_day,
		yh_month,
		yh_day,
		count,
		until
	} = validatedFields.data;

	// Parse date and time
	const start = parseDate(datestart, time);

	// Color for normal events and recurring events
	const normalColor = "#FF5733"; // color = red
	const recurringColor = "#33FF57"; // color = green

	// Get the current user ID
	const userId = await getCurrentID();

	// Create event object
	const NormalEvent = {
		userId,
		title,
		description,
		place,
		allDay,
		start,
		dateend,
		duration,
		notification,
		notificationtime,
		notificationtype,
		specificdelay,
		color: normalColor
	};

	// Check if it's a normal event or a recurring event
	if (recurrence) {
		// Parse recurrence data
		const rrule = parseRrule(
			frequency,
			dayarray,
			mh_day,
			yh_month,
			yh_day,
			count,
			until,
			start
		);

		// Add recurrence data to event object
		const RecurringEvent = {
			userId,
			allDay,
			title,
			duration,
			description,
			place,
			notification,
			notificationtime,
			notificationtype,
			specificdelay,
			rrule,
			color: recurringColor
		};
		// Insert the RecurrentEvent into database
		await insertDB(EVENTS, RecurringEvent);
	} else {
		// Insert the NormalEvent into database
		await insertDB(EVENTS, NormalEvent);
	}

	return { message: "Event created successfully" };
}

// Funzione per eliminare un evento
export async function delete_event(eventId: string) {
	const eventId_object = new ObjectId(eventId);

	// Delete the event from the database
	await deleteDB(EVENTS, {
		_id: eventId_object
	});
}

// Funzione per recuperare tutti gli eventi dell'utente corrente
export async function getAllEvents(): Promise<Event_FullCalendar[]> {
	const ID = await getCurrentID();

	// Check banale
	if (!ID) {
		console.log("User not found");
		return []; // ensure we always return an array
	}

	const all_events = (await findAllDB(EVENTS, {
		userId: ID
	})) as Event_DB[];

	// Formattiamo gli eventi per FullCalendar
	return FullCalendar_EventParser(all_events);
}

// Funzione per recuperare un evento specifico in base al suo ID nella sua forma parsata da FullCalendar
export async function get_EventById(
	unparsed_event_id: string | null
): Promise<Event_FullCalendar | null> {
	const event_array = await getAllEvents();
	const event = event_array.find((event) => event.id === unparsed_event_id);
	return event || null;
}

export async function update_event(
	eventId: string,
	EventState: UpdateState,
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
	const objectId = new ObjectId(eventId);

	// Update the event in the database
	await updateDB(
		EVENTS,
		{
			_id: objectId,
			userId
		},
		updates
	);

	return { message: "Event updated successfully" };
}

// Funzione per ottenere gli eventi normali da notificare
export async function getEventsToNotify(
	current_date: Date
): Promise<Event_DB[]> {
	// Troviamo gli eventi normali con notifica attiva
	const events = (await findAllDB(EVENTS, {
		notification: "on",
		rrule: { $exists: false }
	})) as Event_DB[];

	const events_to_notify: Event_DB[] = [];
	for (const event of events) {
		if (await event_notif_time_handler(event, current_date)) {
			events_to_notify.push(event);
		}
	}

	return events_to_notify;
}

export async function getRecEventsToNotify(
	current_date: Date
): Promise<Event_DB[]> {
	// Troviamo gli eventi ricorrenti con notifica attiva e start >= current_date
	const recurringEvents = (await findAllDB(EVENTS, {
		notification: "on",
		rrule: { $exists: true }
	})) as Event_DB[];

	// Dobbiamo capire se la data corrente è compresa nell'intervallo di ricorrenza
	const filtered_recurringEvents = recurringEvents.filter((event) => {
		const rrule = event.rrule;
		if (!rrule) return false;

		const rule = new RRule(rrule);
		const day = 1000 * 60 * 60 * 24; // Un giorno in millisecondi
		const week = day * 8; // Un intervallo di una settimana in millisecondi
		// Facciamo un intervallo grande per evitare problemi di fuso orario
		const occurrences = rule.between(
			new Date(current_date.getTime() - week),
			new Date(current_date.getTime() + day * 2),
			true
		);
		return occurrences.length > 0;
	});

	// Ora che abbiamo degli eventi con sicuro almeno qualcosa da notificare
	// dobbiamo filtrare quelli che hanno effettivamente bisogno di una notifica
	const events_to_notify: Event_DB[] = [];

	for (const event of filtered_recurringEvents) {
		if (await recurrent_notif_time_handler(event, current_date)) {
			events_to_notify.push(event);
		}
	}

	return events_to_notify;
}

export async function getNearestEventTitle(): Promise<string | null> {
	const ID = await getCurrentID();

	// Check banale
	if (!ID) {
		console.log("User not found");
		return null;
	}

	// Prendiamo tutti gli eventi dell'utente
	const all_events = (await findAllDB(EVENTS, {
		userId: ID
	})) as Event_DB[];

	if (all_events.length === 0) {
		return null;
	}

	// Troviamo l'evento più vicino nel futuro
	const current_date = (await getVirtualDate()) ?? (await currentDate());

	const future_events = all_events.filter(
		(event) => event.start >= current_date
	);

	return future_events[0] ? future_events[0].title : null;
}
