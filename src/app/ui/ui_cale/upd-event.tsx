"use client";

import { update_event } from "@/app/actions/cale_logic/event_logic";
import { Event_FullCalendar } from "@/app/lib/definitions/def_event";
import styles from "@/app/page.module.css";
import { useActionState, useEffect, useState } from "react";
import RRuleForm from "./rrule-form";

function stateHandler_EventUpdate(
	event: Event_FullCalendar,
	setAllDay: (value: boolean) => void,
	setRec: (value: boolean) => void,
	setUndef: (value: boolean) => void,
	setFreqform: (value: string) => void,
	setSelectedDays: (value: string[]) => void
) {
	// Gestiamo l' allDay (autoesplicativo)
	if (event.allDay == "on") {
		setAllDay(true);
	} else {
		setAllDay(false);
	}

	// Controlliamo se l'evento possiede una rrule
	if (event.rrule) {
		// La settiamo on
		setRec(true);

		// Controlliamo se l'evento è indefinito
		if (event.rrule?.count || event.rrule?.until) {
			setUndef(false);
		} else {
			setUndef(true);
		}
		//
		// Controlliamo quale tipo di frequenza ha l'evento
		if (event.rrule?.freq == "DAILY") {
			setFreqform("DAILY");
		} else if (event.rrule?.freq == "WEEKLY") {
			setFreqform("WEEKLY");
		} else if (event.rrule?.freq == "MONTHLY") {
			setFreqform("MONTHLY");
		} else if (event.rrule?.freq == "YEARLY") {
			setFreqform("YEARLY");
		}

		// Settiamo i possibili giorni della settimana
		// DA TESTARE PER BENE, MOLTO PROBABILMENTE NON FUNZIONA
		if (event.rrule?.byweekday) {
			// Se l'evento è settimanale, settiamo i giorni della settimana
			if (event.rrule?.freq == "WEEKLY") {
				setSelectedDays(event.rrule.byweekday);
			} else {
				// Se l'evento non è settimanale, settiamo i giorni della settimana a vuoto
				setSelectedDays([]);
			}
		}
	} else {
		// La settiamo off
		setRec(false);
	}
}

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

	// This function will be to reset the useStates when the form is closed
	function resetStates() {
		setAllDay(false);
		setRec(false);
		setUndef(true);
		setFreqform(valori_frequenza[0]);
	}

	// This function will be called when the event is created and calls the refetch function to update the events
	function handleEventUpdate() {
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
		handleEventUpdate();
		// This comment is to avoid the exhaustive-deps warning from eslint
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [pending]);

	if (!show || !event) {
		return <div></div>;
	}

	// Prima di far iniziare il form, settiamo i valori di default in base all'evento passato
	stateHandler_EventUpdate(
		event,
		setAllDay,
		setRec,
		setUndef,
		setFreqform,
		setSelectedDays
	);

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

					{/*START DATE*/}
					<div>
						<label htmlFor="datestart">Inizio </label>
						<input
							type="date"
							id="datestart"
							name="datestart"
							defaultValue={event.start.toDateString()}
							required
						/>
					</div>
					{state?.errors?.datestart && (
						<p>{state.errors.datestart}</p>
					)}

					{/*ALL DAY*/}
					<div>
						<label htmlFor="allDay">Tutto il giorno </label>
						<input
							type="checkbox"
							id="allDay"
							name="allDay"
							defaultChecked={allDay}
							onChange={(e) => {
								setAllDay(e.target.checked);
							}}
						/>
					</div>

					{/*END DATE*/}
					<div hidden={!allDay || rec}>
						<label htmlFor="dateend">Fine </label>
						<input
							type="date"
							id="dateend"
							name="dateend"
							defaultValue={event.end?.toDateString()}
						/>
					</div>
					{state?.errors?.dateend && <p>{state.errors.dateend}</p>}

					{/*TIME AND DURATION*/}
					<div hidden={allDay}>
						<div>
							<label htmlFor="time">Ora </label>
							<input type="time" id="time" name="time" />
							{state?.errors?.time && <p>{state.errors.time}</p>}
						</div>
						{/* ---------------------------------------------------*/}
						<div>
							<label htmlFor="duration">Durata </label>
							<input
								type="number"
								id="duration"
								name="duration"
								defaultValue={event.extendedProps.duration}
								min={0}
								max={24}
								step={0.5}
							/>
							{state?.errors?.duration && (
								<p>{state.errors.duration}</p>
							)}
						</div>
					</div>

					{/*DESCRIPTION*/}
					<div>
						<label htmlFor="description">Descrizione </label>
						<input
							id="description"
							name="description"
							placeholder="Descrizione"
							required
						/>
					</div>
					{state?.errors?.description && (
						<p>{state.errors.description}</p>
					)}

					{/*SHOW REC*/}
					<div>
						<label htmlFor="allDay">Opzioni Ricorrenza </label>
						<input
							type="checkbox"
							id="recurrence"
							name="recurrence"
							defaultChecked={rec}
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
							freqHandlerProps={{ selectedDays, setSelectedDays }}
						/>
					</div>

					{/*SUBMIT BUTTON*/}
					<button
						className={styles.button}
						disabled={pending}
						type="submit"
						onClick={() => {
							resetStates();
						}}
					>
						{pending ? "Updating event..." : "Update Event"}
					</button>
				</form>
			</div>
		</div>
	);
}
