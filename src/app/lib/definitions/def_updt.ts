import { z } from "zod";

export const UpdateSchema = z.object({
	// The title of the event
	title: z
		.string()
		.min(1, { message: "Il titolo deve avere almeno un carattere." })
		.max(25, {
			message: "Il titolo deve avere al massimo 25 caratteri."
		}),
	// Place where the event will be held (optional)
	place: z
		.string()
		.min(1, { message: "Il luogo deve avere almeno un carattere." })
		.max(25, {
			message: "Il luogo deve avere al massimo 25 caratteri."
		})
		.or(z.literal("")),

	description: z
		.string()
		.min(1, {
			message: "La descrizione deve avere almeno un carattere."
		})
		.max(200, {
			message: "La descrizione deve avere al massimo 200 caratteri."
		})
});

// Type for the state of the event form
export type UpdateState =
	| {
			errors?: {
				// Update event errors
				title?: string[];
				place?: string[];
				description?: string[];
			};
			message?: string;
	  }
	| undefined;
