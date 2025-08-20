"use server";

import { Activity_DB } from "@/app/lib/definitions/def_actv";
import { Event_DB } from "@/app/lib/definitions/def_event";
import { ACTIVITIES, EVENTS, findAllDB, upsertDB } from "@/app/lib/mongodb";
import ical from "ical-generator";
import ICAL from "ical.js";
import { ObjectId } from "mongodb";
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
			id: event._id.toString(),
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
			id: activity._id.toString(),
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
	const jcalData = ICAL.parse(icalData);
	const vcalendar = new ICAL.Component(jcalData);
	const vevents = vcalendar.getAllSubcomponents("vevent");
	const vtodos = vcalendar.getAllSubcomponents("vtodo");
	const userId = await getCurrentID();
	const events: Event_DB[] = [];
	const activities: Activity_DB[] = [];

	// Costanti per i colori
	const normalColor = "#FF5733"; // color = red
	const recurringColor = "#33FF57"; // color = green
	const activityColor = "#0000FF"; // color = blue

	// Iterazione VEVENT
	for (const veventComp of vevents) {
		const vevent = new ICAL.Event(veventComp);

		// Attempt to reuse original ID from VEVENT UID if valid, else generate new
		const veventUid = vevent.uid || "";
		const eventId = ObjectId.isValid(veventUid)
			? new ObjectId(veventUid)
			: new ObjectId();

		events.push({
			_id: eventId,
			userId,
			title: vevent.summary || "no title",
			description: vevent.description || "no description",
			place: vevent.location || "",
			start: vevent.startDate.toJSDate(),
			dateend: vevent.endDate ? vevent.endDate.toJSDate() : "",
			allDay: vevent.startDate.isDate ? "on" : null,
			color: vevent.component.getFirstPropertyValue("rrule")
				? recurringColor
				: normalColor,
			rrule: vevent.component.getFirstPropertyValue("rrule") || undefined,
			notification: false,
			notificationtime: "",
			notificationtype: "",
			specificdelay: 0
		} as Event_DB);
	}
	// Iterazione VTODO
	// Parte abbastanza macchinosa per colpa del formato VTODO non sempre presente
	for (const vtodoComp of vtodos) {
		const dueProp = vtodoComp.getFirstPropertyValue("due");
		let expirationDate: Date;
		if (dueProp && typeof dueProp !== "string" && "toJSDate" in dueProp) {
			expirationDate = (dueProp as ICAL.Time).toJSDate();
		} else if (typeof dueProp === "string") {
			expirationDate = new Date(dueProp);
		} else {
			expirationDate = new Date();
		}
		const id = vtodoComp.getFirstPropertyValue("uid")?.toString() || "";
		// Proviamo a riutilizzare l'ID, altrimenti ne generiamo uno nuovo
		const activityId = ObjectId.isValid(id)
			? new ObjectId(id)
			: new ObjectId();

		activities.push({
			_id: activityId,
			userId,
			title: vtodoComp.getFirstPropertyValue("summary") || "",
			description: vtodoComp.getFirstPropertyValue("description") || "",
			place: vtodoComp.getFirstPropertyValue("location") || "",
			expiration: expirationDate,
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

	// Loop di inserimento degli eventi nel database
	for (const eventObj of events) {
		// Verifica se esiste già un'attività con lo stesso _id (auto-importazioni)
		const existAsActivity = await findAllDB(ACTIVITIES, {
			_id: eventObj._id
		});
		if (existAsActivity.length > 0) {
			continue;
		} else {
			// Importa o aggiorna l'evento: upsert evita duplicati nel collection EVENTS
			await upsertDB(EVENTS, { _id: eventObj._id }, eventObj);
		}
	}
	// Loop di inserimento delle attività nel database
	for (const activityObj of activities) {
		await upsertDB(ACTIVITIES, { _id: activityObj._id }, activityObj);
	}
}
