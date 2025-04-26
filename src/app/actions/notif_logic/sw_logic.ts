"use client";

// Importiamo la public VAPID key dal file .env
const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

// Essenzialmente converte la chiave pubblica VAPID da base64 a un array di byte
function urlBase64ToUint8Array(base64String: string) {
	if (!base64String) {
		throw new Error("Base64 string is empty");
	}
	const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
	const base64 = (base64String + padding)
		.replace(/-/g, "+")
		.replace(/_/g, "/");
	const rawData = window.atob(base64);
	const outputArray = new Uint8Array(rawData.length);
	for (let i = 0; i < rawData.length; ++i) {
		outputArray[i] = rawData.charCodeAt(i);
	}
	return outputArray;
}

// Richiede il permesso per le notifiche push (duh)
export async function requestNotificationPermission() {
	const permission = await Notification.requestPermission();
	return permission;
}

// Registra il service worker per le notifiche push (praticamente avvia il worker)
async function registerServiceWorker() {
	if ("serviceWorker" in navigator) {
		const registration = await navigator.serviceWorker.register("/sw.js");
		return registration;
	} else {
		throw new Error("Service workers not supported");
	}
}

export async function createSubscription() {
	// Controlla se la chiave pubblica VAPID è != null
	if (!publicVapidKey) {
		throw new Error("Public VAPID key is not set");
	}

	//  Prende il service worker
	const registration = await registerServiceWorker();

	// Prepara la subscription
	const subscription = await registration.pushManager.subscribe({
		userVisibleOnly: true,
		applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
	});

	return subscription;
}
