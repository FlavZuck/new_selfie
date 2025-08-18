"use client";

import { ObjectId } from "mongodb";
import { cookies } from "next/headers";
import { useEffect, useState } from "react";
import { set } from "zod";
import type { note } from "../lib/definitions/def_note";
import NoteCard from "../ui/ui_notes/note-card";

// TODO: sorting ascendente o discendente
//  possibile tramite parametro nel metodo sort???

//Strategy pattern perché posso
// e tutti zitti
/*interface NoteSorting {
	sort(notes: note[]): note[];
}

class SortByModified implements NoteSorting {
	sort(notes: note[]): note[] {
		notes.sort((a: note, b: note) => {
			return b.modified.getTime() - a.modified.getTime();
		});
		return notes;
	}
}

class SortByCreated implements NoteSorting {
	sort(notes: note[]): note[] {
		notes.sort((a: note, b: note) => {
			return b.created.getTime() - a.created.getTime();
		});
		return notes;
	}
}
class SortByTitle implements NoteSorting {
	sort(notes: note[]): note[] {
		notes.sort();
		return notes;
	}
}

class SortByContentLength implements NoteSorting {
	sort(notes: note[]): note[] {
		notes.sort((a: note, b: note) => {
			if (a.content && !b.content) {
				return -1;
			} else if (!a.content && b.content) {
				return 1;
			} else if (!a.content && !b.content) {
				return 0;
			}
			return a.content?.length - b.content?.length;
		});
		return notes;
	}
}

class SortingContext {
	private strategy: NoteSorting;

	constructor(mode: NoteSorting) {
		this.strategy = mode;
	}

	setSortingMode(mode: NoteSorting) {
		this.strategy = mode;
	}

	sort(notearray: note[]): note[] {
		return this.strategy.sort(notearray);
	}
}*/

export default function Notes() {
	const [notes, setNotes] = useState([] as note[]);
	const [loading, setLoading] = useState(true);
	//const [openedId, setOpenedId] = useState(new ObjectId(""));

	let openedId: ObjectId | null = null;

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
		notesData.sort((a: note, b: note) => {
			return b.modified.getTime() - a.modified.getTime();
		});

		setNotes(notesData as note[]);
		setLoading(false);
	}

	/*async function fetchNote(id:ObjectId) {
		let note = await fetch(`/api/notes/${id.toString()}`, { method: "GET" });
		return note;
	}*/

	// TODO analizzare tutte queste funzioni nell'ottica di separation of concerns
	async function newNote() {
		const dialog = document.querySelector(
			"#noteDialog"
		) as HTMLDialogElement;
		let response = await fetch("/api/notes", {
			method: "POST",
			body: JSON.stringify({
				title: "",
				content: "",
				tags: []
			})
		});
		let responseData = await response.json();
		if (response.status !== 200) {
			console.error("ERRORE IN NEWNOTE");
			return;
		}
		openedId = responseData.insertedId;
		dialog.showModal();
	}

	function openNote() {}

	function showNoteDialog() {}

	async function sendNote() {
		let titleInput = document.querySelector(
			"#noteDialog input[name='titoloNota']"
		) as HTMLInputElement;
		let contentInput = document.querySelector(
			"#noteDialog textarea[name='testoNota']"
		) as HTMLInputElement;
		console.log("title, content components: ", titleInput, contentInput);
		let PUTresponse = await fetch(`/api/notes/${openedId}`, {
			method: "PUT",
			//TODO: aggiungere tag
			body: JSON.stringify({
				title: titleInput ? titleInput.value : "", //ternario invece di || perché titleInput può essere null, inoltre: titleInput.value può essere una stringa vuota, e se è così scelgo lui invece della mia stringa vuota
				content: contentInput ? contentInput.value : "", //nella mia testa è più significativo così
				tags: []
			})
		});
		let sentNote = await PUTresponse.json();
		let newNotes = notes;
		newNotes.push(sentNote as note);
		setNotes(newNotes);
		(document.querySelector("#noteForm") as HTMLFormElement).reset();
		openedId = null;
	}

	useEffect(() => {
		fetchNotes();
	}, []);

	if (loading) {
		return <p>Caricamento in corso...</p>;
	}

	//TODO: dividere in più componenti!!!!
	return (
		<div>
			<button id="newNoteButton" onClick={newNote}>
				Nuova nota
			</button>
			<ul style={{ display: "grid", gridTemplateColumns: "50vw 50vw" }}>
				{notes.map((note, index) => (
					<li key={index}>
						<NoteCard passedNote={note}></NoteCard>
					</li>
				))}
			</ul>
			<dialog id="noteDialog">
				<form id="noteForm" method="dialog" onSubmit={sendNote}>
					<label htmlFor="titoloNota">Titolo della nota</label>
					<input
						type="text"
						name="titoloNota"
						placeholder="Titolo della nota"
					/>
					<label htmlFor="testoNota">Testo della nota</label>
					<textarea name="testoNota"></textarea>
					<input type="submit" value="Salva e chiudi" />
				</form>
			</dialog>
		</div>
	); //TODO: Vedere cosa fare per le label dei campi nel dialog...
	// remember to checkout https://stackoverflow.com/questions/28329382/understanding-unique-keys-for-array-children-in-react-js
}
