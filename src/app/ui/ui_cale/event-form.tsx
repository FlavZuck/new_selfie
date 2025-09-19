"use client";

import { create_event } from "@/app/actions/cale_logic/event_logic";
import styles from "@/app/page.module.css";
import { useActionState, useEffect, useState } from "react";
import RRuleForm from "./rrule-form";

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

	// We use this state to manage when to hide the recurrence section
	const [rec, setRec] = useState(false);

	// We use this state to manage when to hide the count and until inside rrule-form
	const [undef, setUndef] = useState(true);

	// We use this state to manage the weekdays input
	const [selectedDays, setSelectedDays] = useState<string[]>([]);

	// We use this state to manage when to hide the weekdays input
	const valori_frequenza = ["DAILY", "WEEKLY", "MONTHLY", "YEARLY"];
	const [Freqform, setFreqform] = useState(valori_frequenza[0]);

	// State to manage the visibility of the notification fields
	const [notif, setNotif] = useState(false);
	const [spec_delay, setSpec_delay] = useState(false);

	// This function will be to reset the useStates when the form is closed
	function resetStates() {
		setAllDay(false);
		setRec(false);
		setUndef(true);
		setFreqform(valori_frequenza[0]);
		setNotif(false);
		setSpec_delay(false);
	}

	// This function will be called when the event is created and calls the refetch function to update the events
	function handleEventCreation() {
		if (state?.message && !state?.errors && !pending) {
			refetch();
			setShow(false);
		}
	}

	// This useEffect will refetch the events only when the state changes or the pending state changes
	useEffect(() => {
		// This is a workaround to reset all the states when the form is closed
		resetStates();
		// This is used to refetch the events when an event is created
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

						{/*START DATE*/}
						<div className={styles.formGroup}>
							<label
								htmlFor="datestart"
								className={styles.formLabel}
							>
								Inizio
							</label>
							<input
								type="date"
								id="datestart"
								name="datestart"
								required
								className={styles.formInput}
							/>
						</div>
						{state?.errors?.datestart && (
							<p>{state.errors.datestart}</p>
						)}

						{/*ALL DAY*/}
						<div className={styles.formGroup}>
							<label
								htmlFor="allDay"
								className={styles.formLabel}
							>
								Tutto il giorno
							</label>
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
						<div
							className={styles.formGroup}
							hidden={!allDay || rec}
						>
							<label
								htmlFor="dateend"
								className={styles.formLabel}
							>
								Fine
							</label>
							<input
								type="date"
								id="dateend"
								name="dateend"
								className={styles.formInput}
							/>
						</div>
						{state?.errors?.dateend && (
							<p>{state.errors.dateend}</p>
						)}

						{/*TIMED EVENT SECTION*/}
						<div hidden={allDay}>
							<div className={styles.formGroup}>
								<label
									htmlFor="time"
									className={styles.formLabel}
								>
									Ora
								</label>
								<input
									type="time"
									id="time"
									name="time"
									className={styles.formInput}
								/>
								{state?.errors?.time && (
									<p>{state.errors.time}</p>
								)}
							</div>
							{/* ---------------------------------------------------*/}
							<div className={styles.formGroup}>
								<label
									htmlFor="duration"
									className={styles.formLabel}
								>
									Durata
								</label>
								<input
									type="number"
									id="duration"
									name="duration"
									defaultValue={0}
									min={0}
									max={24}
									step={0.5}
									className={styles.formInput}
								/>
								{state?.errors?.duration && (
									<p>{state.errors.duration}</p>
								)}
							</div>
						</div>

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
								required
								className={styles.formInput}
							/>
						</div>
						{state?.errors?.description && (
							<p>{state.errors.description}</p>
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
							{/*NOTIFICATION TIME*/}
							<div
								hidden={spec_delay}
								className={styles.formGroup}
							>
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
											setSpec_delay(true);
										} else {
											setSpec_delay(false);
										}
									}}
								>
									<option value="stesso">
										Giorno stesso
									</option>
									<option value="prima">Giorno prima</option>
									<option value="specifico">
										Anticipo specifico
									</option>
								</select>
							</div>
							{state?.errors?.notificationtype && (
								<p>{state.errors.notificationtype}</p>
							)}
							{/*SPECIFIC DELAY*/}
							<div
								hidden={!spec_delay}
								className={styles.formGroup}
							>
								<label
									htmlFor="specificdelay"
									className={styles.formLabel}
								>
									Con anticipo specifico
								</label>
								<input
									type="number"
									id="specificdelay"
									name="specificdelay"
									placeholder="Anticipo Specifico"
									defaultValue={0}
									min={0}
									max={168}
									step={1}
									className={styles.formInput}
								/>
								{state?.errors?.specificdelay && (
									<p>{state.errors.specificdelay}</p>
								)}
							</div>
						</div>

						{/*SHOW REC*/}
						<div className={styles.formGroup}>
							<label
								htmlFor="recurrence"
								className={styles.formLabel}
							>
								Opzioni Ricorrenza
							</label>
							<input
								type="checkbox"
								id="recurrence"
								name="recurrence"
								defaultChecked={false}
								onChange={(e) => {
									setRec(e.target.checked);
								}}
							/>
						</div>

						<div hidden={!rec}>
							{/*RRULE*/}
							<RRuleForm
								Freqform={Freqform}
								setFreqform={setFreqform}
								undef={undef}
								setUndef={setUndef}
								WeeklyHandlerProps={{
									selectedDays,
									setSelectedDays
								}}
							/>
						</div>

						{/*SUBMIT BUTTON*/}
						<button
							className={styles.submitButton}
							disabled={pending}
							type="submit"
							onClick={() => {
								resetStates();
							}}
						>
							{pending ? "Creazione in corso..." : "Crea Evento"}
						</button>
					</form>
				</div>
			</div>
		</div>
	);
}
