import { z } from "zod";

// The following regex are completely unintelligible to me, be warned :)

export const SignupFormSchema = z.object({
	name: z
		.string()
		.min(2, { message: "Name must be at least 2 characters long." })
		.trim(),
	surname: z
		.string()
		.min(2, { message: "Surname must be at least 2 characters long." })
		.trim(),
	birthdate: z.coerce
		.date()
		.max(new Date(), { message: "Please enter a valid date." }),
	email: z.string().email({ message: "Please enter a valid email." }).trim(),
	password: z
		.string()
		.min(8, { message: "Be at least 8 characters long" })
		.regex(/[a-zA-Z]/, { message: "Contain at least one letter." })
		.regex(/[0-9]/, { message: "Contain at least one number." })
		.regex(/[^a-zA-Z0-9]/, {
			message: "Contain at least one special character."
		})
		.trim()
});

export const SigninFormSchema = z.object({
	email: z.string().email({ message: "Please enter a valid email." }).trim(),
	password: z
		.string()
		.min(8, { message: "Be at least 8 characters long" })
		.regex(/[a-zA-Z]/, { message: "Contain at least one letter." })
		.regex(/[0-9]/, { message: "Contain at least one number." })
		.regex(/[^a-zA-Z0-9]/, {
			message: "Contain at least one special character."
		})
		.trim()
});

const EventAllDaySchema = z.object({
	// The title of the event
	title: z
		.string()
		.min(1, { message: "The title must have at least one character." })
		.max(25, { message: "Title must have not more than 50 characters." }),
	// The start date of the event
	datestart: z.coerce
		.date()
		.min(new Date(), { message: "Please enter a date from today onward." }),
	// The pivotal property of the event, the allDay property
	allDay: z.literal("on"),
	// The start time of the event, which is not needed for all-day events
	time: z.literal(""),
	// The description of the event
	description: z
		.string()
		.min(1, {
			message: "The description must have at least one character."
		})
		.max(200, {
			message: "Description must have not more than 200 characters."
		})
});

const EventTimedSchema = z.object({
	// The title of the event
	title: z
		.string()
		.min(1, { message: "The title must have at least one character." })
		.max(25, { message: "Title must have not more than 50 characters." }),
	// The start date of the event
	datestart: z.coerce
		.date()
		.min(new Date(), { message: "Please enter a date from today onward." }),
	// Here we check if the allDay property is undefined
	allDay: z.literal(null),
	// The start time of the event, which is needed for timed events
	time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
		message: "Please enter a valid time in HH:mm format."
	}),
	// The description of the event
	description: z
		.string()
		.min(1, {
			message: "The description must have at least one character."
		})
		.max(200, {
			message: "Description must have not more than 200 characters."
		})
});

// The EventFormSchema will determine which of the two schemas to use based on the allDay property
export const EventFormSchema = z.discriminatedUnion("allDay", [
	EventAllDaySchema,
	EventTimedSchema
]);

// Type for the state of the signup and login form
export type FormState =
	| {
			errors?: {
				name?: string[];
				surname?: string[];
				birthdate?: string[];
				email?: string[];
				password?: string[];
			};
			message?: string;
	  }
	| undefined;

// Type for the state of the event form
export type EventState =
	| {
			errors?: {
				title?: string[];
				datestart?: string[];
				allDay?: string[];
				timestart?: string[];
				description?: string[];
			};
			message?: string;
	  }
	| undefined;

//The payload should contain the minimum, unique user data that'll be used in subsequent requests, such as:
//the user's ID, role, etc.
// It should not contain passwords or personally identifiable information (like phone number, email,credit card information, etc,)
export type SessionPayload = {
	userId: string;
	expiresAt: Date;
};

export type User = {
	_id: string;
	name: string;
	surname: string;
	birthdate: Date;
	email: string;
	password: string;
};
