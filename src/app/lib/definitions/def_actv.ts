import { z } from "zod";

export const ActivitySchema = z.object({
	title: z
		.string()
		.min(1, { message: "The title must have at least one character." })
		.max(25, {
			message: "Title must have not more than 50 characters."
		}),
	description: z
		.string()
		.min(1, {
			message: "The description must have at least one character."
		})
		.max(200, {
			message: "Description must have not more than 200 characters."
		})
		.or(z.literal("")),
	expiration: z.coerce.date().min(new Date(), {
		message: "Please enter a date from tomorrow and onward."
	})
});

export type ActivityState =
	| {
			errors?: {
				title?: string[];
				description?: string[];
				expiration?: string[];
			};
			message?: string;
	  }
	| undefined;

export type Activity_FullCalendar = {
	id: string;
	allDay: boolean;
	title: string;
	start: Date;
	color: string;
	extendedProps: {
		description: string;
		type: "ACTIVITY";
	};
};

export type Activity_DB = {
	_id: string;
	userId: string;
	title: string;
	description: string;
	expiration: Date;
	color: string;
};
