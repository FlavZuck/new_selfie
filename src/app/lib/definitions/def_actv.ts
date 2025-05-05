import { z } from "zod";

const BaseActivitySchema = z.object({
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
	}),
	// Fields for notification
	notification: z.literal("on").or(z.literal(null)),
	notificationtime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
		message: "Please enter a valid time in HH:mm format."
	}),
	notificationtype: z.enum(["stesso", "prima", "specifico"]),
	specificday: z.coerce
		.date()
		.max(new Date(), {
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
				expiration?: string[];
				// Notification
				notification?: string[];
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
		type: "ACTIVITY";
		notification: boolean;
		notificationtype: "stesso" | "prima" | "specifico";
		specificday: Date | null;
	};
};

export type Activity_DB = {
	_id: string;
	userId: string;
	title: string;
	description: string;
	expiration: Date;
	color: string;
	notification: boolean;
	notificationtime: string;
	notificationtype: "stesso" | "prima" | "specifico";
	specificday: Date | null;
};
