"use client";

import { useState } from "react";
import type { note } from "../lib/definitions/def_note";

export default function Notes() {
	// Logica per la gestione delle note
	const [notes, setNotes] = useState(data);
	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [count, setCount] = useState(data.length);

	function removeNote(key: any) {
		// Rimuove la nota con la chiave key
		setNotes(notes.filter((note) => note.key !== key));
	}

	function handleinput() {
		// Controlla che i campi title e content non siano vuoti
		if (!title || !content) {
			window.alert("Title and content are required.");
			return;
		}
		// E poi aggiunge la nota alla lista
		setNotes([
			...notes,
			{
				key: count,
				title: title,
				content: content
			}
		]);
		setTitle("");
		setContent("");
		setCount(count + 1);
		console.log(notes);
	}

	return (
		<div className="Page">
			<div className="board">
				<div className="head-title">
					<h1>Lista di Note</h1>
				</div>
				<div className="note-list">
					{notes.map((note) => (
						<div className="note-item" key={note.key}>
							<div style={{ width: "90%" }}>
								<h2>{note.title}</h2>
								<p>{note.content}</p>
							</div>
							<button
								style={{
									fontSize: "20px",
									width: "10%",
									height: "35px",
									padding: "0 2% 0 2%",
									color: "black"
								}}
								onClick={() => removeNote(note.key)}
							>
								X
							</button>
						</div>
					))}
				</div>
				<div className="add-note">
					<input
						type="text"
						id="title"
						placeholder="Add Title"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
					/>
					<input
						type="text"
						id="content"
						placeholder="Add Content"
						value={content}
						onChange={(e) => setContent(e.target.value)}
					/>
					<button onClick={handleinput}>Add Note</button>
				</div>
			</div>
		</div>
	);
}

// Dummy data
const data = [
	{
		key: 0,
		title: "First Note",
		content: "This is the content of the first note."
	},
	{
		key: 1,
		title: "Second Note",
		content: "This is the content of the second note."
	},
	{
		key: 2,
		title: "Third Note",
		content: "This is the content of the third note."
	}
];
