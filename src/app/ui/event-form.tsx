"use client";

import { create_event } from "@/app/actions/event_logic";
import styles from "@/app/page.module.css";
import { useActionState } from "react";
import { useEffect } from "react";

type EventFormProps = {
	show: boolean;
	setShow: (show: boolean) => void;
	refetch: () => Promise<void>;
};

export default function EventForm({ show, setShow, refetch }: EventFormProps) {
	const [state, action, pending] = useActionState(create_event, undefined);

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
						<label htmlFor="timestart">Time </label>
						<input type="time" id="timestart" name="timestart" />
					</div>
					{state?.errors?.timestart && (
						<p>{state.errors.timestart}</p>
					)}

					<div>
						<label htmlFor="description">Description </label>
						<input
							id="description"
							name="description"
							placeholder="Description"
						/>
					</div>
					{state?.errors?.description && (
						<p>{state.errors.description}</p>
					)}

					<button
						className={styles.button}
						disabled={pending}
						type="submit"
					>
						{pending ? "Creating event..." : "Create Event"}
					</button>
				</form>
			</div>
		</div>
	);
}
