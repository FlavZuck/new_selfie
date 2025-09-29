"use client";

import { Marked } from "marked";
import { type FormEvent, useEffect } from "react";

export default function NoteDialog({
	onSubmit,
	onClose
}: {
	onSubmit: (event: FormEvent<HTMLFormElement>) => void | Promise<void>;
	onClose: () => void;
}) {
	const marked = new Marked({ pedantic: false, gfm: true, breaks: false });

	async function parse() {
		const textArea = document.querySelector(
			"#noteDialog textarea[name='testoNota']"
		) as HTMLTextAreaElement;
		const mdPreview = document.querySelector("#mdPreview");

		mdPreview!.innerHTML = await marked.parse(textArea.value);
	}

	function addTag(tag: string) {
		const tagslist = document.querySelector("#tagslist");
		const newTag = document.createElement("span");
		newTag.className = "badge bg-secondary m-1";
		newTag.textContent = tag;
		newTag.onclick = () => {
			newTag.remove();
		};
		tagslist?.appendChild(newTag);
	}
	useEffect(() => {
		parse();
	});

	return (
		<dialog id={"noteDialog"} className="note-dialog">
			<form
				id={"noteForm"}
				method="dialog"
				onSubmit={onSubmit}
				className="h-100"
			>
				<button type="button" className="btn" onClick={onClose}>
					❌
				</button>
				{/*type button previene il submit del form*/}
				<input
					type="text"
					name="titoloNota"
					className="form-control border-0 fw-bold"
					placeholder="Titolo della nota"
				/>
				<textarea
					name="testoNota"
					className="form-control"
					placeholder="Scrivi qui il contenuto..."
					style={{
						resize: "none"
					}}
					onChange={parse}
				></textarea>
				<div id="mdPreview" className="border rounded"></div>
				<input
					type="text"
					name="tagsNota"
					className="form-control"
					placeholder="scrivi e premi invio per inserire un tag"
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							e.preventDefault();
							const input = e.currentTarget;
							addTag(input.value.trim());
						}
					}}
				/>
				<div id="tagslist"></div>
				<button type="submit" className="btn btn-primary">
					Salva e chiudi
				</button>
			</form>
		</dialog>
	);
}
