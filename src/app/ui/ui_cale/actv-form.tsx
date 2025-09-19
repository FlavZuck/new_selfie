"use client";

import { create_activity } from "@/app/actions/cale_logic/activity_logic";
import styles from "@/app/page.module.css";
import { useActionState, useEffect, useState } from "react";

type ActivityFormProps = {
	show: boolean;
	setShow: (show: boolean) => void;
	refetch: () => Promise<void>;
};

export default function ActivityForm({
	show,
	setShow,
	refetch
}: ActivityFormProps) {
	// Action state for the create_activity action
	const [state, action, pending] = useActionState(create_activity, undefined);

	// State to manage the visibility of the notification fields
	const [notif, setNotif] = useState(false);
	// State to manage the visibility of the specific day input
	const [spec_day, setSpec_day] = useState(false);

	function resetStates() {
		// Reset the state of the form
		setNotif(false);
		setSpec_day(false);
		setShow(false);
	}

	// This function will be called when the event is created and calls the refetch function
	// to update the events
	function handleEventCreation() {
		if (state?.message && !state?.errors && !pending) {
			refetch();
			resetStates();
		}
	}
	// This useEffect will refetch the events only when the state changes or the pending state changes
	useEffect(() => {
		handleEventCreation();
		// This comment is to avoid the exhaustive-deps warning from eslint
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [state, pending]);

	// Very inelegant way to keep the form closed (lol)
	if (!show) {
		return <></>;
	}

	return (
		<div className={styles.modalBackground}>
			<div className={styles.modalContent}>
				<button
					type="button"
					onClick={() => resetStates()}
					className={styles.closeButton}
				>
					&times;
				</button>
				<div
					style={{
						overflowY: "auto",
						maxHeight: "calc(90vh - 3rem)",
						paddingRight: "1rem"
					}}
				>
					<form action={action}>
						{/*TITLE*/}
						<div className={styles.formGroup}>
							<label htmlFor="title" className={styles.formLabel}>
								Titolo
							</label>
							<input
								id="title"
								name="title"
								placeholder="Titolo"
								required
								className={styles.formInput}
							/>
						</div>
						{state?.errors?.title && <p>{state.errors.title}</p>}

						{/*DESCRIPTION*/}
						<div className={styles.formGroup}>
							<label
								htmlFor="description"
								className={styles.formLabel}
							>
								Descrizione
							</label>
							<input
								id="description"
								name="description"
								placeholder="Descrizione"
								className={styles.formInput}
							/>
						</div>
						{state?.errors?.description && (
							<p>{state.errors.description}</p>
						)}

						{/*PLACE*/}
						<div className={styles.formGroup}>
							<label htmlFor="place" className={styles.formLabel}>
								Luogo
							</label>
							<input
								id="place"
								name="place"
								placeholder="Luogo"
								className={styles.formInput}
							/>
						</div>
						{state?.errors?.place && <p>{state.errors.place}</p>}

						{/*EXPIRATION*/}
						<div className={styles.formGroup}>
							<label
								htmlFor="expiration"
								className={styles.formLabel}
							>
								Scadenza
							</label>
							<input
								type="date"
								id="expiration"
								name="expiration"
								required
								className={styles.formInput}
							/>
						</div>
						{state?.errors?.expiration && (
							<p>{state.errors.expiration}</p>
						)}

						{/*NOTIFICATION*/}
						<div className={styles.formGroup}>
							<label
								htmlFor="notification"
								className={styles.formLabel}
							>
								Notifiche
							</label>
							<input
								type="checkbox"
								id="notification"
								name="notification"
								defaultChecked={false}
								onChange={(e) => {
									setNotif(e.target.checked);
								}}
							/>
						</div>
						{state?.errors?.notification && (
							<p>{state.errors.notification}</p>
						)}
						<div hidden={!notif}>
							{/*REMINDER*/}
							<div className={styles.formGroup}>
								<label
									htmlFor="reminder"
									className={styles.formLabel}
								>
									Promemoria dopo la scadenza
								</label>
								<input
									type="checkbox"
									id="reminder"
									name="reminder"
									defaultChecked={false}
								/>
							</div>

							{/*NOTIFICATION TIME*/}
							<div className={styles.formGroup}>
								<label
									htmlFor="notificationtime"
									className={styles.formLabel}
								>
									Ora notifica
								</label>
								<input
									type="time"
									id="notificationtime"
									name="notificationtime"
									placeholder="Ora notifica"
									defaultValue="08:00"
									required
									className={styles.formInput}
								/>
								{state?.errors?.notificationtime && (
									<p>{state.errors.notificationtime}</p>
								)}
							</div>

							{/*NOTIFICATION TYPE*/}
							<div className={styles.formGroup}>
								<label
									htmlFor="notificationtype"
									className={styles.formLabel}
								>
									Tipo notifica
								</label>
								<select
									id="notificationtype"
									name="notificationtype"
									className={styles.formInput}
									onChange={(e) => {
										if (e.target.value == "specifico") {
											setSpec_day(true);
										} else {
											setSpec_day(false);
										}
									}}
								>
									<option value="stesso">
										Giorno stesso
									</option>
									<option value="prima">Giorno prima</option>
									<option value="specifico">
										Giorno specifico
									</option>
								</select>
							</div>
							{state?.errors?.notificationtype && (
								<p>{state.errors.notificationtype}</p>
							)}
							{/*SPECIFIC DAY*/}
							<div
								hidden={!spec_day}
								className={styles.formGroup}
							>
								<label
									htmlFor="specificday"
									className={styles.formLabel}
								>
									Giorno specifico
								</label>
								<input
									type="date"
									id="specificday"
									name="specificday"
									placeholder="Giorno specifico"
									className={styles.formInput}
								/>
								{state?.errors?.specificday && (
									<p>{state.errors.specificday}</p>
								)}
							</div>
						</div>

						{/*SUBMIT BUTTON*/}
						<button
							className={styles.submitButton}
							disabled={pending}
							type="submit"
						>
							{pending
								? "Creazione in corso..."
								: "Crea Attività"}
						</button>
					</form>
				</div>
			</div>
		</div>
	);
}
