import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentID } from "../../actions/auth_logic";
import isAuthenticated from "../../actions/auth_logic";
import type { note } from "../../lib/definitions/def_note";
import { NOTES, findAllDB, findCollection, insertDB } from "../../lib/mongodb";

async function getNotes(): Promise<note[]> {
	const userId = await getCurrentID();

	if (!userId) {
		throw new Error("Utente non autenticato???");
	}

	const notes = await findAllDB<note>(NOTES, { owner: new ObjectId(userId) });

	console.log("trovate", notes.length, "note per l'utente");

	return notes;
}

async function addNote(note: note): Promise<ObjectId> {
	const userId = await getCurrentID();

	if (!userId) {
		throw new Error("Utente non autenticato???");
	}

	const newNote: note = {
		owner: new ObjectId(userId),
		title: note.title || "",
		content: note.content || "",
		tags: note.tags || [],
		created: new Date(),
		modified: new Date()
	};

	return (await insertDB(NOTES, newNote)).insertedId;
}

export async function GET() {
	let notes: note[] = [];
	try {
		notes = await getNotes();
	} catch (error) {
		console.log("Errore nella ricerca delle note:", error);
		return NextResponse.json(
			{ error: "Non è stato possibile recuperare le note" },
			{ status: 500 } //TODO: considerare 403
		);
	}
	return NextResponse.json(notes, { status: 200 });
}

export async function POST(req: NextRequest) {
	/*if (!isAuthenticated()) {
		return NextResponse.json(
			{
				error: "Impossibile aggiungere una nota: utente non autenticato"
			},
			{ status: 403 }
		);
	}*/

	const reqdata = await req.json();

	let newNoteId: ObjectId;
	try {
		newNoteId = await addNote(reqdata as note);
	} catch (error) {
		console.log("Errore nell'inserimento della nota:", error);
		return NextResponse.json(
			{ error: "Non è stato possibile aggiungere la nota" },
			{ status: 500 } //TODO: utilizzare status code più appropriati
		);
	}

	let res = NextResponse.json(
		{
			message: "Nota aggiunta con successo",
			insertedId: newNoteId.toString()
		},
		{ status: 200 }
	);
	return res;
}
