"use client";

import { delete_event } from "@/app/actions/cale_logic/event_logic";
import styles from "@/app/page.module.css";

type EventClickProps = {
	show: boolean;
	setShow: (show: boolean) => void;
	info: any;
	refetch: () => Promise<void>;
};

export default function EventCard({
	show,
	setShow,
	info,
	refetch
}: EventClickProps) {
	if (!show) {
		return <></>;
	}

	const event = info.event;

	// Check if the event is all-day, if so, hide the time
	const showtime = event.allDay;
	// Check if duration was provided, if not, hide the duration
	const showduration = event.extendedProps.duration == "";
	//
	const showplace = event.extendedProps.place == "";

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
					<h1 className={styles.modalTitle}>{event.title}</h1>
				</div>

				<div className={styles.modalBody}>
					{/* PLACE */}
					<div hidden={showplace} className={styles.modalSection}>
						<h3>Luogo :</h3>
						<p>{event.extendedProps.place}</p>
					</div>

					{/* DESCRIPTION */}
					<div className={styles.modalSection}>
						<h3>Descrizione :</h3>
						<p>{event.extendedProps.description}</p>
					</div>

					{/* DATE */}
					<div className={styles.modalSection}>
						<h3>Data di inizio :</h3>
						<p>{event.start.toDateString()}</p>
					</div>

					{/* TIME AND DURATION */}
					<div hidden={showtime}>
						<div className={styles.modalSection}>
							<h3 className="bg-primary">Orario :</h3>
							<p>
								{event.start.toLocaleTimeString([], {
									hour: "2-digit",
									minute: "2-digit"
								})}
							</p>
						</div>
						<div
							hidden={showduration}
							className={styles.modalSection}
						>
							<h3>Durata in ore:</h3>
							<p>{event.extendedProps.duration}</p>
						</div>
					</div>
					{/* DELETE BUTTON */}
					<div className={styles.modalSection}>
						<button
							className={styles.deleteButton}
							onClick={() => {
								// Call the delete function
								delete_event(event.id);
								// Close the modal
								setShow(false);
								// Refetch the events
								refetch();
							}}
						>
							Elimina evento
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
