import { note } from "@/app/lib/definitions/def_note";
import isAuthenticated from "@/middleware";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentID } from "../../../actions/auth_logic";
import {
	NOTES,
	deleteDB,
	findDB,
	insertDB,
	updateDB
} from "../../../lib/mongodb";

//implementazione della classe presa da https://javascript.info/custom-errors
class HTTPError extends Error {
	status: number;
	constructor(status: number, message: string) {
		super(message);
		this.status = status;
		this.name = "HTTPError";
	}
}

async function getNote(id: string): Promise<note | null> {
	const userId = await getCurrentID();
	if (!userId) {
		throw new HTTPError(401, "Utente non autenticato");
	}

	const note = await findDB<note>(NOTES, { _id: new ObjectId(id) });

	if (!note) {
		throw new HTTPError(404, "Nota non trovata");
	}
	if (note.owner.toString() !== userId) {
		throw new HTTPError(403, "Questa nota non ti appartiene");
	}

	return note;
}

async function updateNote(
	id: string,
	updatedFields: Partial<note>
): Promise<note> {
	const result = await updateDB(
		NOTES,
		{ _id: new ObjectId(id) },
		{
			title: updatedFields.title,
			content: updatedFields.content,
			tags: updatedFields.tags
		}
	);
	if (result.modifiedCount === 0) {
		throw new Error("id non corrispondente ad alcuna nota");
	}
	let updatedNote = await getNote(id);
	if (!updatedNote) {
		throw new Error("questa cosa non è possibile");
	}
	return updatedNote;
}

async function deleteNote(id: string): Promise<void> {
	let userId = await getCurrentID();
	if (!userId) {
		throw new Error("Utente non autenticato");
	}

	const note = await findDB<note>(NOTES, { _id: new ObjectId(id) });

	if (!note) {
		throw new Error("Nota non trovata");
	}
	if (note.owner.toString() !== userId) {
		throw new Error("Questa nota non ti appartiene");
	}

	let result = await deleteDB(NOTES, {
		_id: new ObjectId(id)
	});
	console.log("deleteNote result:", result);
}

export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	let note: note | null;
	try {
		note = await getNote(params.id);
	} catch (error) {
		if (error instanceof HTTPError) {
			return NextResponse.json(
				{ error: error.message },
				{ status: error.status }
			);
		} else {
			console.log("Errore nel recupero della nota:", error);
			return NextResponse.json(
				{ error: "Problema generico" },
				{ status: 500 }
			);
		}
	}

	return NextResponse.json(note, { status: 200 });
}

export async function PUT(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	let { id } = await params;
	let reqData = await request.json();
	let updatedNote = await updateNote(id, reqData as Partial<note>);
	return NextResponse.json(updatedNote, { status: 200 });
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	let { id } = await params;
	deleteNote(id);
	return NextResponse.json({ message: `note deleted` }, { status: 200 });
}
