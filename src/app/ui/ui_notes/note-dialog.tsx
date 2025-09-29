"use client";

import { Marked } from "marked";
import { type FormEvent, useEffect } from "react";

export default function NoteDialog({
	onSubmit
}: {
	onSubmit: (event: FormEvent<HTMLFormElement>) => void | Promise<void>;
}) {
	const marked = new Marked({ pedantic: false, gfm: true, breaks: false });

	async function parse() {
		const textArea = document.querySelector(
			"#noteDialog textarea[name='testoNota']"
		) as HTMLTextAreaElement;
		const mdPreview = document.querySelector("#mdPreview");

		mdPreview!.innerHTML = await marked.parse(textArea.value);
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
				<button>❌</button>
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

				<button type="submit" className="btn btn-primary">
					Salva e chiudi
				</button>
			</form>
		</dialog>
	);
}
