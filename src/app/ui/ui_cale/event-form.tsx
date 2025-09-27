"use client";

import { create_event } from "@/app/actions/cale_logic/event_logic";
import { useActionState, useEffect, useRef, useState } from "react";
import RRuleForm from "./rrule-form";

type EventFormProps = {
	show: boolean;
	setShow: (show: boolean) => void;
	refetch: () => Promise<void>;
};

export default function EventForm({ show, setShow, refetch }: EventFormProps) {
	// Action state (Zod validation returned via server action)
	const [state, action, pending] = useActionState(create_event, undefined);

	// Refs
	const formRef = useRef<HTMLFormElement | null>(null);

	// Local UI state (kept until successful submission or manual close)
	const [allDay, setAllDay] = useState(false); // hide/show time inputs
	const [rec, setRec] = useState(false); // recurrence section toggle
	const [undef, setUndef] = useState(true); // rrule count/until toggle
	const [selectedDays, setSelectedDays] = useState<string[]>([]); // weekly selection
	const valori_frequenza = ["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]; // frequency options
	const [Freqform, setFreqform] = useState(valori_frequenza[0]);
	const [notif, setNotif] = useState(false); // notification toggle
	const [spec_delay, setSpec_delay] = useState(false); // specific delay toggle
	// Control visibility of validation errors so they disappear after closing the modal
	const [errorVisible, setErrorVisible] = useState(false);

	// This function will be to reset the useStates when the form is closed
	function resetStates() {
		setAllDay(false);
		setRec(false);
		setUndef(true);
		setFreqform(valori_frequenza[0]);
		setNotif(false);
		setSpec_delay(false);
		setSelectedDays([]);
	}

	// This function will be called when the event is created and calls the refetch function to update the events
	function handleSuccess() {
		if (state?.message && !state?.errors && !pending) {
			// Successful creation -> refetch, reset, close and clear errors
			refetch();
			resetStates();
			formRef.current?.reset();
			setErrorVisible(false);
			setShow(false);
		}
	}

	// This useEffect will refetch the events only when the state changes or the pending state changes
	// On successful submission only
	useEffect(() => {
		handleSuccess();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [state, pending]);

	// Focus first invalid field when errors are present
	useEffect(() => {
		if (state?.errors && Object.keys(state.errors).length > 0) {
			const firstField = Object.keys(state.errors)[0];
			const el: HTMLElement | null =
				formRef.current?.querySelector(`[name="${firstField}"]`) ??
				null;
			el?.focus();
		}
	}, [state?.errors]);

	// Quando la submission ritorna con errori può capitare (in certe condizioni di rimontaggio del componente)
	// che gli input checkbox vengano visualmente resettati (unchecked) mentre lo state React resta quello precedente,
	// lasciando visibili le sezioni condizionali. Questo effetto forza il riallineamento degli state ai valori
	// effettivi presenti nel DOM dopo l'esito con errori, così l'interfaccia torna coerente.
	useEffect(() => {
		if (state?.errors && formRef.current) {
			const getChecked = (id: string) =>
				formRef.current?.querySelector<HTMLInputElement>(`#${id}`)
					?.checked ?? false;
			const allDayDom = getChecked("allDay");
			const recDom = getChecked("recurrence");
			const notifDom = getChecked("notification");
			const undefDom = getChecked("undef");
			// Aggiorna gli state solo se diverso (evita re-render inutili)
			setAllDay((prev) => (prev !== allDayDom ? allDayDom : prev));
			setRec((prev) => (prev !== recDom ? recDom : prev));
			setNotif((prev) => (prev !== notifDom ? notifDom : prev));
			setUndef((prev) => (prev !== undefDom ? undefDom : prev));
			// Se la notifica è stata deselezionata azzera anche il flag dello specific delay
			if (!notifDom) setSpec_delay(false);
		}
	}, [state?.errors]);

	// Very inelegant way to keep the form closed (lol)
	if (!show) {
		return <></>;
	}

	return (
		<div
			className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex align-items-start justify-content-center py-4 overflow-auto"
			style={{ zIndex: 1050 }}
		>
			<div
				className="bg-white rounded-4 shadow-lg p-4 w-100 position-relative"
				style={{ maxWidth: 640 }}
			>
				<button
					type="button"
					className="btn-close position-absolute end-0 top-0 m-3"
					aria-label="Close"
					onClick={() => {
						resetStates();
						formRef.current?.reset();
						setErrorVisible(false); // hide any previous errors on close
						setShow(false);
					}}
				/>
				<h5 className="mb-4 fw-semibold text-primary">
					Crea nuovo evento
				</h5>
				<div
					style={{
						overflowY: "auto",
						maxHeight: "calc(90vh - 7rem)"
					}}
				>
					<form
						action={action}
						ref={formRef}
						className="needs-validation"
						noValidate
						onSubmit={() => setErrorVisible(true)}
					>
						{/* ERROR SUMMARY */}
						{errorVisible && state?.errors && (
							<div className="alert alert-danger" role="alert">
								<p className="fw-semibold mb-2">
									Correggi i seguenti errori:
								</p>
								<ul className="mb-0 small">
									{Object.entries(state.errors).map(
										([field, msg]) => (
											<li key={field}>
												<strong>{field}</strong>: {msg}
											</li>
										)
									)}
								</ul>
							</div>
						)}
						{/* TITLE */}
						<div className="mb-3">
							<label
								htmlFor="title"
								className="form-label fw-medium"
							>
								Titolo
							</label>
							<input
								id="title"
								name="title"
								placeholder="Titolo"
								required
								className="form-control"
							/>
							{errorVisible && state?.errors?.title && (
								<p className="text-danger small mt-1 mb-0">
									{state.errors.title}
								</p>
							)}
						</div>

						{/* PLACE */}
						<div className="mb-3">
							<label
								htmlFor="place"
								className="form-label fw-medium"
							>
								Luogo
							</label>
							<input
								id="place"
								name="place"
								placeholder="Luogo"
								className="form-control"
							/>
							{errorVisible && state?.errors?.place && (
								<p className="text-danger small mt-1 mb-0">
									{state.errors.place}
								</p>
							)}
						</div>

						{/* START DATE */}
						<div className="mb-3">
							<label
								htmlFor="datestart"
								className="form-label fw-medium"
							>
								Inizio
							</label>
							<input
								type="date"
								id="datestart"
								name="datestart"
								required
								className="form-control"
							/>
							{errorVisible && state?.errors?.datestart && (
								<p className="text-danger small mt-1 mb-0">
									{state.errors.datestart}
								</p>
							)}
						</div>

						{/* ALL DAY */}
						<div className="form-check form-switch mb-3">
							<input
								type="checkbox"
								id="allDay"
								name="allDay"
								checked={allDay}
								className="form-check-input"
								onChange={(e) => setAllDay(e.target.checked)}
							/>
							<label
								className="form-check-label"
								htmlFor="allDay"
							>
								Tutto il giorno
							</label>
						</div>

						{/* END DATE (only allDay single/multi-day, not recurring) */}
						<div className="mb-3" hidden={!allDay || rec}>
							<label
								htmlFor="dateend"
								className="form-label fw-medium"
							>
								Fine
							</label>
							<input
								type="date"
								id="dateend"
								name="dateend"
								className="form-control"
							/>
							{errorVisible && state?.errors?.dateend && (
								<p className="text-danger small mt-1 mb-0">
									{state.errors.dateend}
								</p>
							)}
						</div>

						{/* TIMED EVENT SECTION */}
						<div hidden={allDay}>
							<div className="row g-3">
								<div className="col-sm-6">
									<label
										htmlFor="time"
										className="form-label fw-medium"
									>
										Ora
									</label>
									<input
										type="time"
										id="time"
										name="time"
										className="form-control"
									/>
									{errorVisible && state?.errors?.time && (
										<p className="text-danger small mt-1 mb-0">
											{state.errors.time}
										</p>
									)}
								</div>
								<div className="col-sm-6">
									<label
										htmlFor="duration"
										className="form-label fw-medium"
									>
										Durata (h)
									</label>
									<input
										type="number"
										id="duration"
										name="duration"
										defaultValue={0}
										min={0}
										max={24}
										step={0.5}
										className="form-control"
									/>
									{errorVisible &&
										state?.errors?.duration && (
											<p className="text-danger small mt-1 mb-0">
												{state.errors.duration}
											</p>
										)}
								</div>
							</div>
						</div>

						{/* DESCRIPTION */}
						<div className="mb-3">
							<label
								htmlFor="description"
								className="form-label fw-medium"
							>
								Descrizione
							</label>
							<input
								id="description"
								name="description"
								placeholder="Descrizione"
								required
								className="form-control"
							/>
							{errorVisible && state?.errors?.description && (
								<p className="text-danger small mt-1 mb-0">
									{state.errors.description}
								</p>
							)}
						</div>

						{/* NOTIFICATION TOGGLE */}
						<div className="form-check form-switch mb-3">
							<input
								type="checkbox"
								id="notification"
								name="notification"
								checked={notif}
								className="form-check-input"
								onChange={(e) => setNotif(e.target.checked)}
							/>
							<label
								className="form-check-label"
								htmlFor="notification"
							>
								Notifiche
							</label>
							{errorVisible && state?.errors?.notification && (
								<p className="text-danger small mt-1 mb-0">
									{state.errors.notification}
								</p>
							)}
						</div>

						{/* NOTIFICATION OPTIONS */}
						<div
							hidden={!notif}
							className="border rounded-3 p-3 mb-3 bg-light-subtle"
						>
							<div className="mb-3" hidden={spec_delay}>
								<label
									htmlFor="notificationtime"
									className="form-label fw-medium"
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
									className="form-control"
								/>
								{errorVisible &&
									state?.errors?.notificationtime && (
										<p className="text-danger small mt-1 mb-0">
											{state.errors.notificationtime}
										</p>
									)}
							</div>
							<div className="mb-3">
								<label
									htmlFor="notificationtype"
									className="form-label fw-medium"
								>
									Tipo notifica
								</label>
								<select
									id="notificationtype"
									name="notificationtype"
									className="form-select"
									onChange={(e) => {
										if (e.target.value === "specifico") {
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
								{errorVisible &&
									state?.errors?.notificationtype && (
										<p className="text-danger small mt-1 mb-0">
											{state.errors.notificationtype}
										</p>
									)}
							</div>
							<div className="mb-3" hidden={!spec_delay}>
								<label
									htmlFor="specificdelay"
									className="form-label fw-medium"
								>
									Con anticipo specifico (ore)
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
									className="form-control"
								/>
								{errorVisible &&
									state?.errors?.specificdelay && (
										<p className="text-danger small mt-1 mb-0">
											{state.errors.specificdelay}
										</p>
									)}
							</div>
						</div>

						{/* RECURRENCE TOGGLE */}
						<div className="form-check form-switch mb-3">
							<input
								type="checkbox"
								id="recurrence"
								name="recurrence"
								checked={rec}
								className="form-check-input"
								onChange={(e) => setRec(e.target.checked)}
							/>
							<label
								className="form-check-label"
								htmlFor="recurrence"
							>
								Opzioni Ricorrenza
							</label>
						</div>

						<div
							hidden={!rec}
							className="mb-3 border rounded-3 p-3 bg-body-tertiary"
						>
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

						{/* SUBMIT BUTTON */}
						<button
							className="btn btn-primary btn-lg w-100 mt-2"
							disabled={pending}
							type="submit"
						>
							{pending ? "Creazione in corso..." : "Crea Evento"}
						</button>
					</form>
				</div>
			</div>
		</div>
	);
}
