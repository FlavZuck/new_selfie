import { getVirtualDate } from "@/app/actions/timemach_logic";
import { ObjectId } from "mongodb";
import { z } from "zod";

// Dynamic date validators to ensure thresholds update on each validation
const dynamicMinDate = async (date: Date): Promise<boolean> => {
	const v = (await getVirtualDate()) ?? new Date();
	v.setHours(0, 0, 0, 0);
	return date >= v;
};

export const PomodoroSchema = z.object({
	studyMin: z.string().time(),
	pauseMin: z.string().time(),
	savedCycles: z.number().min(0, {
		message: "Deve essere un numero maggiore di 0."
	})
});

export const PomodoroEventSchema = z.object({
	title: z
		.string()
		.min(1, { message: "Il titolo deve avere almeno un carattere." })
		.max(25, {
			message: "Il titolo deve avere al massimo 25 caratteri."
		}),
	debtCycles: z
		.number()
		.min(1, { message: "Deve essere un numero maggiore di 0." }),
	datestart: z.coerce.date().refine(dynamicMinDate, {
		message: "Scegliete una data da oggi in poi."
	})
});

export const INIZIO = "inizio";
export const STUDIO = "studio";
export const PAUSA = "pausa";
export const FINE = "fine";

export type Pomodoro_DB = {
	_id: ObjectId;
	userId: string;
	date: Date;
	timerConfig: {
		studyMin: string;
		pauseMin: string;
		savedCycles: number;
	};
};

export type Pomodoro_CL = {
	_id: string;
	userId: string;
	date: Date;
	timerConfig: {
		studyMin: string;
		pauseMin: string;
		savedCycles: number;
	};
};

export type PomodoroEvent = {
	_id: ObjectId;
	userId: string;
	title: string;
	debtCycles: number;
	datestart: Date;
	debtflag: boolean;
	allDay: true;
};

export type PomodoroProposal = {
	cycles: number;
	studyMinutes: number;
	pauseMinutes: number;
	totalTime: number;
};

export type PomodoroState =
	| {
			errors?: {
				date?: string[];
				studyMin?: string[];
				pauseMin?: string[];
				savedCycles?: number[];
			};
			message?: string;
	  }
	| undefined;

export type PomodoroEventState =
	| {
			errors?: {
				debtCycles?: string[];
				title?: string[];
				datestart?: string[];
				debtflag?: string[];
				allDay?: string[];
			};
			message?: string;
	  }
	| undefined;
