"use server";

import { EventFormSchema, EventState } from "@/app/lib/definitions";
import { ObjectId } from "mongodb";
import { EVENTS, insertDB } from "../lib/mongodb";
import { getCurrentID } from "./auth";

export async function createEvent(state: EventState, formData: FormData) {
	// Validiamo i campi del form
	const validatedFields = EventFormSchema.safeParse({
		date: formData.get("date"),
		time: formData.get("time"),
		description: formData.get("description")
	});

	// Se i campi del form non sono validi, ritorniamo subito
	if (!validatedFields.success) {
		return {
			errors: validatedFields.error.flatten().fieldErrors
		};
	}

	// Riprendiamo i dati validati
	const { date, time, description } = validatedFields.data;

	// Non sono sicuro che formatti nello stesso modo nostro, da testare
	const formattedDate = new Date(date).toLocaleDateString("it-IT");

	// Riprendiamo l'ID dell'utente corrente
	const ID = await getCurrentID();
	if (!ID) {
		return {
			message: "User not found"
		};
	}
	const obj_ID = new ObjectId(ID);

	// Per ora non controlliamo che il payload sia unico e ne checkiamo il objectId
	// Payload da inserire nel database
	const payload = {
		user_id: obj_ID,
		date: formattedDate,
		time: time,
		description: description
	};

	// Inseriamo l'evento nel database ( nella collection EVENTS )
	await insertDB(EVENTS, payload);

	console.log("Event inserted into database");
}
