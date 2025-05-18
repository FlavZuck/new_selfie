"use client";

import { delete_event } from "@/app/actions/cale_logic/event_logic";
import { Event_FullCalendar } from "@/app/lib/definitions/def_event";
import styles from "@/app/page.module.css";

type EventClickProps = {
	show: boolean;
	setShow: (show: boolean) => void;
	setEventToUpdate: (event: Event_FullCalendar | null) => void;
	setShow_Update_Event: (show: boolean) => void;
	info: any;
	refetch: () => Promise<void>;
};

export default function EventCard({
	show,
	setShow,
	setEventToUpdate,
	setShow_Update_Event,
	info,
	refetch
}: EventClickProps) {
	// single early-return guard
	if (!show) return null;

	const event = info.event;
	const showtime = event.allDay;
	const showduration = event.extendedProps.duration === "";
	const showplace = event.extendedProps.place === "";

	const handleUpdate = () => {
		setEventToUpdate(event);
		setShow(false);
		setShow_Update_Event(true);
	};

	const handleDelete = () => {
		delete_event(event.id);
		setShow(false);
		refetch();
	};

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
							<h3>Orario :</h3>
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
								handleDelete();
							}}
						>
							Elimina evento
						</button>
					</div>
					{/* UPDATE BUTTON */}
					<div className={styles.modalSection}>
						<button
							className={styles.updateButton}
							onClick={() => {
								handleUpdate();
							}}
						>
							Modifica evento
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
