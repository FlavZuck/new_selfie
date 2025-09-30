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
		<div className="card h-100 shadow-sm border-0">
			<div className="card-header bg-transparent border-0 d-flex justify-content-end gap-2 pt-3">
				<button
					type="button"
					className="btn btn-outline-danger btn-sm"
					onClick={deleteNote}
				>
					Elimina
				</button>
				<button
					type="button"
					className="btn btn-outline-secondary btn-sm"
					onClick={duplicateNote}
				>
					Duplica
				</button>
			</div>
			<div className="card-body d-flex flex-column gap-3 pt-0">
				<button
					type="button"
					className="btn btn-link text-start text-decoration-none text-reset px-0"
					onClick={() => {
						onEdit(String(passedNote._id));
					}}
				>
					<span className="d-block h5 mb-2 fw-semibold">
						{passedNote.title || "Senza titolo"}
					</span>
					<span className="d-block text-body-secondary">
						{passedNote.content
							? passedNote.content.substring(0, 200)
							: "Nessun contenuto"}
					</span>
					<span className="d-block text-body-secondary small mt-2">
						Ultima modifica: {passedNote.modified.toLocaleString()}
					</span>
					<span className="d-block text-body-secondary small">
						Creazione: {passedNote.created.toLocaleString()}
					</span>
				</button>
			</div>
			<div className="card-footer bg-transparent border-0 pt-0">
				<span className="text-body-secondary small me-2">Tag:</span>
				{passedNote.tags.length !== 0 ? (
					<div className="d-inline-flex flex-wrap gap-2 align-items-center">
						{passedNote.tags.map((tag, index) => (
							<span
								key={index}
								className="badge text-bg-secondary"
							>
								{tag}
							</span>
						))}
					</div>
				) : (
					<span className="text-body-secondary small">
						Nessun tag
					</span>
				)}
			</div>
		</div>
	);
}
