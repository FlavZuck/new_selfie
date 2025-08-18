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

//TODO: CONSIDERARE TIPO NOTEREQUEST CON SOLO (OWNER?), TITLE, CONTENT, TAGS

export const NoteFormSchema = z.object({
	title: z.string().trim(),
	content: z.string().trim(),
	tags: z.array(z.string().trim()).optional()
});
