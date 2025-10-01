// Centralizzazione configurazione cookie di sessione
// Necessario perchè su docker in HTTP il cookie veniva rifiutato se marcato come secure
// Se l'app gira dietro un proxy TLS terminato prima del container (quindi il container vede HTTP)
// impostare COOKIE_SECURE=false nelle variabili d'ambiente del container per consentire al cookie
// di essere accettato anche su HTTP interno.

export const COOKIE_SECURE =
	process.env.COOKIE_SECURE !== "false" &&
	process.env.NODE_ENV === "production";
