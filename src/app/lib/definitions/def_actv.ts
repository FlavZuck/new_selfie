import { z } from "zod";
import { getVirtualDate } from "../../actions/timemach_logic";

const current_date = (await getVirtualDate()) ?? new Date();

const BaseActivitySchema = z.object({
	title: z
		.string()
		.min(1, { message: "The title must have at least one character." })
		.max(50, {
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
		.or(z.literal("")),
	expiration: z.coerce
		.date()
		.min(new Date(current_date.setHours(0, 0, 0, 0)), {
			message: "Please enter a date from today and onward."
		}),
	// Notification settings
	notification: z.literal("on").or(z.literal(null)),
	reminder: z.literal("on").or(z.literal(null)),
	notificationtime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
		message: "Please enter a valid time in HH:mm format."
	}),
	notificationtype: z.enum(["stesso", "prima", "specifico"]),
	specificday: z.coerce
		.date()
		.max(current_date, {
			message: "Please enter a date from yesterday and backward."
		})
		.or(z.literal(""))
});

export const ActivitySchema = BaseActivitySchema.superRefine(
	({ expiration, notification, notificationtype, specificday }, ctx) => {
		// To ensure that the expiration date is always after the notification date
		if (notification === "on" && notificationtype === "specifico") {
			if (specificday && expiration < specificday) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message:
						"Notification date must be before expiration date .",
					path: ["specificday"]
				});
			} else if (!specificday) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Please select a specific day.",
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
	};
};

export type Activity_DB = {
	_id: string;
	userId: string;
	title: string;
	description: string;
	place: string;
	expiration: Date;
	color: string;
	notification: boolean;
	reminder: boolean;
	notificationtime: string;
	notificationtype: string;
	specificday: Date | null;
};
