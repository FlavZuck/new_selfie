"use server";

import { Pomodoro_DB } from "@/app/lib/definitions/def_pomo";
import { POMODORO, findDB, insertDB, updateDB } from "../lib/mongodb";
import { getCurrentID } from "./auth_logic";

export async function loadPomodoro(): Promise<Pomodoro_DB | null> {
	const userId = await getCurrentID();
	if (!userId) return null;

	const config = (await findDB<Pomodoro_DB>(POMODORO, {
		userId
	})) as Pomodoro_DB;
	if (!config) return null;

	return {
		_id: config._id.toString(), // Convert ObjectId to string
		userId: config.userId,
		date: config.date, // Convert Date to string
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
) {
	const userId = await getCurrentID();
	if (!userId) return;

	const currDate = new Date();
	const config = {
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
	const existing = await findDB<Pomodoro_DB>(POMODORO, { userId });

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

	return { message: "Pomodoro created successfully" };
}
