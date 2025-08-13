"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { note } from "../lib/definitions/def_note";

export default function Notes() {
	const [notes, setNotes] = useState([] as note[]);

	async function fetchNotes() {
		const data = await fetch("/api/notes", {
			method: "GET"
		});
		if (!data) {
			throw new Error("Errore generico nella richiesta");
		}

		if (!data.ok) {
			throw new Error("Errore nella richiesta: " + data.statusText);
		}

		const notesData = await data.json();
		if (!notesData) {
			throw new Error("Risposta mal formata???");
		}

		setNotes(notesData as note[]);
	}

	useEffect(() => {
		fetchNotes();
	}, []);

	return (
		<ul>
			{notes.map((note) => (
				<li>{note.title}</li>
			))}
		</ul>
	);
}
