"use client";

import { delete_activity } from "@/app/actions/cale_logic/activity_logic";
import styles from "@/app/page.module.css";

type ActivityClickProps = {
	show: boolean;
	setShow: (show: boolean) => void;
	info: any;
	refetch: () => Promise<void>;
};

export default function ActivityCard({
	show,
	setShow,
	info,
	refetch
}: ActivityClickProps) {
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
