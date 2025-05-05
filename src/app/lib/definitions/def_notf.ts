export type Subscription_DB = {
	_id: string;
	userId: string;
	subscription: PushSubscriptionJSON;
};

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
