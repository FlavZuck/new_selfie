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

	// This function will be called when the event is created and calls the refetch function to update the events
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
				<form action={action}>
					{/*TITLE*/}
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

					{/*PLACE*/}
					<div>
						<label htmlFor="place">Place </label>
						<input id="place" name="place" placeholder="Place" />
					</div>
					{state?.errors?.place && <p>{state.errors.place}</p>}

					{/*START DATE*/}
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

					{/*ALL DAY*/}
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

					{/*END DATE*/}
					<div hidden={!allDay}>
						<label htmlFor="dateend">End Date </label>
						<input type="date" id="dateend" name="dateend" />
					</div>
					{state?.errors?.dateend && <p>{state.errors.dateend}</p>}

					{/*TIME AND DURATION*/}
					<div hidden={allDay}>
						<div>
							<label htmlFor="time">Time </label>
							<input type="time" id="time" name="time" />
							{state?.errors?.time && <p>{state.errors.time}</p>}
						</div>
						{/* ---------------------------------------------------*/}
						<div>
							<label htmlFor="duration">Duration </label>
							<input type="time" id="duration" name="duration" />
							{state?.errors?.duration && (
								<p>{state.errors.duration}</p>
							)}
						</div>
					</div>

					{/*DESCRIPTION*/}
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

					{/*SUBMIT BUTTON*/}
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
