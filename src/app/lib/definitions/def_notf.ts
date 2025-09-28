export type Subscription_DB = {
	_id: string;
	userId: string;
	subscription: PushSubscriptionJSON;
};

export type payload_type = {
	title: string;
	body: string;
	data: {
		url: string;
	};
};

// Payload Calendario
export const payload_stesso = {
	title: "Attività in scadenza oggi",
	body: "Un'attività sta per scadere",
	data: { url: "/" }
};

export const payload_prima = {
	title: "Attività in scadenza domani",
	body: "Un'attività sta per scadere",
	data: { url: "/" }
};

export const payload_specifico = {
	title: "Attività in scadenza prossimamente",
	body: "Un'attività sta per scadere",
	data: { url: "/" }
};

export const payload_test = {
	title: "Attività in scadenza",
	body: "Un'attività sta per scadere",
	data: { url: "/" }
};

// Payload Pomodoro
export const payload_studio = {
	title: "Sessione di studio terminata",
	body: "È ora di fare una pausa!",
	data: { url: "/pomodoro" }
};

export const payload_pausa = {
	title: "Pausa terminata",
	body: "È ora di tornare a studiare!",
	data: { url: "/pomodoro" }
};

export const payload_iniziopomodoro = {
	title: "Nuova sessione di studio iniziata",
	body: "Buono studio!",
	data: { url: "/pomodoro" }
};

export const payload_finepomodoro = {
	title: "Pomodoro completato",
	body: "Ottimo lavoro! Hai finito per oggi.",
	data: { url: "/pomodoro" }
};
