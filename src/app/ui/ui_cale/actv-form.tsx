"use client";

import { create_activity } from "@/app/actions/cale_logic/activity_logic";
import { useActionState, useEffect, useRef, useState } from "react";

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
	// Action state (Zod validation returned via server action)
	const [state, action, pending] = useActionState(create_activity, undefined);

	// Ref to allow programmatic reset & focus handling
	const formRef = useRef<HTMLFormElement | null>(null);

	// Local UI state
	const [notif, setNotif] = useState(false); // show/hide notification block
	const [spec_day, setSpec_day] = useState(false); // show/hide specific day input
	const [errorVisible, setErrorVisible] = useState(false); // control error summary visibility

	// When notifications are disabled ensure specific day section is also hidden
	useEffect(() => {
		if (!notif && spec_day) {
			setSpec_day(false);
		}
	}, [notif, spec_day]);

	function resetStates() {
		setNotif(false);
		setSpec_day(false);
	}

	// This function will be called when the event is created and calls the refetch function
	// to update the events
	function handleSuccess() {
		if (state?.message && !state?.errors && !pending) {
			// Successful creation -> refetch, reset form + local state, hide errors & close
			refetch();
			resetStates();
			formRef.current?.reset();
			setErrorVisible(false);
			setShow(false);
		}
	}
	// This useEffect will refetch the events only when the state changes or the pending state changes
	useEffect(() => {
		handleSuccess();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [state, pending]);

	// Focus first invalid field when errors are present & show summary
	useEffect(() => {
		if (state?.errors && Object.keys(state.errors).length > 0) {
			const firstField = Object.keys(state.errors)[0];
			const el: HTMLElement | null =
				formRef.current?.querySelector(`[name="${firstField}"]`) ??
				null;
			el?.focus();
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
				style={{ maxWidth: 560 }}
			>
				<button
					type="button"
					className="btn-close position-absolute end-0 top-0 m-3"
					aria-label="Close"
					onClick={() => {
						resetStates();
						formRef.current?.reset();
						setErrorVisible(false);
						setShow(false);
					}}
				/>
				<h5 className="mb-4 fw-semibold text-primary">
					Crea nuova attività
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
								className="form-control"
							/>
							{errorVisible && state?.errors?.description && (
								<p className="text-danger small mt-1 mb-0">
									{state.errors.description}
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

						{/* EXPIRATION */}
						<div className="mb-3">
							<label
								htmlFor="expiration"
								className="form-label fw-medium"
							>
								Scadenza
							</label>
							<input
								type="date"
								id="expiration"
								name="expiration"
								required
								className="form-control"
							/>
							{errorVisible && state?.errors?.expiration && (
								<p className="text-danger small mt-1 mb-0">
									{state.errors.expiration}
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

						{/* NOTIFICATION BLOCK */}
						<div
							hidden={!notif}
							className="border rounded-3 p-3 mb-3 bg-light-subtle"
						>
							<div className="form-check mb-3">
								<input
									type="checkbox"
									id="reminder"
									name="reminder"
									defaultChecked={false}
									className="form-check-input"
								/>
								<label
									htmlFor="reminder"
									className="form-check-label"
								>
									Promemoria dopo la scadenza
								</label>
							</div>
							<div className="mb-3">
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
										if (e.target.value == "specifico") {
											setSpec_day(true);
										} else {
											setSpec_day(false);
										}
									}}
								>
									<option value="stesso">
										Giorno stesso
									</option>
									<option value="prima">Giorno prima</option>
									<option value="specifico">
										Giorno specifico
									</option>
								</select>
								{errorVisible &&
									state?.errors?.notificationtype && (
										<p className="text-danger small mt-1 mb-0">
											{state.errors.notificationtype}
										</p>
									)}
							</div>
							<div className="mb-3" hidden={!spec_day}>
								<label
									htmlFor="specificday"
									className="form-label fw-medium"
								>
									Giorno specifico
								</label>
								<input
									type="date"
									id="specificday"
									name="specificday"
									placeholder="Giorno specifico"
									className="form-control"
								/>
								{errorVisible && state?.errors?.specificday && (
									<p className="text-danger small mt-1 mb-0">
										{state.errors.specificday}
									</p>
								)}
							</div>
						</div>

						{/* SUBMIT */}
						<button
							className="btn btn-primary btn-lg w-100"
							disabled={pending}
							type="submit"
						>
							{pending
								? "Creazione in corso..."
								: "Crea Attività"}
						</button>
					</form>
				</div>
			</div>
		</div>
	);
}
