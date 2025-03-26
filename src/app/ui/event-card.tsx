"use client";

import styles from "@/app/page.module.css";
import { useEffect } from "react";

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

	return (
		<div className={styles.modalBackground}>
			<div className={`${styles.modal}`}>
				<button
					type="button"
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
				</div>
			</div>
		</div>
	);
}
