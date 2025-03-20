"use client";

import { createEvent } from "@/app/actions/event_logic";
import styles from "@/app/page.module.css";
import { useActionState } from "react";

export default function EventForm() {
	const [state, action, pending] = useActionState(createEvent, undefined);

	return (
		<form action={action}>
			<div>
				<label htmlFor="date">Date </label>
				<input type="date" id="date" name="date" />
			</div>
			{state?.errors?.date && <p>{state.errors.date}</p>}

			<div>
				<label htmlFor="time">Time </label>
				<input type="time" id="time" name="time" />
			</div>
			{state?.errors?.time && <p>{state.errors.time}</p>}

			<div>
				<label htmlFor="description">Description </label>
				<input
					id="description"
					name="description"
					placeholder="Description"
				/>
			</div>
			{state?.errors?.description && <p>{state.errors.description}</p>}

			<button className={styles.button} disabled={pending} type="submit">
				{pending ? "Creating event..." : "Create Event"}
			</button>
		</form>
	);
}
