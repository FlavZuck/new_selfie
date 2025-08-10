"use client";

import {
	createSubscription,
	requestNotificationPermission
} from "@/app/actions/notif_logic/sw_logic";
import React, { useState } from "react";
import { send_TEST_NotificationToAll } from "../actions/notif_logic/push_logic";
import {
	isUserSubscribed,
	saveSubscription
} from "../actions/notif_logic/sub_logic";
import { testsendEmail } from "../lib/nodemailer";

export default function NotificationsTestPage() {
	// Stato per gestire il messaggio sotto il bottone " Send Notifications"
	const [send_status, set_send_Status] = useState("");

	// Stato per gestire il messaggio sotto il bottone "Create Subscription"
	const [sub_status, set_sub_Status] = useState("");

	// Funzione per gestire il click del bottone "Test Notifications"
	// NOTABENE: sarebbe meglio pulire via sti console.log()
	const handleSub = async () => {
		try {
			if ((await isUserSubscribed()) === false) {
				// Autoesplicativo
				set_sub_Status("Requesting permission...");

				// Richiede il permesso per le notifiche
				const permission = await requestNotificationPermission();
				if (permission !== "granted") {
					// Se il permesso non è concesso, usciamo dalla funzione
					set_sub_Status("Permission not granted");
					return;
				}

				// Se il permesso è concesso, procediamo a subscribere l'utente
				set_sub_Status("Subscribing...");
				const subscription = await createSubscription();

				// Se la subscription è andata a buon fine, salviamo la subscription nel DB
				const subscriptionData = subscription.toJSON();
				await saveSubscription(subscriptionData);
				set_sub_Status("Subscription saved");
			} else {
				// Se l'utente è già subscribato, mostriamo un messaggio
				set_sub_Status("User already subscribed");
			}
		} catch (err) {
			console.error(err);
			set_sub_Status("Error: " + err);
		}
	};

	const handleSend = async () => {
		try {
			// Sapendo che l'utente è subscribato, inviamo una notifica di test
			set_send_Status("Sending test notification...");
			await send_TEST_NotificationToAll();

			// Se tutto va bene, mostriamo un messaggio di successo
			set_send_Status("Test notification sent");
		} catch (err) {
			console.error(err);
			set_send_Status("Error: " + err);
		}
	};

	const handleTestEmail = async () => {
		try {
			await testsendEmail();
			console.log("Test email sent successfully");
		} catch (err) {
			console.error("Error sending test email: ", err);
		}
	};

	return (
		<div>
			<div style={{ padding: "2rem" }}>
				<button onClick={handleSub}>Create Subscription</button>
				{sub_status && <p>{sub_status}</p>}
			</div>

			<div style={{ padding: "2rem" }}>
				<button onClick={handleSend}>Send Notifications</button>
				{send_status && <p>{send_status}</p>}
			</div>

			<div style={{ padding: "2rem" }}>
				<button onClick={handleTestEmail}>Send Test Email</button>
			</div>
		</div>
	);
}
