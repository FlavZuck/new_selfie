import { z } from "zod";

export const UpdateSchema = z.object({
	// The title of the event
	title: z
		.string()
		.min(1, { message: "The title must have at least one character." })
		.max(25, {
			message: "Title must have not more than 50 characters."
		}),
	// Place where the event will be held (optional)
	place: z
		.string()
		.min(1, { message: "The place must have at least one character." })
		.max(25, {
			message: "Place must have not more than 50 characters."
		})
		.or(z.literal("")),

	description: z
		.string()
		.min(1, {
			message: "The description must have at least one character."
		})
		.max(200, {
			message: "Description must have not more than 200 characters."
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
