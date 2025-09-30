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
		if (!textArea || !mdPreview) {
			return;
		}
		mdPreview.innerHTML = await marked.parse(textArea.value);
	}

	function addTag(tag: string) {
		const trimmed = tag.trim();
		if (!trimmed) {
			return;
		}
		const tagslist = document.querySelector("#tagslist");
		const existingTags = Array.from(
			tagslist?.querySelectorAll("span") ?? []
		).map((node) => node.textContent?.toLowerCase());
		if (existingTags.includes(trimmed.toLowerCase())) {
			return;
		}
		const newTag = document.createElement("span");
		newTag.className =
			"badge text-bg-secondary d-flex align-items-center gap-1";
		newTag.textContent = trimmed;
		newTag.onclick = () => {
			newTag.remove();
		};
		tagslist?.appendChild(newTag);
	}
	useEffect(() => {
		void parse();
	});

	return (
		<dialog id={"noteDialog"} className="note-dialog">
			<form
				id={"noteForm"}
				method="dialog"
				onSubmit={onSubmit}
				className="modal-content border-0 shadow-lg"
			>
				<div className="modal-header border-0 pb-0 justify-content-end px-4 pt-4">
					<button
						type="button"
						className="btn-close"
						aria-label="Chiudi"
						onClick={onClose}
					></button>
				</div>
				<div className="modal-body px-4 pb-4 pt-0">
					<div className="mb-3">
						<input
							type="text"
							id="noteTitle"
							name="titoloNota"
							className="form-control form-control-lg border-0 border-bottom rounded-0 px-0 shadow-none fw-bold"
							placeholder="Titolo della nota"
						/>
					</div>
					<div className="row g-3 align-items-stretch">
						<div className="col-12 col-lg-6 d-flex flex-column gap-2">
							<textarea
								id="noteContent"
								name="testoNota"
								className="form-control flex-grow-1"
								placeholder="Scrivi qui il contenuto..."
								style={{ resize: "none", minHeight: "14rem" }}
								onChange={parse}
							></textarea>
						</div>
						<div className="col-12 col-lg-6 d-flex flex-column gap-2">
							<div
								id="mdPreview"
								className="markdown-preview border rounded bg-light p-3 flex-grow-1 overflow-auto"
							></div>
						</div>
					</div>
					<div className="mt-4">
						<label htmlFor="tagsInput" className="form-label">
							Tags
						</label>
						<input
							type="text"
							id="tagsInput"
							name="tagsNota"
							className="form-control"
							placeholder="Scrivi e premi Invio per inserire un tag"
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									e.preventDefault();
									const input = e.currentTarget;
									addTag(input.value);
									input.value = "";
								}
							}}
						/>
						<small className="text-body-secondary">
							Fai clic su un tag per rimuoverlo
						</small>
						<div
							id="tagslist"
							className="d-flex flex-wrap gap-2 mt-2"
						></div>
					</div>
				</div>
				<div className="modal-footer border-0 pt-0 px-4 pb-4 d-flex flex-column flex-sm-row gap-2 justify-content-end">
					<button
						type="submit"
						className="btn btn-primary w-100 w-sm-auto"
					>
						Salva e chiudi
					</button>
				</div>
			</form>
		</dialog>
	);
}
