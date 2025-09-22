"use client";

import { useEffect, useState } from "react";
import type { note } from "../../lib/definitions/def_note";

export default function NoteCard({
	passedNote,
	onClick,
	onDelete
}: {
	passedNote: note;
	onClick: () => void | null;
	onDelete: (id: string) => void;
}) {
	async function deleteNote() {
		await fetch(`/api/notes/${passedNote._id}`, {
			method: "DELETE"
		});
		onDelete(String(passedNote._id));
	}
	return (
		<div className={"note-card"} style={{ display: "block" }}>
			<button onClick={deleteNote}>ELIMINA</button>
			<br />
			{passedNote.title}
			<br />
			{passedNote.content}
			<br />
			{passedNote.modified.toString()}
		</div>
	);
}
