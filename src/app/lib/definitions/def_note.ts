import { ObjectId } from "mongodb";
import { z } from "zod";

/**
 * Tipo di dato che rappresenta una nota.
 *
 * @property _id - Identificativo univoco della nota, possibilmente undefined in modo da poter far generare l'id dal database
 * @property owner - Identificativo dell'utente proprietario della nota
 * @property title - Titolo della nota, una nota senza titolo ha come titolo una stringa vuota
 * @property content - Contenuto della nota, una nota senza contenuto ha come contenuto una stringa vuota
 * @property tags - Array di tag associati alla nota, una nota senza tag ha come tags un array vuoto
 * @property created - data di creazione della nota, stabilita al momento dell'inserimento nel db di una nuova nota
 * @property modified - data di ultima modifica della nota, stabilita al momento dell'inserimento nel db di un nota modificata (coincide con created se la nota non è mai stata modificata)
 */

export type note = {
	_id?: ObjectId;
	owner: ObjectId;
	title: String;
	content: String;
	tags: String[];
	created: Date;
	modified: Date;
};

export type sortMode =
	| "byModified"
	| "byCreated"
	| "byTitle"
	| "byContentLength";
export type sortDirection = -1 | 1;

//TODO: CONSIDERARE TIPO NOTEREQUEST CON SOLO (OWNER?), TITLE, CONTENT, TAGS

export const NoteFormSchema = z.object({
	title: z.string().trim(),
	content: z.string().trim(),
	tags: z.array(z.string().trim()).optional()
});

//Strategy pattern perché posso
// e tutti zitti
export interface NoteSorting {
	sort(notes: note[], direction: sortDirection): note[];
}

class SortByModified implements NoteSorting {
	sort(notes: note[], direction: sortDirection): note[] {
		notes.sort((a: note, b: note) => {
			return direction * (b.modified.getTime() - a.modified.getTime());
		});
		return notes;
	}
}

class SortByCreated implements NoteSorting {
	sort(notes: note[], direction: sortDirection): note[] {
		notes.sort((a: note, b: note) => {
			return direction * (b.created.getTime() - a.created.getTime());
		});
		return notes;
	}
}
class SortByTitle implements NoteSorting {
	sort(notes: note[], direction: sortDirection): note[] {
		notes.sort((a: note, b: note) => {
			//mi sto pentendo di aver usato String invece di string
			const at = a.title ? a.title.toString() : "";
			const bt = b.title ? b.title.toString() : "";
			const cmp = at.localeCompare(bt, undefined, {
				numeric: true,
				sensitivity: "base"
			});
			return cmp * direction;
		});
		return notes;
	}
}

class SortByContentLength implements NoteSorting {
	sort(notes: note[], direction: sortDirection): note[] {
		notes.sort((a: note, b: note) => {
			const al = a.content ? a.content.length : 0;
			const bl = b.content ? b.content.length : 0;
			return direction * (al - bl);
		});
		return notes;
	}
}

export class NoteSorter {
	private strategy: NoteSorting;
	private direction: sortDirection;

	constructor(mode: sortMode, direction: sortDirection) {
		this.direction = direction;
		switch (mode) {
			case "byModified":
				this.strategy = new SortByModified();
				break;
			case "byCreated":
				this.strategy = new SortByCreated();
				break;
			case "byTitle":
				this.strategy = new SortByTitle();
				break;
			case "byContentLength":
				this.strategy = new SortByContentLength();
				break;
			default:
				this.strategy = new SortByModified();
				break;
		}
	}

	setSortingMode(mode: sortMode) {
		switch (mode) {
			case "byModified":
				this.strategy = new SortByModified();
				break;
			case "byCreated":
				this.strategy = new SortByCreated();
				break;
			case "byTitle":
				this.strategy = new SortByTitle();
				break;
			case "byContentLength":
				this.strategy = new SortByContentLength();
				break;
			default:
				this.strategy = new SortByModified();
		}
	}

	setSortingDirection(direction: sortDirection) {
		this.direction = direction;
	}

	sort(notearray: note[]): note[] {
		return this.strategy.sort(notearray, this.direction);
	}
}
