"use client";

import styles from "@/app/page.module.css";
import { useEffect, useRef, useState } from "react";
import {
	getVirtualDate,
	resetVirtualDate,
	setVirtualDate
} from "../actions/timemach_logic";

// Obblighiamo il componente a essere dinamico, in modo che venga ricaricato ogni volta
export const dynamic = "force-dynamic";

export default function TimeMachineButton() {
	// Virtual date state
	const [now, setNow] = useState<Date | null>(null);
	const [active, setActive] = useState<boolean>(false);

	const [show, setShow] = useState(false);
	const dateInputRef = useRef<HTMLInputElement>(null);

	// Carica data virtuale iniziale (molto arzigogolato ma funziona)
	useEffect(() => {
		(async () => {
			const vd = await getVirtualDate();
			setNow(vd);
			setActive(vd !== null);
		})();
	}, []);

	// Funzione per gestire il click sul pulsante "Set Date"
	const handleSetVirtualDate = async () => {
		if (dateInputRef.current?.value) {
			const date = new Date(dateInputRef.current.value);
			// Controllo un po' particolare ma funzionale
			if (!isNaN(date.getTime())) {
				await setVirtualDate(date);
				setShow(false);
				window.location.reload();
			} else {
				alert("Please enter a valid date");
			}
		} else {
			alert("Please select a date and time");
		}
	};

	// Funzione per gestire il reset della data virtuale
	const handleResetVirtualDate = async () => {
		await resetVirtualDate();
		setShow(false);
		window.location.reload();
	};

	return (
		<>
			<div className={styles.timeMachineContainer}>
				<button
					onClick={() => setShow(!show)}
					className={styles.timeMachineButton}
				>
					🕐 Time Machine
				</button>
			</div>

			{show && (
				<div className={styles.modalBackground}>
					<div className={styles.timeMachineModal}>
						<button
							onClick={() => setShow(false)}
							className={styles.closeButton}
						>
							&times;
						</button>

						<h2 className={styles.modalTitle}>Time Machine</h2>

						{/* VIRTUAL DATE STATUS */}
						<div className={styles.statusContainer}>
							{active && now ? (
								<div className={styles.statusActive}>
									<p className={styles.statusText}>
										Virtual date active:{" "}
										{now.toLocaleString()}
									</p>
								</div>
							) : (
								<div className={styles.statusInactive}>
									<p className={styles.statusText}>
										No virtual date set - using real time
									</p>
								</div>
							)}
						</div>

						{/* SET VIRTUAL DATE */}
						<div className={styles.inputGroup}>
							<label
								htmlFor="virtual-date"
								className={styles.label}
							>
								Set virtual date:
							</label>
							<div className={styles.inputContainer}>
								<input
									ref={dateInputRef}
									type="datetime-local"
									id="virtual-date"
									className={styles.dateInput}
								/>
								<button
									onClick={handleSetVirtualDate}
									className={styles.actionButton}
								>
									Set Date
								</button>
							</div>
						</div>

						{/* RESET VIRTUAL DATE */}
						{active && (
							<div className={styles.inputGroup}>
								<label className={styles.label}>
									Reset to real time:
								</label>
								<button
									onClick={handleResetVirtualDate}
									className={`${styles.actionButton} ${styles.resetButton}`}
								>
									Reset to Real Time
								</button>
							</div>
						)}
					</div>
				</div>
			)}
		</>
	);
}
