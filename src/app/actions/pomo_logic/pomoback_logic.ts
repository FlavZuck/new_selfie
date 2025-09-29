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
	PomodoroEvent,
	PomodoroEventSchema,
	PomodoroEventState,
	Pomodoro_CL,
	Pomodoro_DB,
	STUDIO
} from "@/app/lib/definitions/def_pomo";
import {
	POMODORO,
	POMOEVENTS,
	USERS,
	findAllDB,
	findDB,
	findUserById,
	insertDB,
	updateDB
} from "@/app/lib/mongodb";
import { ObjectId } from "mongodb";
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

export async function getStudyDebt(): Promise<number> {
	const userId = await getCurrentID();
	if (!userId) return 0;

	const user = await findUserById(userId);

	if (!user || !user.studyDebt) {
		return 0;
	} else {
		return user.studyDebt;
	}
}

// Funzione per creare il debito di studio
export async function createStudyDebt(
	cycles: number
): Promise<{ message: string }> {
	const userId = await getCurrentID();
	if (!userId) return { message: "Utente non trovato" };

	const id = new ObjectId(userId);
	const currentdebt = await getStudyDebt();

	// Aggiorna il debito di studio nel DB
	await updateDB(USERS, { _id: id }, { studyDebt: currentdebt + cycles });
	return { message: "Debito di studio aggiornato" };
}

export async function payStudyDebt(
	cycles: number
): Promise<{ message: string }> {
	const userId = await getCurrentID();
	if (!userId) return { message: "Utente non trovato" };

	const id = new ObjectId(userId);
	const currentdebt = await getStudyDebt();

	if (currentdebt == 0) {
		return { message: "Nessun debito di studio da pagare" };
	} else {
		// Aggiorna il debito di studio nel DB
		await updateDB(USERS, { _id: id }, { studyDebt: currentdebt - cycles });
		return { message: "Debito di studio aggiornato" };
	}
}

// Funzione per formattare gli eventi per FullCalendar
function FullCalendar_PomoEventsParser(pomoevent_array: PomodoroEvent[]) {
	return pomoevent_array.map((event: any) => {
		return {
			// Nei seguenti campi non serve fare niente di particolare
			id: event._id.toString(),
			allDay: event.allDay,
			title: event.title,
			start: event.datestart,

			// Passiamo il colore dell'evento
			color: event.color,

			// Qui vanno i dati che non riconosciuti da FullCalendar
			extendedProps: {
				studyDebt: event.debtCycles,
				description: event.description,
				type: "POMOEVENT"
			}
		};
	});
}

export async function getPomoEvents(): Promise<any> {
	const userId = await getCurrentID();
	if (!userId) return null;

	// Recupera TUTTI gli eventi dell'utente
	const pomo_events = await findAllDB<PomodoroEvent>(POMOEVENTS, {
		userId: userId
	});

	return FullCalendar_PomoEventsParser(pomo_events); // findAllDB restituisce sempre un array (anche vuoto)
}

export async function getAllPomoEvents(): Promise<PomodoroEvent[] | null> {
	// Recupera tutti gli eventi di tutti gli utenti
	const array_pomoe_events = await findAllDB<PomodoroEvent>(POMOEVENTS, {});
	return array_pomoe_events;
}

export async function createPomoEvent(
	state: PomodoroEventState,
	formData: FormData
): Promise<PomodoroEventState> {
	const userId = await getCurrentID();
	if (!userId)
		return {
			message: "Utente non trovato"
		};

	// Estrai i valori dal formData
	const title = (formData.get("title") || "").toString().trim();
	const debtCyclesRaw = formData.get("debtCycles");
	const datestartRaw = formData.get("datestart");

	// Costruisci l'oggetto da validare. (PomodoroEventSchema ha z.coerce.date quindi passiamo la stringa)
	const toValidate = {
		title,
		debtCycles: debtCyclesRaw ? Number(debtCyclesRaw) : undefined,
		datestart: datestartRaw ? datestartRaw.toString() : undefined
	};

	// Validiamo i dati
	const validated = await PomodoroEventSchema.safeParseAsync(toValidate);
	if (!validated.success) {
		const f = validated.error.flatten().fieldErrors;
		return {
			message: "Dati non validi",
			errors: {
				title: f.title,
				debtCycles: f.debtCycles,
				datestart: f.datestart
			}
		};
	}

	const { title: vTitle, debtCycles, datestart } = validated.data;

	const newEvent = {
		userId,
		title: vTitle,
		debtCycles,
		datestart,
		debtflag: true,
		allDay: true,
		color: "#a259ff"
	};

	await insertDB(POMOEVENTS, newEvent);

	return { message: "PomoEvento creato con successo" };
}

export async function unflagPomoEvent(
	_id: string
): Promise<{ message: string }> {
	const objectId = new ObjectId(_id);
	updateDB(POMOEVENTS, { _id: objectId }, { debtflag: false });
	return { message: "Evento pomodoro unflaggato" };
}
