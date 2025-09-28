import { ObjectId } from "mongodb";
import { z } from "zod";

export const PomodoroSchema = z.object({
	studyMin: z.string().time(),
	pauseMin: z.string().time(),
	savedCycles: z.number().min(0, {
		message: "Deve essere un numero maggiore di 0."
	})
});

export const INIZIO = "inizio";
export const STUDIO = "studio";
export const PAUSA = "pausa";
export const FINE = "fine";

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

export type PomodoroProposal = {
	cycles: number;
	studyMinutes: number;
	pauseMinutes: number;
	totalTime: number;
};
