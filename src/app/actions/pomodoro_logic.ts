"use server";

import { Pomodoro } from "@/app/lib/definitions/def_pomo";
import { POMODORO, findDB, insertDB, updateDB } from "../lib/mongodb";
import { getCurrentID } from "./auth";

export async function loadPomodoro(): Promise<Pomodoro | null> {
	const userId = await getCurrentID();
	if (!userId) return null;

	const config = await findDB<Pomodoro>(POMODORO, { userId });
	if (!config) return null;

	return {
		userId: config.userId,
		date: config.date,
		timerConfig: {
			studyMin: config.timerConfig.studyMin,
			pauseMin: config.timerConfig.pauseMin,
			savedCycles: config.timerConfig.savedCycles
		}
	};
}

export async function savePomodoro(
	studyMin: string,
	pauseMin: string,
	savedCycles: number
): Promise<void> {
	const userId = await getCurrentID();
	if (!userId) return;

	const currDate = new Date();
	const config: Pomodoro = {
		userId,
		date: currDate,
		timerConfig: {
			studyMin,
			pauseMin,
			savedCycles
		}
		// cycles: {
		// 	completed: 0,
		// 	missed: 0
		// }
	};

	// Cerca se esiste già una config
	const existing = await findDB<Pomodoro>(POMODORO, { userId });

	if (existing) {
		await updateDB(
			POMODORO,
			{ userId },
			{
				date: currDate,
				timerConfig: config.timerConfig
				// cycles: config.cycles
			}
		);
	} else {
		await insertDB(POMODORO, config);
	}
}
