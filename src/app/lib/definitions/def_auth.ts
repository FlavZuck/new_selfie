import { ObjectId } from "mongodb";
import { z } from "zod";
import { getVirtualDate } from "../../actions/timemach_logic";

// The following regex are completely unintelligible to me, be warned :)

export const SignupFormSchema = z.object({
	name: z
		.string()
		.min(2, { message: "Il nome deve avere almeno 2 caratteri." })
		.trim(),
	surname: z
		.string()
		.min(2, { message: "Il cognome deve avere almeno 2 caratteri." })
		.trim(),
	birthdate: z.coerce.date().max((await getVirtualDate()) ?? new Date(), {
		message: "Inserisci una data valida."
	}),
	email: z.string().email({ message: "Inserisci un'email valida." }).trim(),
	password: z
		.string()
		.min(8, { message: "Deve avere almeno 8 caratteri." })
		.regex(/[a-zA-Z]/, { message: "Deve contenere almeno una lettera." })
		.regex(/[0-9]/, { message: "Deve contenere almeno un numero." })
		.regex(/[^a-zA-Z0-9]/, {
			message: "Deve contenere almeno un carattere speciale."
		})
		.trim()
});

export const SigninFormSchema = z.object({
	email: z.string().email({ message: "Inserisci un'email valida." }).trim(),
	password: z
		.string()
		.min(8, { message: "Deve avere almeno 8 caratteri." })
		.regex(/[a-zA-Z]/, { message: "Deve contenere almeno una lettera." })
		.regex(/[0-9]/, { message: "Deve contenere almeno un numero." })
		.regex(/[^a-zA-Z0-9]/, {
			message: "Deve contenere almeno un carattere speciale."
		})
		.trim()
});

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

//The payload should contain the minimum, unique user data that'll be used in subsequent requests, such as:
//the user's ID, role, etc.
// It should not contain passwords or personally identifiable information (like phone number, email,credit card information, etc,)
export type SessionPayload = {
	userId: string;
	expiresAt: Date;
};

export type User = {
	_id: ObjectId;
	name: string;
	surname: string;
	birthdate: Date;
	email: string;
	password: string;
	settings: object;
};
