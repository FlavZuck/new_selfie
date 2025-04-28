import { z } from "zod";

export const PomodoroSchema = z.object({
	studyMin: z.string().time(),
	pauseMin: z.string().time(),
	savedCycles: z.number().min(0, {
		message: "Please enter a number greater than 0."
	})
});

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
	_id: string;
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

export type PomodoroProposal = {
	cycles: number;
	studyMinutes: number;
	pauseMinutes: number;
	totalTime: number;
};
