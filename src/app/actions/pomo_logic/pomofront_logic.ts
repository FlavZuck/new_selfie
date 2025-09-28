"use client";

import { PomodoroProposal } from "@/app/lib/definitions/def_pomo";

// Funzione per formattare input HH:MM:SS
export function formatHHMMSS(input: string) {
	const digits = input.replace(/\D/g, "");
	const h = digits.slice(0, 2);
	const m = digits.slice(2, 4);
	const s = digits.slice(4, 6);
	let result = h;
	if (m) result += ":" + m;
	if (s) result += ":" + s;
	return result;
}

// Funzione per calcolare le proposte in base al tempo disponibile
export function calculateProposals(totalMinutes: number): PomodoroProposal[] {
	const proposals: PomodoroProposal[] = [];

	// Combinazioni di studio/pausa comuni
	const combinations = [
		{ study: 25, pause: 5 },
		{ study: 35, pause: 5 },
		{ study: 40, pause: 5 },
		{ study: 45, pause: 5 },
		{ study: 50, pause: 5 },
		{ study: 30, pause: 10 },
		{ study: 35, pause: 10 },
		{ study: 45, pause: 10 },
		{ study: 50, pause: 10 }
	];

	combinations.forEach(({ study, pause }) => {
		const cycleTime = study + pause;
		const possibleCycles = Math.floor(totalMinutes / cycleTime);
		const totalTime = possibleCycles * cycleTime;

		if (totalTime === totalMinutes) {
			proposals.push({
				cycles: possibleCycles,
				studyMinutes: study,
				pauseMinutes: pause,
				totalTime
			});
		}
	});

	return proposals;
}

// Funzione per convertire il tempo dal formato HH:MM:SS in secondi
export function inSeconds(time: string): number {
	const splitted = time.split(":").map(Number);
	return splitted[0] * 3600 + splitted[1] * 60 + splitted[2];
}

// Funzione per visualizzare il tempo in secondi al formato HH:MM:SS
export function displayTime(seconds: number): string {
	const hour = Math.floor(seconds / 3600);
	const min = Math.floor((seconds % 3600) / 60);
	const sec = seconds % 60;
	return `${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}
