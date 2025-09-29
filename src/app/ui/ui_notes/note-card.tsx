"use client";

import { ObjectId } from "mongodb";
//import { useEffect, useState } from "react";
import type { note } from "../../lib/definitions/def_note";

export default function NoteCard({
	passedNote,
	onEdit,
	onDelete,
	onDuplicate
}: {
	passedNote: note;
	onEdit: (id: string) => void;
	onDelete: (id: string) => void;
	onDuplicate: (id: ObjectId) => void;
}) {
	async function deleteNote() {
		await fetch(`/api/notes/${passedNote._id}`, {
			method: "DELETE"
		});
		onDelete(String(passedNote._id));
	}
	async function duplicateNote() {
		const res = await fetch(`/api/notes/`, {
			method: "POST",
			body: JSON.stringify({
				owner: passedNote.owner,
				title: passedNote.title,
				content: passedNote.content,
				tags: passedNote.tags
			})
		});
		const data = (await res.json()) as { insertedId?: ObjectId };
		if (!data.insertedId) {
			console.error(data);
			console.error(
				"Errore nella duplicazione della nota: ID non ricevuto"
			);
			return;
		}
		onDuplicate(data.insertedId);
	}
	return (
		<div className={"card"} style={{ display: "block" }}>
			<div className={"card-header"}>
				<button className={"btn"} onClick={deleteNote}>
					ELIMINA
				</button>
				<button className={"btn"} onClick={duplicateNote}>
					DUPLICA
				</button>
			</div>

			<button
				className={"btn"}
				onClick={() => {
					onEdit(String(passedNote._id));
				}}
			>
				{passedNote.title}
				<br />
				{passedNote.content.substring(0, 200)}
				<br />
				Ultima modifica: {passedNote.modified.toLocaleString()}
			</button>
		</div>
	);
}
