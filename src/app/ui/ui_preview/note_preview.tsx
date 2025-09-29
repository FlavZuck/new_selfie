"use client";

import { note } from "@/app/lib/definitions/def_note";
import { useEffect, useState } from "react";

async function fetchNotes() {
	const data = await fetch("/api/notes", { method: "GET" });
	if (!data) {
		throw new Error("Errore generico nella richiesta");
	}
	if (!data.ok) {
		throw new Error("Errore nella richiesta: " + data.statusText);
	}
	let notesData = await data.json();
	if (!notesData) {
		throw new Error("Risposta mal formata?");
	}
	notesData = notesData.map((note: note) => {
		note.created = new Date(note.created);
		note.modified = new Date(note.modified);
		return note;
	});
	return notesData as note[];
}

function getMostRecentNoteModified(notes: note[]): note | null {
	if (!notes || notes.length === 0) return null;
	return notes.reduce((mostRecent, current) => {
		return current.modified > mostRecent.modified ? current : mostRecent;
	});
}

function getMostRecentNoteCreated(notes: note[]): note | null {
	if (!notes || notes.length === 0) return null;
	return notes.reduce((mostRecent, current) => {
		return current.created > mostRecent.created ? current : mostRecent;
	});
}

export default function NotePreview() {
	const [notesMod, setNotesMod] = useState<note | null>(null);
	const [notesCreat, setNotesCreat] = useState<note | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		setLoading(true);
		setError(null);
		fetchNotes()
			.then((data) => {
				setNotesMod(getMostRecentNoteModified(data));
				setNotesCreat(getMostRecentNoteCreated(data));
			})
			.catch((err) => {
				console.error("Error fetching notes:", err);
				setNotesMod(null);
				setNotesCreat(null);
				setError("Errore nel caricamento");
			})
			.finally(() => setLoading(false));
	}, []);

	return (
		<div
			className="preview-box rounded border border-1 bg-light-subtle px-4 py-3 small text-start position-relative"
			aria-live="polite"
			style={{ fontSize: "0.8rem" }}
		>
			<div className="mb-2">
				<strong
					className="text-secondary"
					style={{ fontSize: "0.75rem", letterSpacing: ".5px" }}
				>
					Ultime note
				</strong>
			</div>

			{loading && (
				<div className="text-center py-2">
					<div
						className="spinner-border spinner-border-sm text-primary"
						role="status"
						aria-label="Caricamento"
					/>
				</div>
			)}

			{!loading && error && (
				<div className="text-danger" style={{ fontSize: "0.75rem" }}>
					{error}
				</div>
			)}

			{!loading && !error && notesMod && notesCreat && (
				<div className="d-flex flex-column gap-3">
					{/* Nota più recentemente modificata */}
					<div className="d-flex align-items-start gap-2">
						<span className="badge preview-badge bg-primary text-light shadowed">
							Modificata
						</span>
						<span
							className="text-truncate flex-grow-1 fw-semibold"
							title={String(notesMod.title)}
							style={{ fontSize: "0.82rem", maxWidth: "100%" }}
						>
							{String(notesMod.title)}
						</span>
					</div>
					{/* Nota più recentemente creata */}
					<div className="d-flex align-items-start gap-2">
						<span className="badge preview-badge bg-success text-light shadowed">
							Creata
						</span>
						<span
							className="text-truncate flex-grow-1 fw-semibold"
							title={String(notesCreat.title)}
							style={{ fontSize: "0.8rem" }}
						>
							{String(notesCreat.title)}
						</span>
					</div>
				</div>
			)}

			{!loading && !error && !(notesMod && notesCreat) && (
				<div className="text-muted" style={{ fontSize: "0.75rem" }}>
					Nessuna nota disponibile
				</div>
			)}
		</div>
	);
}
