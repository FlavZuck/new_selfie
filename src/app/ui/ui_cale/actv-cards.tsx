"use client";

import {
	complete_activity,
	delete_activity,
	get_ActivityById
} from "@/app/actions/cale_logic/activity_logic";
import { Activity_FullCalendar } from "@/app/lib/definitions/def_actv";
import styles from "@/app/page.module.css";

type ActivityCalendarClickProps = {
	show: boolean;
	setShow: (show: boolean) => void;
	setActivity: (activity: Activity_FullCalendar | null) => void;
	setShow_Update_Event: (show: boolean) => void;
	info: any;
	refetch: () => Promise<void>;
};

export function ActivityCalendarCard({
	show,
	setShow,
	setActivity,
	setShow_Update_Event,
	info,
	refetch
}: ActivityCalendarClickProps) {
	// Stato neutrale mentre non va mostrato
	if (!show) return null;

	// Prendiamo l'attività
	const activity = info.event;
	// Prepariamo le variabili per nascondere i campi
	const showplace = activity.extendedProps.place === "";
	const showdescription = activity.extendedProps.description == "";
	const shownotification = activity.extendedProps.notification;
	const showcompletion = activity.extendedProps.completed;

	const handleDelete = async () => {
		// Call the delete function
		await delete_activity(activity.id);
		// Close the modal
		setShow(false);
		// Refetch the events
		refetch();
	};

	const handleUpdate = async () => {
		const parsedActivity = await get_ActivityById(activity.id);
		if (!parsedActivity) {
			console.error("Activity not found");
		}
		setActivity(parsedActivity as Activity_FullCalendar);
		setShow(false);
		setShow_Update_Event(true);
	};

	const handleComplete = async () => {
		await complete_activity(activity.id);
		// Close the modal
		setShow(false);
		// Refetch the events
		refetch();
	};

	return (
		<div className={styles.modalBackground}>
			<div className={styles.modalContent}>
				<button
					type="button"
					// Close the modal when clicking outside of it
					onClick={() => setShow(false)}
					className={styles.closeButton}
					aria-label="Close"
				>
					&times;
				</button>

				{/*TITLE*/}
				<div className={styles.modalHeader}>
					<h1 className={styles.modalTitle}>{activity.title}</h1>
				</div>

				<div className={styles.modalBody}>
					{/* EXPIRATION DATE */}
					<div className={styles.modalSection}>
						<h3>Giorno di scadenza :</h3>
						<p>{activity.start.toDateString()}</p>
					</div>

					{/* PLACE */}
					<div hidden={showplace} className={styles.modalSection}>
						<h3>Luogo :</h3>
						<p>{activity.extendedProps.place}</p>
					</div>

					{/* DESCRIPTION */}
					<div
						hidden={showdescription}
						className={styles.modalSection}
					>
						<h3>Descrizione :</h3>
						<p>{activity.extendedProps.description}</p>
					</div>

					{/* NOTIFICATION TIME*/}
					<div
						className={styles.modalSection}
						hidden={!shownotification}
					>
						<h3>Notification Time :</h3>
						<p>{activity.extendedProps.notificationtime}</p>
					</div>

					{/* DELETE BUTTON */}
					<div className={styles.modalSection}>
						<button
							className={styles.deleteButton}
							onClick={() => {
								// Call the delete function
								handleDelete();
							}}
						>
							Elimina attività
						</button>
					</div>
					{/* UPDATE BUTTON */}
					<div className={styles.modalSection}>
						<button
							className={styles.submitButton}
							onClick={() => {
								handleUpdate();
							}}
						>
							Modifica evento
						</button>
					</div>
					{/* COMPLETE BUTTON */}
					<div
						className={styles.modalSection}
						hidden={showcompletion}
					>
						<button
							className={styles.updateButton}
							onClick={() => {
								handleComplete();
							}}
						>
							Attività Completata
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

type ActivityListCardProps = {
	show: boolean;
	setShow: (show: boolean) => void;
	activity: Activity_FullCalendar | undefined;
	refetch: () => Promise<void>;
};

export function ActivityListCard({
	show,
	setShow,
	activity,
	refetch
}: ActivityListCardProps) {
	// Stato neutrale mentre non va mostrato
	if (!show) {
		return <></>;
	}

	// Se l'attività non esiste, non mostriamo nulla
	if (!activity) {
		return <></>;
	}

	const handleDelete = async () => {
		// Call the delete function
		await delete_activity(activity.id);
		// Close the modal
		setShow(false);
		// Refetch the events
		refetch();
	};

	const handleComplete = async () => {
		await complete_activity(activity.id);
		// Close the modal
		setShow(false);
		// Refetch the events
		refetch();
	};

	// Prepariamo le variabili per nascondere i campi
	const showdescription = activity.extendedProps.description == "";
	const shownotification = activity.extendedProps.notification;
	const showcompletion = activity.extendedProps.completed;

	return (
		<div className={styles.modalBackground}>
			<div className={styles.modalContent}>
				<button
					type="button"
					// Close the modal when clicking outside of it
					onClick={() => setShow(false)}
					className={styles.closeButton}
					aria-label="Close"
				>
					&times;
				</button>

				{/*TITLE*/}
				<div className={styles.modalHeader}>
					<h1 className={styles.modalTitle}>{activity.title}</h1>
				</div>

				{/* BODY */}
				<div className={styles.modalBody}>
					{/* EXPIRATION DATE */}
					<div className={styles.modalSection}>
						<h3>Giorno di scadenza :</h3>
						<p>{activity.start.toDateString()}</p>
					</div>

					{/* DESCRIPTION */}
					<div
						hidden={showdescription}
						className={styles.modalSection}
					>
						<h3>Descrizione :</h3>
						<p>{activity.extendedProps.description}</p>
					</div>

					{/* NOTIFICATION TIME*/}
					<div
						className={styles.modalSection}
						hidden={!shownotification}
					>
						<h3>Notification Time :</h3>
						<p>{activity.extendedProps.notificationtime}</p>
					</div>

					{/* DELETE BUTTON */}
					<div className={styles.modalSection}>
						<button
							className={styles.deleteButton}
							onClick={() => {
								handleDelete();
							}}
						>
							Elimina attività
						</button>
					</div>
					{/* COMPLETE BUTTON */}
					<div
						className={styles.modalSection}
						hidden={showcompletion}
					>
						<button
							className={styles.submitButton}
							onClick={() => {
								handleComplete();
							}}
						>
							Attività Completata
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
