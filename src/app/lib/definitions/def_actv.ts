import { ObjectId } from "mongodb";
import { z } from "zod";
import { getVirtualDate } from "../../actions/timemach_logic";

// Dynamic date validators to ensure threshold updates on each validation
const dynamicMinDate = async (date: Date): Promise<boolean> => {
	const v = (await getVirtualDate()) ?? new Date();
	v.setHours(0, 0, 0, 0);
	return date >= v;
};
const dynamicMaxDate = async (date: Date): Promise<boolean> => {
	const v = (await getVirtualDate()) ?? new Date();
	v.setHours(0, 0, 0, 0);
	return date <= v;
};

const BaseActivitySchema = z.object({
	title: z
		.string()
		.min(1, { message: "Il titolo deve avere almeno un carattere." })
		.max(50, {
			message: "Il titolo deve avere al massimo 50 caratteri."
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
		.or(z.literal("")),
	expiration: z.coerce.date().refine(dynamicMinDate, {
		message: "Inserisci una data da oggi in poi."
	}),
	// Notification settings
	notification: z.literal("on").or(z.literal(null)),
	reminder: z.literal("on").or(z.literal(null)),
	notificationtime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
		message: "Inserisci un orario valido nel formato HH:mm."
	}),
	notificationtype: z.enum(["stesso", "prima", "specifico"]),
	specificday: z.union([
		z.coerce.date().refine(dynamicMaxDate, {
			message: "Inserisci una data da ieri ed indietro."
		}),
		z.literal("")
	])
});

export const ActivitySchema = BaseActivitySchema.superRefine(
	({ expiration, notification, notificationtype, specificday }, ctx) => {
		// To ensure that the expiration date is always after the notification date
		if (notification === "on" && notificationtype === "specifico") {
			if (specificday && expiration < specificday) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message:
						"La data di notificazione deve essere prima della data di scadenza.",
					path: ["specificday"]
				});
			} else if (!specificday) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Devi specificare una data per il promemoria.",
					path: ["specificday"]
				});
			}
		} else if (notification === null) {
			if (notificationtype === "specifico" && specificday) {
				specificday = "";
			}
		}
	}
);

export type ActivityState =
	| {
			errors?: {
				// Base fields
				title?: string[];
				description?: string[];
				place?: string[];
				expiration?: string[];
				// Notification
				notification?: string[];
				reminder?: string[];
				notificationtype?: string[];
				specificday?: string[];
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
		place: string;
		type: "ACTIVITY";
		notification: boolean;
		reminder: boolean;
		notificationtime: string;
		notificationtype: string;
		specificday: Date | null;
		completed: boolean;
	};
};

export type Activity_DB = {
	_id: ObjectId;
	userId: string;
	title: string;
	description: string;
	place: string;
	expiration: Date;
	color: string;
	notification: boolean;
	notificationtime: string;
	notificationtype: string;
	specificday: Date | null;
	reminder: boolean;
	lastsent_reminder: boolean;
	completed: boolean;
};
