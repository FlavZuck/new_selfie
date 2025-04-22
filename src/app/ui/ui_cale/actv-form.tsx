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

	// This function will be called when the event is created and calls the refetch function
	// to update the events
	function handleEventCreation() {
		if (state?.message && !state?.errors && !pending) {
			refetch();
			setShow(false);
			setSpec_day(false);
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
					onClick={() => {
						setShow(false);
						setSpec_day(false);
					}}
					className={styles.closeButton}
				>
					&times;
				</button>
			</div>
			<form action={action}>
				{/*TITLE*/}
				<div>
					<label htmlFor="title">Titolo </label>
					<input
						id="title"
						name="title"
						placeholder="Titolo"
						required
					/>
				</div>
				{/*DESCRIPTION*/}
				<div>
					<label htmlFor="description">Descrizione </label>
					<input
						id="description"
						name="description"
						placeholder="Descrizione"
					/>
				</div>
				{state?.errors?.description && (
					<p>{state.errors.description}</p>
				)}
				{/*EXPIRATION*/}
				<div>
					<label htmlFor="expiration">Scadenza </label>
					<input
						type="date"
						id="expiration"
						name="expiration"
						required
					/>
				</div>
				{state?.errors?.expiration && <p>{state.errors.expiration}</p>}

				{/*NOTIFICATION*/}
				<div>
					<label htmlFor="notification">Notifiche</label>
					<input
						type="checkbox"
						id="notification"
						name="notification"
						defaultChecked={false}
						onChange={(e) => {
							if (e.target.checked) {
								setNotif(true);
							} else {
								setNotif(false);
							}
						}}
					/>
				</div>
				{state?.errors?.notification && (
					<p>{state.errors.notification}</p>
				)}
				<div hidden={!notif}>
					{/*NOTIFICATION TYPE*/}
					<div>
						<label htmlFor="notificationtype">Tipo notifica </label>
						<select
							id="notificationtype"
							name="notificationtype"
							onChange={(e) => {
								if (e.target.value == "specifico") {
									setSpec_day(true);
								} else {
									setSpec_day(false);
								}
							}}
						>
							<option value="stesso">Giorno stesso</option>
							<option value="prima">Giorno prima</option>
							<option value="specifico">Giorno specifico </option>
						</select>
					</div>
					{state?.errors?.notificationtype && (
						<p>{state.errors.notificationtype}</p>
					)}
					{/*SPECIFIC DAY*/}
					<div hidden={!spec_day}>
						<label htmlFor="specificday">Giorno specifico </label>
						<input
							type="date"
							id="specificday"
							name="specificday"
							placeholder="Giorno specifico"
						/>
						{state?.errors?.specificday && (
							<p>{state.errors.specificday}</p>
						)}
					</div>
				</div>

				{/*SUBMIT BUTTON*/}
				<button
					className={styles.button}
					disabled={pending}
					type="submit"
				>
					{pending ? "Creating event..." : "Create Event"}
				</button>
			</form>
		</div>
	);
}
