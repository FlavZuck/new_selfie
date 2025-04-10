import { IntegerType } from "mongodb";
import { z } from "zod";

// Funzione per verificare se il giorno è valido per il mese
function ValidGiorniMese(giorno: number, mese: number) {
	// Array dei mesi con 30 giorni
	const mese30 = [4, 6, 9, 11];
	// Controllo per i mesi con 30 giorni
	if (mese30.includes(mese) && giorno > 30) {
		return false;
	}
	// Controllo per febbraio
	else if (mese === 2 && giorno > 29) {
		return false;
	} else {
		return true;
	}
}

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

const baseEventSchema = z.object({
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
	// The start date of the event
	datestart: z.coerce.date().min(new Date(new Date().setHours(0, 0, 0, 0)), {
		message: "Please enter a date from today onward."
	}),
	description: z
		.string()
		.min(1, {
			message: "The description must have at least one character."
		})
		.max(200, {
			message: "Description must have not more than 200 characters."
		})
});

const EventAllDaySchema = z.object({
	// The pivotal property of the event, the allDay property
	allDay: z.literal("on"),
	// The start time of the event, which is not needed for all-day events
	dateend: z.coerce
		.date()
		.min(new Date(), {
			message: "Please enter a date from today onward."
		})
		.or(z.literal("")),
	// The start time of the event, which is not needed for all-day events
	time: z.literal(""),
	// The duration of the event in hours and minutes, which is not needed for all-day events
	duration: z.literal("")
});
const EventTimedSchema = z.object({
	// Both the allDay and dateend properties are not needed for timed events
	allDay: z.literal(null),
	dateend: z.literal(""),
	// The start time of the event, which is needed for timed events
	time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
		message: "Please enter a valid time in HH:mm format."
	}),
	// The duration of the event in hours and minutes
	duration: z
		.string()
		.regex(
			/^(0[0-9]|1[0-9]|2[0-3]):([0-5][0-9])$/,
			"Please enter a valid duration in HH:mm format."
		)
		.or(z.literal(""))
});

const EventRecurrenceSchema = z.object({
	recurrence: z.literal("on").or(z.literal(null)),
	frequency: z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]),
	undef: z.literal("on").or(z.literal(null)),
	dayarray: z
		// All of this might as well be black magic :)
		// 1 day or more can be selected, or none at all
		.preprocess(
			(val) => (typeof val === "string" ? val.split(",") : val),
			z.array(
				z.enum([
					"Lunedì",
					"Martedì",
					"Mercoledì",
					"Giovedì",
					"Venerdì",
					"Sabato",
					"Domenica"
				])
			)
		)
		.or(z.literal("")),
	mh_day: z.coerce
		.number()
		.min(1, { message: "Please enter a valid day of the month." })
		.max(31, {
			message: "Please enter a valid day of the month."
		})
		.or(z.literal("")),
	yh_month: z.coerce
		.number()
		.min(1, { message: "Please enter a valid month." })
		.max(12, {
			message: "Please enter a valid month."
		})
		.or(z.literal("")),
	yh_day: z.coerce
		.number()
		.min(1, { message: "Please enter a valid day of the month." })
		.max(31, {
			message: "Please enter a valid day of the month."
		})
		.or(z.literal("")),
	count: z.coerce
		.number()
		.min(0, { message: "Please enter a positive number." })
		.max(100, {
			message: "Please enter a number less than 100."
		}),
	until: z.coerce.date().or(z.literal(""))
});

// The base event schema is merged with the recurrence schema
const CompleteBaseEventSchema = EventRecurrenceSchema.merge(baseEventSchema);
// The two event schemas are merged with the complete_base event schema
const CompleteEventAllDaySchema = EventAllDaySchema.merge(
	CompleteBaseEventSchema
);
const CompleteEventTimedSchema = EventTimedSchema.merge(
	CompleteBaseEventSchema
);

// The EventFormSchema will determine which of the two schemas to use based on the allDay property
export const EventFormSchema = z
	.discriminatedUnion("allDay", [
		CompleteEventAllDaySchema,
		CompleteEventTimedSchema
	])
	// Custom validation
	.superRefine(
		(
			{
				datestart,
				dateend,
				allDay,
				recurrence,
				frequency,
				undef,
				count,
				dayarray,
				mh_day,
				yh_month,
				yh_day,
				until
			},
			ctx
		) => {
			// To ensure that the end date is after the start date
			if (dateend <= datestart && dateend != "" && allDay == "on") {
				ctx.addIssue({
					code: "custom",
					message: "The end date must be after the start date",
					path: ["dateend"]
				});
			}
			// To ensure that if recurrence is selected and the frequency is not DAILY
			// at least one day is selected
			if (recurrence != null && frequency == "WEEKLY" && dayarray == "") {
				ctx.addIssue({
					code: "custom",
					message: "Please select at least one day.",
					path: ["dayarray"]
				});
			}
			// To ensure that if recurrence is selected and the frequency is MONTHLY
			// the day of the month is selected
			if (recurrence != null && frequency == "MONTHLY" && mh_day == "") {
				ctx.addIssue({
					code: "custom",
					message: "Please select a day of the month.",
					path: ["mh_day"]
				});
			}
			// To ensure that if recurrence is selected and the frequency is YEARLY
			// the month and day of the month are selected
			if (
				recurrence != null &&
				frequency == "YEARLY" &&
				(yh_month == "" || yh_day == "")
			) {
				ctx.addIssue({
					code: "custom",
					message: "Please select a month and a day of the month.",
					path: ["yh_month", "yh_day"]
				});
			}
			// To ensure that if recurrence is selected and the frequency is YEARLY
			// the day of the month is valid
			if (
				yh_day != "" &&
				yh_month != "" &&
				ValidGiorniMese(yh_day, yh_month) == false &&
				recurrence != null &&
				frequency == "YEARLY"
			) {
				ctx.addIssue({
					code: "custom",
					message: "Please select a valid day of the month.",
					path: ["yh_day"]
				});
			}
			// To ensure that if recurrence is selected, that the until is after the datestart
			if (recurrence != null && until <= datestart && until != "") {
				ctx.addIssue({
					code: "custom",
					message: "The end date must be after the start date",
					path: ["until"]
				});
			}
			// To ensure that if indefinitely is selected, that at least the count is greater than 0
			// or that until is not empty
			if (undef == null && count == 0 && until == "") {
				ctx.addIssue({
					code: "custom",
					message:
						"Please select a number of occurrences or an end date.",
					path: ["undef"]
				});
			}
		}
	);

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
				// Base event fields
				title?: string[];
				place?: string[];
				description?: string[];
				datestart?: string[];
				// Timed/allDay event fields
				allDay?: string[];
				dateend?: string[];
				time?: string[];
				duration?: string[];
				// Recurrence fields
				recurrence?: string[];
				frequency?: string[];
				undef?: string[];
				dayarray?: string[];
				mh_day?: string[];
				yh_month?: string[];
				yh_day?: string[];
				count?: string[];
				until?: string[];
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

export type Pomodoro = {
	userId: string;

	date: Date;
	timerConfig: {
		studyMin: string;
		pauseMin: string;
		savedCycles: number;
	};

	// 	cycles: {
	// 		completed: number;
	// 		missed: number;
	// 		// carriedFromPreviousDay: number;
	// 	};
};
