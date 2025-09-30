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
	const [allNotes, setAllNotes] = useState([] as note[]); // MASTER LIST (NEW)
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
		const sorted = sortingMode.sort([...notesData]);
		setAllNotes(sorted);
		// Apply current tag filter (if any)
		const currentTagSelect = document.querySelector(
			"#tagFilter"
		) as HTMLSelectElement | null;
		if (
			currentTagSelect &&
			currentTagSelect.value &&
			currentTagSelect.value !== "all"
		) {
			setNotes(
				sorted.filter((n) => n.tags.includes(currentTagSelect.value))
			);
		} else {
			setNotes(sorted);
		}
		setLoading(false);
	}

	function applyFilterAndSort(updatedAll: note[]) {
		const tagSel = document.querySelector(
			"#tagFilter"
		) as HTMLSelectElement | null;
		let base = updatedAll;
		if (tagSel && tagSel.value !== "all") {
			base = updatedAll.filter((n) => n.tags.includes(tagSel.value));
		}
		setNotes(sortingMode.sort([...base]));
	}

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
		tagslist.innerHTML = "";
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
		const updatedAll = allNotes
			.filter((n) => String(n._id) !== openedId)
			.concat(sentNote);
		setAllNotes(sortingMode.sort([...updatedAll]));
		applyFilterAndSort(updatedAll);
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
		const sorted = sortingMode.sort([...allNotes]);
		setAllNotes(sorted);
		applyFilterAndSort(sorted);
	}

	function setDirection() {
		setSortDirection((prev) => {
			const nextDir = (prev * -1) as sortDirection;
			setSortingMode(
				new NoteSorter(
					(document.querySelector("select") as HTMLSelectElement)
						.value as sortMode,
					nextDir
				)
			);
			const sorted = sortingMode.sort([...allNotes]);
			setAllNotes(sorted);
			applyFilterAndSort(sorted);
			return nextDir;
		});
	}

	function filterByTag() {
		const wanted = (
			document.querySelector("#tagFilter") as HTMLSelectElement
		).value;
		if (wanted === "all") {
			applyFilterAndSort(allNotes);
		} else {
			const filtered = allNotes.filter((note) =>
				note.tags.includes(wanted)
			);
			setNotes(sortingMode.sort([...filtered]));
		}
	}

	useEffect(() => {
		fetchNotes();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sortingMode, sortDirection]);

	if (loading) {
		return <p>Caricamento in corso...</p>;
	}

	// build unique tag list from allNotes (not just visible notes)
	const uniqueTags = Array.from(
		new Set(allNotes.flatMap((n) => n.tags.map((t) => t.toString())))
	).sort();

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
				{sortDirection === 1 ? "⬇️" : "⬆️"}
			</button>

			<select id="tagFilter" onChange={filterByTag}>
				<option value="all">Tutte le note</option>
				{uniqueTags.map((tag) => (
					<option key={tag} value={tag}>
						{tag}
					</option>
				))}
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
								const updatedAll = allNotes.filter(
									(n) => String(n._id) !== id
								);
								setAllNotes(updatedAll);
								applyFilterAndSort(updatedAll);
							}}
							onDuplicate={(id: ObjectId) => {
								const duplicated: note = {
									_id: id,
									title: note.title + " (Copia)",
									content: note.content,
									tags: note.tags,
									owner: note.owner,
									created: new Date(),
									modified: new Date()
								} as note;
								const updatedAll = [...allNotes, duplicated];
								const resortedAll = sortingMode.sort([
									...updatedAll
								]);
								setAllNotes(resortedAll);
								applyFilterAndSort(resortedAll);
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
