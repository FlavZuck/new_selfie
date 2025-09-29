"use client";

import type { FormEvent } from "react";

interface NoteDialogProps {
	dialogId?: string;
	formId?: string;
	onSubmit: (event: FormEvent<HTMLFormElement>) => void | Promise<void>;
}

export default function NoteDialog({
	dialogId = "noteDialog",
	formId = "noteForm",
	onSubmit
}: NoteDialogProps) {
	return (
		<dialog id={dialogId} className="note-dialog">
			<form
				id={formId}
				method="dialog"
				onSubmit={onSubmit}
				className="h-100"
			>
				<div className="container-fluid h-100 d-flex flex-column p-3">
					{/* Header with title input */}
					<div className="mb-3">
						<label
							htmlFor="titoloNota"
							className="form-label fw-bold"
						>
							Titolo della nota
						</label>
						<input
							type="text"
							name="titoloNota"
							className="form-control"
							placeholder="Titolo della nota"
						/>
					</div>

					{/* Main content area - flex-grow for expansion */}
					<div className="flex-grow-1 d-flex flex-column mb-3">
						<label
							htmlFor="testoNota"
							className="form-label fw-bold mb-2"
						>
							Testo della nota
						</label>
						<div className="flex-grow-1 d-flex gap-2">
							{/* Text input area */}
							<div className="flex-fill">
								<textarea
									name="testoNota"
									className="form-control h-100"
									placeholder="Scrivi qui il contenuto..."
									style={{
										resize: "none",
										minHeight: "300px"
									}}
								></textarea>
							</div>
							{/* Reserved space for future markdown preview */}
							<div className="flex-fill">
								<div className="border rounded p-3 h-100 bg-light">
									<small className="text-muted">
										Anteprima markdown (da implementare)
									</small>
								</div>
							</div>
						</div>
					</div>

					{/* Footer with submit button aligned right */}
					<div className="d-flex justify-content-end">
						<button type="submit" className="btn btn-primary">
							Salva e chiudi
						</button>
					</div>
				</div>
			</form>
		</dialog>
	);
}
