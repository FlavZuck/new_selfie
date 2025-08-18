"use server";

import { Activity_DB } from "@/app/lib/definitions/def_actv";
import { Event_DB } from "@/app/lib/definitions/def_event";
import { ACTIVITIES, EVENTS, findAllDB, insertDB } from "@/app/lib/mongodb";
import ical from "ical-generator";
import ICAL from "ical.js";
import { getCurrentID } from "../auth_logic";

async function getEventsDB(userId: string): Promise<Event_DB[]> {
	const events: Event_DB[] = await findAllDB(EVENTS, { userId });
	return events;
}
async function getActivitiesDB(userId: string): Promise<Activity_DB[]> {
	const activities: Activity_DB[] = await findAllDB(ACTIVITIES, { userId });
	return activities;
}

export async function exportCalendar(): Promise<string> {
	// Inizializzazione delle costanti necessarie
	const calendar = ical({ name: "Calendario" });
	const userId = await getCurrentID();
	if (!userId) {
		throw new Error("User ID not found");
	}
	const events = await getEventsDB(userId);
	const activities = await getActivitiesDB(userId);

	// Aggiunta degli eventi al calendario
	for (const event of events) {
		const start = new Date(event.start);
		calendar.createEvent({
			start,
			end: event.dateend || undefined,
			summary: event.title,
			allDay: event.allDay === "on",
			description: event.description,
			location: event.place,
			repeating: event.rrule || undefined
		});
	}

	// Aggiunta delle attività al calendario
	for (const activity of activities) {
		calendar.createEvent({
			start: activity.expiration,
			allDay: true,
			summary: activity.title,
			description: activity.description,
			location: activity.place
		});
	}

	return calendar.toString();
}

export async function importCalendar(icalData: string) {
	// Inizializzazione del parser ICAL e degli array
	const calendar = ICAL.parse(icalData);
	const userId = await getCurrentID();
	const events: Event_DB[] = [];
	const activities: Activity_DB[] = [];

	// Costanti per i colori
	const normalColor = "#FF5733"; // color = red
	const recurringColor = "#33FF57"; // color = green
	const activityColor = "#0000FF"; // color = blue

	// Iterazione sul calendario per estrarre eventi e attività
	for (const key in calendar) {
		const event = calendar[key];
		if (event.type === "VEVENT") {
			// Parse event data
			events.push({
				_id: key,
				userId,
				title: event.summary || "no title",
				description: event.description || "no description",
				place: event.location || "",
				start: new Date(event.start),
				dateend: event.end ? new Date(event.end) : "",
				allDay: event.allDay ? "on" : null,
				color: event.rrule ? recurringColor : normalColor,
				rrule: event.rrule || undefined,
				notification: false,
				notificationtime: "",
				notificationtype: "",
				specificdelay: 0
			} as Event_DB);
		} else if (event.type === "VTODO") {
			// Parse activity data
			activities.push({
				_id: key,
				userId,
				title: event.summary || "",
				description: event.description || "",
				place: event.location || "",
				expiration: new Date(event.due),
				color: activityColor,
				notification: false,
				notificationtime: "",
				notificationtype: "",
				specificday: null,
				reminder: false,
				lastsent_reminder: false,
				completed: false
			} as Activity_DB);
		}
	}

	// Loop di inserimento degli eventi nel database
	for (const event of events) {
		await insertDB(EVENTS, event);
	}
	// Loop di inserimento delle attività nel database
	for (const activity of activities) {
		await insertDB(ACTIVITIES, activity);
	}
}
