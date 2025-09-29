"use client";

import {
	createPomoEvent,
	getStudyDebt
} from "@/app/actions/pomo_logic/pomoback_logic";
import { useActionState, useEffect, useRef, useState } from "react";

export default function PomoEventForm() {
	const initialState = undefined;
	const [state, action, pending] = useActionState(
		createPomoEvent,
		initialState
	);
	const [isOpen, setIsOpen] = useState(false);
	const formRef = useRef<HTMLFormElement>(null);
	const [errorVisible, setErrorVisible] = useState(false);
	const [currentDebt, setCurrentDebt] = useState<number | null>(null);

	// Funzione per recuperare il debito di studio attuale
	useEffect(() => {
		const fetchCurrentDebt = async () => {
			const debt = await getStudyDebt();
			setCurrentDebt(debt);
		};
		fetchCurrentDebt();
	}, []);

	// Listener per aggiornamenti del debito da altri componenti (es. PomodoroTimer)
	useEffect(() => {
		function handleDebtUpdated() {
			getStudyDebt().then((d) => setCurrentDebt(d));
		}
		window.addEventListener("studyDebt:updated", handleDebtUpdated);
		return () => {
			window.removeEventListener("studyDebt:updated", handleDebtUpdated);
		};
	}, []);

	// Reset del form quando l'operazione ha successo e non ci sono errors
	useEffect(() => {
		if (
			!pending &&
			state &&
			state.message === "PomoEvento creato con successo" &&
			!state.errors
		) {
			formRef.current?.reset();
			setErrorVisible(false);
			setIsOpen(false);
		}
	}, [state, pending]);

	// Calcolo variante badge debito
	const debtBadgeVariant =
		currentDebt === null
			? "secondary"
			: currentDebt <= 3
				? "success"
				: currentDebt <= 6
					? "warning"
					: "danger";

	return (
		<section className="container py-4 py-md-5">
			<div className="card shadow-sm border-0 overflow-hidden">
				<div className="card-header bg-white border-0 pb-0">
					<div className="d-flex flex-column flex-md-row align-items-md-center justify-content-md-between gap-3">
						<div>
							<h5 className="mb-1 d-flex align-items-center fw-semibold">
								<i className="bi bi-clock-history text-primary me-2"></i>
								PomoEventi
							</h5>
							<p className="text-body-secondary mb-0 small">
								Pianifica cicli di studio e monitora il tuo
								debito.
							</p>
						</div>
						<div className="d-flex align-items-center gap-2">
							{currentDebt !== null && (
								<span
									className={`badge bg-${debtBadgeVariant} rounded-pill d-flex align-items-center gap-1 py-2 px-3 fs-6`}
								>
									<i className="bi bi-lightning-charge"></i>
									<span>
										Debito: {currentDebt}{" "}
										{currentDebt === 1 ? "ciclo" : "cicli"}
									</span>
								</span>
							)}
							<button
								type="button"
								className={`btn btn-sm ${isOpen ? "btn-outline-secondary" : "btn-primary"} d-inline-flex align-items-center gap-2`}
								aria-expanded={isOpen}
								aria-controls="pomoEventForm"
								onClick={() => setIsOpen((p) => !p)}
							>
								<i
									className={`bi ${isOpen ? "bi-dash-circle" : "bi-plus-circle"}`}
								></i>
								{isOpen ? "Chiudi" : "Nuovo PomoEvento"}
							</button>
						</div>
					</div>
					<hr className="mt-3 mb-0" />
				</div>

				<div
					className={`collapse px-3 px-md-4 pb-4 pt-3 fade ${isOpen ? "show" : ""}`}
					id="pomoEventForm"
				>
					{currentDebt !== null && currentDebt > 0 && (
						<div className="alert alert-warning d-flex align-items-start gap-2 py-2 px-3 small mb-4 shadow-sm border-0">
							<i className="bi bi-exclamation-triangle-fill fs-5"></i>
							<div>
								<strong>Attenzione!</strong> Hai un debito di
								studio di {currentDebt}{" "}
								{currentDebt === 1 ? "ciclo" : "cicli"}.
								Completa i cicli per ridurlo.
							</div>
						</div>
					)}
					<form
						action={action}
						ref={formRef}
						className="needs-validation"
						noValidate
						onSubmit={() => setErrorVisible(true)}
					>
						<div className="row g-4">
							{/* TITLE */}
							<div className="col-12">
								<label
									htmlFor="title"
									className="form-label fw-medium"
								>
									<i className="bi bi-bookmark me-2 text-primary"></i>
									Titolo
								</label>
								<div className="input-group input-group-lg has-validation">
									<span className="input-group-text bg-primary-subtle text-primary border-primary-subtle">
										<i className="bi bi-type"></i>
									</span>
									<input
										id="title"
										name="title"
										placeholder="Titolo del tuo PomoEvento"
										required
										className={`form-control ${errorVisible && state?.errors?.title ? "is-invalid" : ""}`}
									/>
									{errorVisible && state?.errors?.title && (
										<div className="invalid-feedback">
											{state.errors.title[0]}
										</div>
									)}
								</div>
							</div>

							{/* DEBT CYCLES */}
							<div className="col-md-6">
								<label
									htmlFor="debtCycles"
									className="form-label fw-medium"
								>
									<i className="bi bi-repeat me-2 text-primary"></i>
									Cicli di Programmazione
								</label>
								<div className="input-group input-group-lg has-validation">
									<span className="input-group-text bg-primary-subtle text-primary border-primary-subtle">
										<i className="bi bi-hash"></i>
									</span>
									<input
										id="debtCycles"
										name="debtCycles"
										type="number"
										min="1"
										placeholder="Numero di cicli"
										required
										className={`form-control ${errorVisible && state?.errors?.debtCycles ? "is-invalid" : ""}`}
									/>
									<span className="input-group-text">
										cicli
									</span>
									{errorVisible &&
										state?.errors?.debtCycles && (
											<div className="invalid-feedback">
												{state.errors.debtCycles[0]}
											</div>
										)}
								</div>
							</div>

							{/* DATE START */}
							<div className="col-md-6">
								<label
									htmlFor="datestart"
									className="form-label fw-medium"
								>
									<i className="bi bi-calendar me-2 text-primary"></i>
									Data di Inizio
								</label>
								<div className="input-group input-group-lg has-validation">
									<span className="input-group-text bg-primary-subtle text-primary border-primary-subtle">
										<i className="bi bi-calendar-event"></i>
									</span>
									<input
										id="datestart"
										name="datestart"
										type="date"
										required
										className={`form-control ${errorVisible && state?.errors?.datestart ? "is-invalid" : ""}`}
									/>
									{errorVisible &&
										state?.errors?.datestart && (
											<div className="invalid-feedback">
												{state.errors.datestart[0]}
											</div>
										)}
								</div>
							</div>

							{/* SUBMIT */}
							<div className="col-12">
								<div className="d-grid d-sm-flex justify-content-sm-end gap-2">
									<button
										className="btn btn-primary btn-lg px-4 shadow-sm"
										disabled={pending}
										type="submit"
									>
										{pending ? (
											<>
												<span
													className="spinner-border spinner-border-sm me-2"
													role="status"
													aria-hidden="true"
												></span>
												Creazione...
											</>
										) : (
											<>
												<i className="bi bi-check2-circle me-2"></i>
												Crea PomoEvento
											</>
										)}
									</button>
								</div>
							</div>
						</div>

						{state?.message && (
							<div
								className={`alert ${state.errors ? "alert-danger" : "alert-success"} mt-4 mb-0 d-flex align-items-center gap-2 shadow-sm`}
							>
								<i
									className={`bi ${state.errors ? "bi-exclamation-triangle-fill" : "bi-check-circle-fill"}`}
								></i>
								<span>{state.message}</span>
							</div>
						)}
					</form>
				</div>
			</div>
		</section>
	);
}
