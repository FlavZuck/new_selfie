"use client";

import { update_activity } from "@/app/actions/cale_logic/activity_logic";
import { Activity_FullCalendar } from "@/app/lib/definitions/def_actv";
import styles from "@/app/page.module.css";
import { useActionState, useEffect } from "react";

type ActivityFormProps = {
	show: boolean;
	setShow: (show: boolean) => void;
	refetch: () => Promise<void>;
	activity: Activity_FullCalendar | null;
};

export default function UpdateActivityForm({
	show,
	setShow,
	refetch,
	activity
}: ActivityFormProps) {
	let activity_id = "";

	if (activity) {
		activity_id = activity.id;
	}

	// This is a custom hook that manages the state of the action
	// Magia nera, come sempre
	const [state, action, pending] = useActionState(
		update_activity.bind(null, activity_id),
		undefined
	);

	// This function will be called when the activity is updated and calls the refetch function to update the activities
	function handleActivityUpdate() {
		if (state?.message && !state?.errors && !pending) {
			refetch();
			setShow(false);
		}
	}

	// This useEffect will refetch the activities only when the state changes or the pending state changes
	useEffect(() => {
		// This is used to refetch the activities when an activity is updated
		handleActivityUpdate();
		// This comment is to avoid the exhaustive-deps warning from eslint
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [pending]);

	if (!show || !activity) {
		return <div></div>;
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
				<form action={action}>
					{/*TITLE*/}
					<div>
						<label htmlFor="title">Titolo </label>
						<input
							id="title"
							name="title"
							placeholder="Titolo"
							defaultValue={activity.title}
							required
						/>
					</div>
					{state?.errors?.title && <p>{state.errors.title}</p>}

					{/*PLACE*/}
					<div>
						<label htmlFor="place">Luogo </label>
						<input
							id="place"
							name="place"
							placeholder="Luogo"
							defaultValue={activity.extendedProps.place}
						/>
					</div>
					{state?.errors?.place && <p>{state.errors.place}</p>}

					{/*DESCRIPTION*/}
					<div>
						<label htmlFor="description">Descrizione </label>
						<input
							id="description"
							name="description"
							placeholder="Descrizione"
							defaultValue={activity.extendedProps.description}
							required
						/>
					</div>
					{state?.errors?.description && (
						<p>{state.errors.description}</p>
					)}

					{/*SUBMIT BUTTON*/}
					<button
						className={styles.button}
						disabled={pending}
						type="submit"
					>
						{pending ? "Updating event..." : "Update Event"}
					</button>
				</form>
			</div>
		</div>
	);
}
