"use client";

import { update_event } from "@/app/actions/cale_logic/event_logic";
import { Event_FullCalendar } from "@/app/lib/definitions/def_event";
import styles from "@/app/page.module.css";
import { useActionState, useEffect } from "react";

type EventFormProps = {
	show: boolean;
	setShow: (show: boolean) => void;
	refetch: () => Promise<void>;
	event: Event_FullCalendar | null;
};

export default function UpdateEventForm({
	show,
	setShow,
	refetch,
	event
}: EventFormProps) {
	let event_id = "";

	if (event) {
		event_id = event.id;
	}
	// This is a custom hook that manages the state of the action
	// WTF IS TS MAN, IT PMO SMH FR FR
	const [state, action, pending] = useActionState(
		update_event.bind(null, event_id),
		undefined
	);

	// This function will be called when the event is created and calls the refetch function to update the events
	function handleEventUpdate() {
		if (state?.message && !state?.errors && !pending) {
			refetch();
			setShow(false);
		}
	}

	// This useEffect will refetch the events only when the state changes or the pending state changes
	useEffect(() => {
		// This is used to refetch the events when an event is created
		handleEventUpdate();
		// This comment is to avoid the exhaustive-deps warning from eslint
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [pending]);

	if (!show || !event) {
		return <div></div>;
	}

	// stateHandler_EventUpdate call removed to prevent re-renders

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
							defaultValue={event.title}
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
							defaultValue={event.extendedProps.place}
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
							defaultValue={event.extendedProps.description}
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
