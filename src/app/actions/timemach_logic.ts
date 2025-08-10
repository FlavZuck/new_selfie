"use server";

// Le seguenti funzioni gestiscono la data virtuale per la Time Machine
/* La data virtuale viene calcolata dal momento attuale più un offset
 che viene salvato nel database. Questo ci permette di simulare il passare del tempo */
import { SETTINGS, findCollection } from "../lib/mongodb";

const VIRTUAL_DATE_KEY = "virtualDate";

export async function getVirtualDate(): Promise<Date | null> {
	const collection = await findCollection(SETTINGS);
	const doc = await collection.findOne({ key: VIRTUAL_DATE_KEY });
	// Il documento potrebbe non esistere, quindi usiamo ?
	const timeoffset = doc?.value ? doc.value : null;
	if (!timeoffset) {
		return null;
	} else {
		return new Date(Date.now() + timeoffset);
	}
}

export async function setVirtualDate(date: Date): Promise<void> {
	if (!date) {
		throw new Error("Date must be provided");
	}
	const collection = await findCollection(SETTINGS);
	const timeoffset = date.getTime() - Date.now();
	await collection.updateOne(
		{ key: VIRTUAL_DATE_KEY },
		{ $set: { value: timeoffset } },
		{ upsert: true } // Se il documento non esiste, lo creiamo
	);
	console.log(`Virtual date started at: ${date.toISOString()}`);
}

export async function resetVirtualDate(): Promise<void> {
	const collection = await findCollection(SETTINGS);
	await collection.updateOne(
		{ key: VIRTUAL_DATE_KEY },
		{ $set: { value: null } }
	);
	console.log("Virtual date reset");
}
