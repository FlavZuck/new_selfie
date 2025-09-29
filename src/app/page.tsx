"use client";

import "bootstrap/dist/css/bootstrap.min.css";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { getCurrentID } from "./actions/auth_logic";
import {
	isUserSubscribed,
	saveSubscription
} from "./actions/notif_logic/sub_logic";
import {
	createSubscription,
	reSubscribeDevice,
	requestNotificationPermission
} from "./actions/notif_logic/sw_logic";
import styles from "./page.module.css";
import CalePreview from "./ui/ui_preview/cale_preview";
import NotePreview from "./ui/ui_preview/note_preview";
import PomoPreview from "./ui/ui_preview/pomo_preview";

async function subscription_process() {
	console.log("User or Device not subscribed, requesting permission...");
	const permission = await requestNotificationPermission();
	// Se l'utente non ha dato il permesso, usciamo dalla funzione
	if (permission !== "granted") {
		console.log("Permission not granted");
		return;
	}
	// Se l'utente ha dato il permesso, procediamo a subscribere l'utente
	console.log("Permission requested");
	const subscription = await createSubscription();
	// Se la subscription è andata a buon fine, salviamo la subscription nel DB
	const subscriptionData = subscription.toJSON();
	await saveSubscription(subscriptionData);
	console.log("Subscription saved");
}

export default function Home() {
	async function checkNotificationPermission() {
		try {
			// Controlla se l'utente è già subscribato
			if (await isUserSubscribed()) {
				console.log("User already subscribed");

				const user_id = await getCurrentID();
				// Check per user id
				if (!user_id) {
					console.log("User not logged in");
					return;
				}

				if (await reSubscribeDevice(user_id)) {
					// Se il device delll'utente non è subscribato, procediamo a risubscrivere l'utente
					console.log("Device not subscribed, re-subscribing...");
					await subscription_process();
				} else {
					// Se l'utente è subscribato, non facciamo nulla :)
					console.log("Device already subscribed");
				}
			} else {
				// Se l'utente non è subscribato, procediamo a subscribere l'utente
				await subscription_process();
			}
		} catch (error) {
			console.error("Error checking notification permission:", error);
		}
	}

	// Chiamata alla funzione per controllare le notifiche
	useEffect(() => {
		checkNotificationPermission();
	}, []);

	return (
		<div className={styles.page}>
			{/* === HERO SECTION === */}
			<div className="bg-primary text-white py-5 mb-5">
				<div className="container">
					<div className="row align-items-center">
						<div className="col-lg-6">
							<h1 className="display-4 fw-bold">
								Benvenuto in Selfie
							</h1>
							<p className="lead">
								Il tuo assistente personale per organizzare al
								meglio il tuo tempo e aumentare la tua
								produttività.
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* === FEATURES SECTION === */}
			<div className="container mb-5">
				<h2 className="text-center mb-4">I nostri strumenti</h2>
				<div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-4">
					{/* --- Calendar Card --- */}
					<div className="col">
						<div
							className={`card h-100 shadow-sm hover-card ${styles.cardCalendar}`}
						>
							<div className="card-body text-center d-flex flex-column">
								<div className={styles.iconWrapperCalendar}>
									<Image
										src="/calendarlogo.png"
										alt="Calendar"
										width={60}
										height={60}
										className={styles.icon}
										priority
									/>
								</div>
								<h5 className="card-title mt-3">Calendario</h5>
								<p className="card-text mb-3">
									Organizza i tuoi impegni con un calendario
									intelligente e intuitivo
								</p>

								{/* Preview compatta integrata nella card */}
								<div className="mt-auto">
									<CalePreview />
								</div>

								<Link
									href="/calendar"
									className={`btn mt-3 stretched-link ${styles.btnCalendar}`}
								>
									Vai al Calendario
								</Link>
							</div>
						</div>
					</div>

					{/* --- Notes Card --- */}
					<div className="col">
						<div
							className={`card h-100 shadow-sm hover-card ${styles.cardNotes}`}
						>
							<div className="card-body text-center d-flex flex-column">
								<div className={styles.iconWrapperNotes}>
									<Image
										src="/notelogo.png"
										alt="Notes"
										width={40}
										height={40}
										className={styles.icon}
									/>
								</div>
								<h5 className="card-title mt-3">Note</h5>
								<p className="card-text mb-3">
									Cattura le tue idee al volo e organizzale in
									modo efficiente
								</p>
								<div className="mt-auto">
									<NotePreview />
								</div>
								<Link
									href="/notes"
									className={`btn mt-3 stretched-link ${styles.btnNotes}`}
								>
									Vai alle Note
								</Link>
							</div>
						</div>
					</div>

					{/* --- Pomodoro Card --- */}
					<div className="col">
						<div
							className={`card h-100 shadow-sm hover-card ${styles.cardPomodoro}`}
						>
							<div className="card-body text-center d-flex flex-column">
								<div className={styles.iconWrapperPomodoro}>
									<Image
										src="/pomodorologo.png"
										alt="Pomodoro"
										width={40}
										height={40}
										className={styles.icon}
									/>
								</div>
								<h5 className="card-title mt-3">
									Pomodoro Timer
								</h5>
								<p className="card-text mb-3">
									Massimizza la tua concentrazione con il
									metodo Pomodoro
								</p>
								<div className="mt-auto">
									<PomoPreview />
								</div>
								<Link
									href="/pomodoro"
									className={`btn mt-3 stretched-link ${styles.btnPomodoro}`}
								>
									Vai al Timer
								</Link>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
