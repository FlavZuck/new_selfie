import { currentDate, getVirtualDate } from "@/app/actions/timemach_logic";
import { ObjectId } from "mongodb";
import { z } from "zod";

// Dynamic date validators to ensure thresholds update on each validation
const dynamicMinDate = async (date: Date): Promise<boolean> => {
	const v = (await getVirtualDate()) ?? (await currentDate());
	v.setHours(0, 0, 0, 0);
	return date >= v;
};

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

const baseEventSchema = z.object({
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
		.max(50, {
			message: "Il luogo deve avere al massimo 50 caratteri."
		})
		.or(z.literal("")),
	// The start date of the event
	datestart: z.coerce.date().refine(dynamicMinDate, {
		message: "Scegliete una data da oggi in poi."
	}),
	description: z
		.string()
		.min(1, {
			message: "La descrizione deve avere almeno un carattere."
		})
		.max(200, {
			message: "La descrizione deve avere al massimo 200 caratteri."
		}),
	// Notification settings
	notification: z.literal("on").or(z.literal(null)),
	notificationtime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
		message: "Inserisci un orario valido nel formato HH:mm."
	}),
	notificationtype: z.enum(["stesso", "prima", "specifico"]),
	specificdelay: z.coerce
		.number()
		.min(0, {
			message: "Inserisci un numero positivo di ore."
		})
		.max(168, {
			message: "Inserisci un numero di ore inferiore a una settimana."
		})
		.or(z.literal(0))
});

const EventAllDaySchema = z.object({
	// The pivotal property of the event, the allDay property
	allDay: z.literal("on"),
	// The end date of an all-day event
	dateend: z.union([
		z.coerce.date().refine(dynamicMinDate, {
			message: "Scegliete una data da oggi in poi."
		}),
		z.literal("")
	]),
	// The start time of the event, which is not needed for all-day events
	time: z.literal(""),
	// The duration of the event in hours and minutes, which is not needed for all-day events
	duration: z.literal("0")
});
const EventTimedSchema = z.object({
	// Both the allDay and dateend properties are not needed for timed events
	allDay: z.literal(null),
	dateend: z.literal(""),
	// The start time of the event, which is needed for timed events
	time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
		message: "Inserisci un orario valido nel formato HH:mm."
	}),
	// The duration of the event in hours and minutes
	duration: z.coerce
		.number()
		.min(1, { message: "Inserisci un numero positivo." })
		.max(24, {
			message: "Inserisci un numero inferiore a 24."
		})
		.or(z.literal(0))
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
		.min(1, { message: "Inserisci un giorno valido del mese." })
		.max(31, {
			message: "Inserisci un giorno valido del mese."
		})
		.or(z.literal("")),
	yh_month: z.coerce
		.number()
		.min(1, { message: "Inserisci un mese valido." })
		.max(12, {
			message: "Inserisci un mese valido."
		})
		.or(z.literal("")),
	yh_day: z.coerce
		.number()
		.min(1, { message: "Inserisci un giorno valido del mese." })
		.max(31, {
			message: "Inserisci un giorno valido del mese."
		})
		.or(z.literal("")),
	count: z.coerce
		.number()
		.min(0, { message: "Inserisci un numero positivo." })
		.max(100, {
			message: "Inserisci un numero inferiore a 100."
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
	// Custom validation (beware, this is where most of the strange or specific validation happens)
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
				until,
				notification,
				notificationtype,
				specificdelay
			},
			ctx
		) => {
			// To ensure that the end date is after the start date
			if (dateend <= datestart && dateend != "" && allDay == "on") {
				ctx.addIssue({
					code: "custom",
					message:
						"La data di fine deve essere successiva alla data di inizio",
					path: ["dateend"]
				});
			}
			// To ensure that if recurrence is selected and the frequency is not DAILY
			// at least one day is selected
			if (recurrence != null && frequency == "WEEKLY" && dayarray == "") {
				ctx.addIssue({
					code: "custom",
					message: "Seleziona almeno un giorno.",
					path: ["dayarray"]
				});
			}
			// To ensure that if recurrence is selected and the frequency is MONTHLY
			// the day of the month is selected
			if (recurrence != null && frequency == "MONTHLY" && mh_day == "") {
				ctx.addIssue({
					code: "custom",
					message: "Seleziona un giorno del mese.",
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
					message: "Seleziona un mese e un giorno del mese.",
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
					message: "Seleziona un giorno valido del mese.",
					path: ["yh_day"]
				});
			}
			// To ensure that if recurrence is selected, that the until is after the datestart
			if (recurrence != null && until <= datestart && until != "") {
				ctx.addIssue({
					code: "custom",
					message:
						"La data di fine deve essere successiva alla data di inizio",
					path: ["until"]
				});
			}
			// To ensure that if indefinitely is selected, that at least the count is greater than 0
			// or that until is not empty
			if (undef == null && count == 0 && until == "") {
				ctx.addIssue({
					code: "custom",
					message:
						"Seleziona un numero di occorrenze o una data di fine.",
					path: ["undef"]
				});
			}
			// To ensure that if notification is on and the notificationtype is specifico,
			// the specificdelay is not empty
			if (
				notification === "on" &&
				notificationtype === "specifico" &&
				specificdelay === 0
			) {
				ctx.addIssue({
					code: "custom",
					message: "Seleziona un ritardo maggiore di 0.",
					path: ["specificdelay"]
				});
			}
		}
	);

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
				// Notification
				notification?: string[];
				notificationtype?: string[];
				specificdelay?: string[];
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

export type Event_FullCalendar = {
	id: string;
	allDay: "on" | "";
	title: string;
	start: Date;
	end?: Date;
	color: string;
	rrule?: any;
	extendedProps: {
		duration: number;
		description: string;
		place: string;
		type: "EVENT";
		notification: boolean;
		notificationtime: string;
		notificationtype: string;
		specificdelay: number | "";
	};
};

export type Event_DB = {
	// Campi ID
	_id: ObjectId;
	userId: string;
	// Campi base (obbligatori tranne per place)
	title: string;
	description: string;
	place: string;
	start: Date;
	// Campi per gli eventi timed/allDay
	dateend: Date | "";
	allDay: "on" | null;
	duration: number;
	// Campi per le notifiche
	notification: boolean;
	notificationtime: string;
	notificationtype: string;
	specificdelay: number;
	// Campo per la rrule (non ci rompiamo a tipizzarla)
	rrule?: any;
	// Campo per il colore
	color: string;
};
