"use client";

import styles from "@/app/page.module.css";

type EventClickProps = {
	show: boolean;
	setShow: (show: boolean) => void;
	info: any;
};

export default function EventCard({ show, setShow, info }: EventClickProps) {
	if (!show) {
		return <></>;
	}

	const event = info.event;

	// Check if the event is all-day, if so, hide the time
	const showtime = event.allDay;

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

				<div className={styles.modalHeader}>
					<h1 className={styles.modalTitle}>{event.title}</h1>
				</div>

				<div className={styles.modalBody}>
					<div className={styles.modalSection}>
						<h3>Description :</h3>
						<p>{event.extendedProps.description}</p>
					</div>

					<div className={styles.modalSection}>
						<h3>Date :</h3>
						<p>{event.start.toDateString()}</p>
					</div>
					<div hidden={showtime} className={styles.modalSection}>
						<h3>Time :</h3>
						<p>
							{event.start.toLocaleTimeString([], {
								hour: "2-digit",
								minute: "2-digit"
							})}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
