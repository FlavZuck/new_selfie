"use client";

import { create_activity } from "@/app/actions/cale_logic/activity_logic";
import styles from "@/app/page.module.css";
import { useActionState, useEffect } from "react";

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
	//
	const [state, action, pending] = useActionState(create_activity, undefined);

	// This function will be called when the event is created and calls the refetch function
	// to update the events
	function handleEventCreation() {
		if (state?.message && !state?.errors && !pending) {
			refetch();
			setShow(false);
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
					onClick={() => setShow(false)}
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
