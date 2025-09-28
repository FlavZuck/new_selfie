"use client";

//import { useEffect, useState } from "react";
import type { note } from "../../lib/definitions/def_note";

export default function NoteCard({
	passedNote,
	onEdit,
	onDelete
}: {
	passedNote: note;
	onEdit: (id: string) => void;
	onDelete: (id: string) => void;
}) {
	async function deleteNote() {
		await fetch(`/api/notes/${passedNote._id}`, {
			method: "DELETE"
		});
		onDelete(String(passedNote._id));
	}

	return (
		<div className={"card"} style={{ display: "block" }}>
			<div className={"card-header"}>
				<button className={"btn"} onClick={deleteNote}>
					ELIMINA
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
				{passedNote.content}
				<br />
				{passedNote.modified.toString()}
			</button>
		</div>
	);
}
