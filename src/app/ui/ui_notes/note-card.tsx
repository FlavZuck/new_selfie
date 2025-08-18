"use client";

import { useEffect, useState } from "react";
import type { note } from "../../lib/definitions/def_note";

export default function NoteCard({ passedNote }: { passedNote: note }) {
	return (
		<div style={{ display: "block" }}>
			{passedNote.title}
			<br />
			{passedNote.content}
			<br />
			{passedNote.modified.toString()}
		</div>
	);
}
