"use client";

import { delete_activity } from "@/app/actions/cale_logic/activity_logic";
import { Activity_FullCalendar } from "@/app/lib/definitions/def_actv";
import styles from "@/app/page.module.css";

type ActivityCalendarClickProps = {
	show: boolean;
	setShow: (show: boolean) => void;
	info: any;
	refetch: () => Promise<void>;
};

export function ActivityCalendarCard({
	show,
	setShow,
	info,
	refetch
}: ActivityCalendarClickProps) {
	// Stato neutrale mentre non va mostrato
	if (!show) {
		return <></>;
	}

	const activity = info.event;
	// To ensure that if the description is empty, we hide the description
	const showdescription = activity.extendedProps.description == "";

	return (
		<div className={styles.modalBackground}>
			<div className={`${styles.modal}`}>
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

				{/* EXPIRATION DATE */}
				<div>
					<h3>Giorno di scadenza :</h3>
					<p>{activity.start.toDateString()}</p>
				</div>

				{/* DESCRIPTION */}
				<div hidden={showdescription} className={styles.modalSection}>
					<h3>Descrizione :</h3>
					<p>{activity.extendedProps.description}</p>
				</div>

				{/* DELETE BUTTON */}
				<div className={styles.modalSection}>
					<button
						className={styles.deleteButton}
						onClick={() => {
							// Call the delete function
							delete_activity(activity.id);
							// Close the modal
							setShow(false);
							// Refetch the events
							refetch();
						}}
					>
						Elimina attività
					</button>
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

	// To ensure that if the description is empty, we hide the description
	const showdescription = activity.extendedProps.description == "";

	return (
		<div className={styles.modalBackground}>
			<div className={`${styles.modal}`}>
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
				<div className={styles.modalSection}>
					{/* EXPIRATION DATE */}
					<div>
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

					{/* DELETE BUTTON */}
					<div className={styles.modalSection}>
						<button
							className={styles.deleteButton}
							onClick={() => {
								// Call the delete function
								delete_activity(activity.id);
								// Close the modal
								setShow(false);
								// Refetch the events
								refetch();
							}}
						>
							Elimina attività
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
