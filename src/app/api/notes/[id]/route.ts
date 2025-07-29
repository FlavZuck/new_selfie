import { note } from "@/app/lib/definitions/def_note";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentID } from "../../../actions/auth_logic";
import { NOTES, findDB, insertDB } from "../../../lib/mongodb";

async function getNote(id: string): Promise<note | null> {
	const userId = await getCurrentID();

	const note = await findDB<note>(NOTES, { _id: new ObjectId(id) });

	if (!note) {
		throw new Error("Nota non trovata");
	}
	if (note.owner.toString() !== userId) {
		throw new Error("Questa nota non ti appartiene");
	}

	return note;
}

async function updateNote() {}

async function deleteNote() {}

export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	let note: note | null;
	try {
		note = await getNote(params.id);
	} catch (error) {
		console.log("Errore nel recupero della nota:", error);
		return NextResponse.json(
			{ error: "Problema generico" },
			{ status: 400 }
		); //TODO: NON VA BENE
	}

	return NextResponse.json(note, { status: 200 });
}

export async function PUT(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	return NextResponse.json({ message: `PUT Radio ${params.id}` });
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	return NextResponse.json({ message: `DELETE Radio ${params.id}` });
}
