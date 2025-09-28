"use server";

import {
	payload_finepomodoro,
	payload_iniziopomodoro,
	payload_pausa,
	payload_studio
} from "@/app/lib/definitions/def_notf";
import {
	FINE,
	INIZIO,
	PAUSA,
	Pomodoro_CL,
	Pomodoro_DB,
	STUDIO
} from "@/app/lib/definitions/def_pomo";
import { POMODORO, findDB, insertDB, updateDB } from "@/app/lib/mongodb";
import { getCurrentID } from "../auth_logic";
import { sendNotification_forPomodoro } from "../notif_logic/push_logic";

export async function getPomodoro(): Promise<Pomodoro_CL | null> {
	const userId = await getCurrentID();
	if (!userId) return null;

	const config = (await findDB<Pomodoro_DB>(POMODORO, {
		userId
	})) as Pomodoro_DB;
	if (!config) return null;

	const pomodoro: Pomodoro_CL = {
		_id: config._id.toString(),
		userId: config.userId,
		date: config.date,
		timerConfig: {
			studyMin: config.timerConfig.studyMin,
			pauseMin: config.timerConfig.pauseMin,
			savedCycles: config.timerConfig.savedCycles
		}
	};

	return pomodoro;
}

export async function savePomodoro(
	studyMin: string,
	pauseMin: string,
	savedCycles: number
): Promise<{ message: string }> {
	const userId = await getCurrentID();
	if (!userId) {
		return { message: "Utente non trovato" };
	}

	const currDate = new Date();
	const config = {
		userId,
		date: currDate,
		timerConfig: {
			studyMin,
			pauseMin,
			savedCycles
		}
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
			}
		);
	} else {
		await insertDB(POMODORO, config);
	}

	return { message: "Pomodoro created/updated successfully" };
}

// Funzione per inviare notifiche in base al tipo di fase del pomodoro
export async function notifyPomodoro(
	fase: string
): Promise<{ message: string }> {
	const userId = await getCurrentID();
	if (!userId) return { message: "Utente non trovato" };

	switch (fase) {
		case INIZIO:
			await sendNotification_forPomodoro(userId, payload_iniziopomodoro);
			break;
		case STUDIO:
			await sendNotification_forPomodoro(userId, payload_studio);
			break;
		case PAUSA:
			await sendNotification_forPomodoro(userId, payload_pausa);
			break;
		case FINE:
			await sendNotification_forPomodoro(userId, payload_finepomodoro);
			break;
		default:
			return { message: "Fase non valida" };
	}

	return { message: "Notifica inviata" };
}
