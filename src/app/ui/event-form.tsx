"use client";

import { create_event } from "@/app/actions/event_logic";
import styles from "@/app/page.module.css";
import { useActionState, useEffect, useState } from "react";

type EventFormProps = {
	show: boolean;
	setShow: (show: boolean) => void;
	refetch: () => Promise<void>;
};

export default function EventForm({ show, setShow, refetch }: EventFormProps) {
	// This is a custom hook that manages the state of the action
	const [state, action, pending] = useActionState(create_event, undefined);

	// We use this state to manage when to hide the time input
	const [allDay, setAllDay] = useState(false);

	// This useEffect will refetch the events only when an event is successfully created
	useEffect(() => {
		if (state?.message && !state?.errors && !pending) {
			refetch();
			setShow(false);
		}
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
				<form action={action}>
					<div>
						<label htmlFor="title">Title </label>
						<input
							id="title"
							name="title"
							placeholder="Title"
							required
						/>
					</div>
					{state?.errors?.title && <p>{state.errors.title}</p>}

					<div>
						<label htmlFor="datestart">Date </label>
						<input
							type="date"
							id="datestart"
							name="datestart"
							required
						/>
					</div>
					{state?.errors?.datestart && (
						<p>{state.errors.datestart}</p>
					)}

					<div>
						<label htmlFor="allDay">All Day </label>
						<input
							type="checkbox"
							id="allDay"
							name="allDay"
							defaultChecked={false}
							onChange={(e) => {
								setAllDay(e.target.checked);
							}}
						/>
					</div>

					<div hidden={allDay}>
						<label htmlFor="timestart">Time </label>
						<input type="time" id="timestart" name="timestart" />
					</div>
					{state?.errors?.time && <p>{state.errors.time}</p>}

					<div>
						<label htmlFor="description">Description </label>
						<input
							id="description"
							name="description"
							placeholder="Description"
							required
						/>
					</div>
					{state?.errors?.description && (
						<p>{state.errors.description}</p>
					)}

					<button
						className={styles.button}
						disabled={pending}
						type="submit"
						onClick={() => {
							// This is a workaround to reset the allDay state
							setAllDay(false);
						}}
					>
						{pending ? "Creating event..." : "Create Event"}
					</button>
				</form>
			</div>
		</div>
	);
}
