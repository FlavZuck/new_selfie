"use client";

import { ObjectId } from "mongodb";
import { FormEvent, useEffect, useState } from "react";
import {
	NoteSorter,
	note,
	sortDirection,
	sortMode
} from "../lib/definitions/def_note";
import NoteCard from "../ui/ui_notes/note-card";
import NoteDialog from "../ui/ui_notes/note-dialog";

export default function Notes() {
	const [notes, setNotes] = useState([] as note[]);
	const [loading, setLoading] = useState(true);
	const [sortingMode, setSortingMode] = useState(
		new NoteSorter("byCreated", 1)
	);
	const [sortDirection, setSortDirection] = useState(1 as sortDirection);

	const [openedId, setOpenedId] = useState<string | null>(null);

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

		// new Date necessario per utilizzare il metodo getTime()
		// che non viene aggiunto al prototipo poiché risultato
		// di una deserializzazione JSON ("casting without instantiation")
		// fonte: https://stackoverflow.com/questions/2627650/why-javascript-gettime-is-not-a-function
		notesData = notesData.map((note: note) => {
			note.created = new Date(note.created);
			note.modified = new Date(note.modified);
			return note;
		});

		//TODO: Sorting fatto rispetto alla scelta dell'utente, da memorizzare dove?
		setNotes(sortingMode.sort(notesData));
		setLoading(false);
	}

	/*async function fetchNote(id:ObjectId) {
		let note = await fetch(`/api/notes/${id.toString()}`, { method: "GET" });
		return note;
	}*/

	// TODO analizzare tutte queste funzioni nell'ottica di separation of concerns
	function initNoteDialog(note: note) {
		const dialog = document.querySelector(
			"#noteDialog"
		) as HTMLDialogElement;
		const inputTitolo = dialog.querySelector(
			"input[name='titoloNota']"
		) as HTMLInputElement;
		const inputTesto = dialog.querySelector(
			"textarea[name='testoNota']"
		) as HTMLInputElement;
		const tagslist = dialog.querySelector("#tagslist") as HTMLDivElement;
		note.tags.forEach((tag) => {
			const newTag = document.createElement("span");
			newTag.className = "badge bg-secondary m-1";
			newTag.textContent = tag.toString();
			newTag.onclick = () => {
				newTag.remove();
			};
			tagslist?.appendChild(newTag);
		});
		inputTitolo.value = note ? `${note.title}` : ""; //accenti necessari per portare String a string
		inputTesto.value = note ? `${note.content}` : "";
	}
	function showNoteDialog() {
		const dialog = document.querySelector(
			"#noteDialog"
		) as HTMLDialogElement;

		dialog.showModal();
	}

	async function newNote() {
		const response = await fetch("/api/notes", {
			method: "POST",
			body: JSON.stringify({
				title: "",
				content: "",
				tags: []
			})
		});
		const responseData = await response.json();
		if (response.status !== 200) {
			console.error("ERRORE IN NEWNOTE");
			return;
		}
		setOpenedId(responseData.insertedId);
		showNoteDialog();
	}

	async function editNote(noteId: string) {
		const response = await fetch(`/api/notes/${noteId}`, { method: "GET" });
		const noteData = await response.json();
		initNoteDialog(noteData);
		setOpenedId(noteId);
		showNoteDialog();
	}

	async function sendNote(_event: FormEvent<HTMLFormElement>) {
		void _event;
		const titleInput = document.querySelector(
			"#noteDialog input[name='titoloNota']"
		) as HTMLInputElement;
		const contentInput = document.querySelector(
			"#noteDialog textarea[name='testoNota']"
		) as HTMLInputElement;
		const tagsList = document.querySelectorAll("#tagslist span");
		// eslint-disable-next-line @typescript-eslint/no-wrapper-object-types
		const tags: String[] = [];
		tagsList.forEach((tag) =>
			tag.textContent ? tags.push(tag.textContent) : null
		);
		console.log("title, content components: ", titleInput, contentInput);
		const PUTresponse = await fetch(`/api/notes/${openedId}`, {
			method: "PUT",
			body: JSON.stringify({
				title: titleInput ? titleInput.value : "", //ternario invece di || perché titleInput può essere null, inoltre: titleInput.value può essere una stringa vuota, e se è così scelgo lui invece della mia stringa vuota
				content: contentInput ? contentInput.value : "", //nella mia testa è più significativo così
				tags: tags
			})
		});
		const sentNote = await PUTresponse.json();
		sentNote.created = new Date(sentNote.created);
		sentNote.modified = new Date(sentNote.modified);
		setNotes(
			sortingMode.sort(
				notes
					.filter((note) => String(note._id) !== openedId)
					.concat(sentNote)
			)
		);
		(document.querySelector("#noteForm") as HTMLFormElement).reset();
		(document.querySelector("#tagslist") as HTMLDivElement).innerHTML = "";
		setOpenedId(null);
	}

	function setSorting() {
		setSortingMode(
			new NoteSorter(
				(document.querySelector("select") as HTMLSelectElement)
					.value as sortMode,
				sortDirection
			)
		);
		setNotes(sortingMode.sort(notes));
	}

	function setDirection() {
		setSortDirection((sortDirection * -1) as sortDirection);
		document.querySelector("#directionButton")!.textContent =
			sortDirection === 1 ? "⬆️" : "⬇️";
		setSortingMode(
			new NoteSorter(
				(document.querySelector("select") as HTMLSelectElement)
					.value as sortMode,
				sortDirection
			)
		);
		setNotes(sortingMode.sort(notes));
	}

	function filterByTag() {
		const wanted = (
			document.querySelector("#tagFilter") as HTMLSelectElement
		).value;
		console.log("wanted: ", wanted);
		if (wanted !== "all") {
			setNotes(notes.filter((note) => note.tags.includes(wanted)));
		} else {
			fetchNotes();
		}
	}

	useEffect(() => {
		fetchNotes();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sortingMode, sortDirection]);

	if (loading) {
		return <p>Caricamento in corso...</p>;
	}

	//TODO: dividere in più componenti!!!!
	return (
		<div>
			<button id="newNoteButton" onClick={newNote}>
				Nuova nota
			</button>

			<select onChange={setSorting}>
				<option value="byModified">Ordina per data di modifica</option>
				<option value="byCreated">Ordina per data di creazione</option>
				<option value="byTitle">Ordina per titolo</option>
				<option value="byContentLength">
					Ordina per lunghezza del testo
				</option>
			</select>

			<button id="directionButton" onClick={setDirection}>
				⬇️
			</button>

			<select id="tagFilter" onChange={filterByTag}>
				<option value="all">Tutte le note</option>
				{notes.map((note) =>
					note.tags.map((tag) => (
						<option key={tag.toString()} value={tag.toString()}>
							{tag.toString()}
						</option>
					))
				)}
			</select>

			<ol
				style={{
					display: "grid",
					gridTemplateColumns: "33% 33% 33%",
					listStyleType: "none"
				}}
			>
				{notes.map((note) => (
					<li key={note._id?.toString()}>
						<NoteCard
							passedNote={note}
							onEdit={editNote}
							onDelete={(id: string) => {
								setNotes(
									notes.filter(
										(note) => String(note._id) !== id
									)
								);
							}}
							onDuplicate={(id: ObjectId) => {
								setNotes(
									notes.concat({
										_id: id,
										title: note.title + " (Copia)",
										content: note.content,
										tags: note.tags,
										owner: note.owner,
										created: new Date(),
										modified: new Date()
									} as note)
								);
							}}
						></NoteCard>
					</li>
				))}
			</ol>

			<NoteDialog
				onSubmit={sendNote}
				onClose={() => {
					(
						document.querySelector("#noteForm") as HTMLFormElement
					).reset();
					(
						document.querySelector("#tagslist") as HTMLDivElement
					).innerHTML = "";
					setOpenedId(null);
					(
						document.querySelector(
							"#noteDialog"
						) as HTMLDialogElement
					).close();
				}}
			/>
		</div>
	);
	// remember to checkout https://stackoverflow.com/questions/28329382/understanding-unique-keys-for-array-children-in-react-js
}
