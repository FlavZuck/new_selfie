"use server";

// Le seguenti funzioni gestiscono la data virtuale per la Time Machine
// L'uso del localStorage è un po' cope, però ci gestiamo così
import { SETTINGS, findCollection } from "../lib/mongodb";

const VIRTUAL_DATE_KEY = "virtualDate";

export async function getVirtualDate(): Promise<Date | null> {
	const collection = await findCollection(SETTINGS);
	const doc = await collection.findOne({ key: VIRTUAL_DATE_KEY });
	const date = doc?.value ? new Date(doc.value) : null;
	return date ?? null;
}

export async function setVirtualDate(date: Date): Promise<void> {
	if (!date) {
		throw new Error("Date must be provided");
	}
	const collection = await findCollection(SETTINGS);
	await collection.updateOne(
		{ key: VIRTUAL_DATE_KEY },
		{ $set: { value: date } },
		{ upsert: true }
	);
	console.log(`Virtual date set to: ${date.toISOString()}`);
}

export async function resetVirtualDate(): Promise<void> {
	const collection = await findCollection(SETTINGS);
	await collection.updateOne(
		{ key: VIRTUAL_DATE_KEY },
		{ $set: { value: null } }
	);
	console.log("Virtual date reset");
}
