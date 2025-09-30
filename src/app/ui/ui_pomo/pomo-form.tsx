"use client";

import {
	getPomodoro,
	notifyPomodoro,
	payStudyDebt,
	savePomodoro
} from "@/app/actions/pomo_logic/pomoback_logic";
import {
	calculateProposals,
	displayTime,
	formatHHMMSS,
	inSeconds
} from "@/app/actions/pomo_logic/pomofront_logic";
import {
	FINE,
	INIZIO,
	PAUSA,
	PomodoroProposal,
	PomodoroSchema,
	STUDIO
} from "@/app/lib/definitions/def_pomo";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";

export default function PomodoroTimer() {
	// Default config (duh)
	const defaultConfig = {
		studyMin: "00:30:00",
		pauseMin: "00:05:00",
		savedCycles: 5
	};

	// Stato per il pomoevento
	const [pomoEventMode, setPomoEventMode] = useState(false);
	// Ref per evitare cambio dimensione dependency array nell'useEffect principale
	const pomoEventModeRef = useRef(pomoEventMode);
	useEffect(() => {
		pomoEventModeRef.current = pomoEventMode;
	}, [pomoEventMode]);

	// Stati del ciclo di input
	const [studyTime, setStudyTime] = useState(defaultConfig.studyMin);
	const [pauseTime, setPauseTime] = useState(defaultConfig.pauseMin);
	const [cycles, setCycles] = useState(defaultConfig.savedCycles);

	// Ref per ricordare i tempi personalizzati quando si entra in Modalità PomoEvento
	const previousTimesRef = useRef<{ study: string; pause: string } | null>(
		null
	);
	useEffect(() => {
		// Quando attivo la modalità PomoEvento forzo i tempi standard 30/5
		if (pomoEventMode) {
			previousTimesRef.current = { study: studyTime, pause: pauseTime };
			setStudyTime("00:30:00");
			setPauseTime("00:05:00");
		} else {
			// Al ritorno alla modalità normale ripristino i tempi precedenti (se presenti)
			if (previousTimesRef.current) {
				setStudyTime(previousTimesRef.current.study);
				setPauseTime(previousTimesRef.current.pause);
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [pomoEventMode]);

	// Stati del ciclo di animazione
	const [secondsLeft, setSecondsLeft] = useState(0);
	const [isPlaying, setIsPlaying] = useState(false);
	const [isStudyPhase, setIsStudyPhase] = useState(true);
	const [currentCycle, setCurrentCycle] = useState(1);
	const [animationClass, setAnimationClass] = useState("");

	// Stati per le opzioni
	const [availableTime, setAvailableTime] = useState("");
	const [proposals, setProposals] = useState<PomodoroProposal[]>([]);
	const [showProposals, setShowProposals] = useState(false);
	const [timeUnit, setTimeUnit] = useState<"minutes" | "hours">("minutes");

	// Carica la config salvata nel DB
	useEffect(() => {
		async function loadConfig() {
			const config = await getPomodoro();
			if (config) {
				const { studyMin, pauseMin, savedCycles } = config.timerConfig;
				setStudyTime(studyMin);
				setPauseTime(pauseMin);
				setCycles(savedCycles);
			}
		}
		loadConfig();
	}, []);

	// Funzioni di notifica
	const notifyStart = async () => {
		await notifyPomodoro(INIZIO);
	};
	const notifyStudy = async () => {
		await notifyPomodoro(STUDIO);
	};
	const notifyPause = async () => {
		await notifyPomodoro(PAUSA);
	};
	const notifyEnd = async () => {
		await notifyPomodoro(FINE);
	};

	// Funzioni di controllo del timer
	const Start = async () => {
		// Se siamo in modalità PomoEvento non permettiamo di ri-avviare se già in play
		if (pomoEventMode && isPlaying) return;
		setIsPlaying(true);
		setSecondsLeft(inSeconds(studyTime));
		setIsStudyPhase(true);
		setCurrentCycle(1);
		studyAnimation(inSeconds(studyTime));
		await notifyStart();
	};
	const Clear = () => {
		if (pomoEventMode && isPlaying) return; // Non permettere clear durante PomoEvento
		setStudyTime(defaultConfig.studyMin);
		setPauseTime(defaultConfig.pauseMin);
		setCycles(defaultConfig.savedCycles);
		setIsPlaying(false);
		setSecondsLeft(0);
		setIsStudyPhase(true);
		setCurrentCycle(1);
		setAnimationClass("");
	};
	const restartCycle = () => {
		if (pomoEventMode) return; // Bloccato in modalità PomoEvento
		setIsStudyPhase(true);
		setSecondsLeft(inSeconds(studyTime));
		setAnimationClass("");
		setTimeout(() => {
			studyAnimation(inSeconds(studyTime));
		}, 20);
		setIsPlaying(true);
	};
	const endCycle = () => {
		if (pomoEventMode) return; // Bloccato in modalità PomoEvento
		if (currentCycle < cycles) {
			setCurrentCycle(currentCycle + 1);
			restartCycle();
		} else {
			setIsPlaying(false);
			setSecondsLeft(0);
			setAnimationClass("");
		}
	};
	const Skip = () => {
		if (pomoEventMode) return; // Bloccato in modalità PomoEvento
		if (isStudyPhase) {
			setIsStudyPhase(false);
			setSecondsLeft(inSeconds(pauseTime));
			pauseAnimation(inSeconds(pauseTime));
		} else {
			if (currentCycle < cycles) {
				setIsStudyPhase(true);
				setCurrentCycle(currentCycle + 1);
				setSecondsLeft(inSeconds(studyTime));
				studyAnimation(inSeconds(studyTime));
			} else {
				setIsPlaying(false);
				setSecondsLeft(0);
				setAnimationClass("");
			}
		}
	};

	// Funzione di submit del form
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const validation = await PomodoroSchema.safeParseAsync({
			studyMin: studyTime,
			pauseMin: pauseTime,
			savedCycles: cycles
		});
		if (!validation.success) {
			console.error(
				"Validation failed:",
				validation.error.flatten().fieldErrors
			);
			return {
				errors: validation.error.flatten().fieldErrors
			};
		}
		await savePomodoro(studyTime, pauseTime, cycles);
		setShowProposals(false);
		setAvailableTime("");
		await Start();
	};

	// Funzione di reset del form
	const handleClear = async () => {
		Clear();
		await savePomodoro(
			defaultConfig.studyMin,
			defaultConfig.pauseMin,
			defaultConfig.savedCycles
		);
	};

	// Countdown del timer
	useEffect(() => {
		if (!isPlaying) return;
		const timer = setInterval(() => {
			setSecondsLeft((prev) => Math.max(prev - 1, 0));
		}, 1000);
		return () => clearInterval(timer);
	}, [isPlaying]);

	// Transizione delle fasi: notifiche singole e cambio fase
	useEffect(() => {
		if (!isPlaying || secondsLeft > 0) return;
		if (isStudyPhase) {
			// Fine fase di studio: prima transizione a pausa, poi paghiamo il debito
			notifyStudy();
			setIsStudyPhase(false);
			pauseAnimation(inSeconds(pauseTime));
			setSecondsLeft(inSeconds(pauseTime));
			if (pomoEventModeRef.current) {
				payStudyDebt(1)
					.then(() => {
						// Notifica altri componenti (es. PomoEventForm) di aggiornare il debito
						window.dispatchEvent(
							new CustomEvent("studyDebt:updated")
						);
					})
					.catch(() => {});
			}
		} else if (currentCycle < cycles) {
			notifyPause();
			setCurrentCycle(currentCycle + 1);
			setIsStudyPhase(true);
			studyAnimation(inSeconds(studyTime));
			setSecondsLeft(inSeconds(studyTime));
		} else {
			notifyEnd();
			setIsPlaying(false);
			setAnimationClass("");
			setSecondsLeft(0);
		}
	}, [
		secondsLeft,
		isPlaying,
		isStudyPhase,
		currentCycle,
		cycles,
		studyTime,
		pauseTime
	]);

	// Funzioni per gestire l'animazione del timer
	function studyAnimation(seconds: number) {
		setAnimationClass("studyAnim");
		document.documentElement.style.setProperty(
			"--animation-duration",
			`${seconds}s`
		);
	}
	function pauseAnimation(seconds: number) {
		setAnimationClass("pauseAnim");
		document.documentElement.style.setProperty(
			"--animation-duration",
			`${seconds}s`
		);
	}

	return (
		<div className="container py-4">
			{/* Switch modalità PomoEvento - Restyled */}
			<div className="row justify-content-center mb-4">
				<div className="col-12 col-lg-8">
					<div className="card border-0 shadow-sm bg-light-subtle">
						<div className="card-body py-3">
							<div className="d-flex align-items-start justify-content-between flex-wrap gap-3">
								<div className="flex-grow-1">
									<h2 className="h6 mb-2 d-flex align-items-center gap-2">
										<i className="bi bi-lightning-charge-fill text-warning"></i>
										<span>Modalità PomoEvento</span>
										{pomoEventMode && (
											<span className="badge bg-warning text-dark">
												Attiva
											</span>
										)}
									</h2>
									<p className="text-muted small mb-0">
										Cicli obbligati, nessun controllo
										manuale.
									</p>
								</div>
								<div className="form-check form-switch ms-auto pe-2">
									<input
										className="form-check-input"
										type="checkbox"
										id="pomoEventMode"
										checked={pomoEventMode}
										disabled={isPlaying}
										onChange={() =>
											setPomoEventMode(!pomoEventMode)
										}
									/>
									<label
										className="form-check-label small fw-semibold"
										htmlFor="pomoEventMode"
									>
										{pomoEventMode ? "ON" : "OFF"}
									</label>
								</div>
							</div>
							{pomoEventMode && (
								<div className="alert alert-secondary small mt-3 mb-0 d-flex gap-2 align-items-start">
									<i className="bi bi-info-circle-fill text-secondary mt-1"></i>
									<div>
										In questa modalità puoi solo impostare i
										cicli e avviare il pomodoro. Ogni ciclo
										di studio completato riduce il tuo
										debito di studio.
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
			<div className="row justify-content-center">
				<div className="col-12 col-lg-8">
					<h1 className="text-center mb-4 display-4">
						Timer Pomodoro
					</h1>
					<div className="card shadow mb-4">
						<div className="card-body">
							<form onSubmit={handleSubmit}>
								<div className="row g-3 mb-4">
									{/* Input per il tempo di studio e pausa nascosti in modalità PomoEvento */}
									{!pomoEventMode && (
										<>
											<div className="col-md-4">
												<div className="form-floating">
													<input
														type="text"
														className="form-control"
														id="studyTime"
														name="studyTime"
														value={studyTime}
														onChange={(e) =>
															setStudyTime(
																formatHHMMSS(
																	e.target
																		.value
																)
															)
														}
														maxLength={8}
														required
														pattern="[0-2][0-9]:[0-5][0-9]:[0-5][0-9]"
														placeholder="HH:MM:SS"
													/>
													<label htmlFor="studyTime">
														Tempo di Studio
													</label>
												</div>
											</div>
											<div className="col-md-4">
												<div className="form-floating">
													<input
														type="text"
														className="form-control"
														id="pauseTime"
														name="pauseTime"
														value={pauseTime}
														onChange={(e) =>
															setPauseTime(
																formatHHMMSS(
																	e.target
																		.value
																)
															)
														}
														maxLength={8}
														required
														pattern="[0-2][0-9]:[0-5][0-9]:[0-5][0-9]"
														placeholder="HH:MM:SS"
													/>
													<label htmlFor="pauseTime">
														Tempo di Pausa
													</label>
												</div>
											</div>
										</>
									)}
									<div
										className={
											pomoEventMode
												? "col-12"
												: "col-md-4"
										}
									>
										<div className="form-floating">
											<input
												type="number"
												className="form-control"
												id="cycles"
												name="cycles"
												min={1}
												value={cycles}
												disabled={
													isPlaying && pomoEventMode
												}
												onChange={(e) =>
													setCycles(
														Number(e.target.value)
													)
												}
											/>
											<label htmlFor="cycles">
												Numero di Cicli
											</label>
										</div>
									</div>
								</div>
								<div className="d-flex gap-2 flex-wrap justify-content-center">
									{(!isPlaying || !pomoEventMode) && (
										<button
											className="btn btn-success"
											type="submit"
										>
											<i className="bi bi-play-fill"></i>{" "}
											Avvia
										</button>
									)}
									{/* Controlli extra mostrati solo se NON in modalità PomoEvento */}
									{!pomoEventMode && (
										<>
											<button
												className="btn btn-outline-primary"
												type="button"
												onClick={Skip}
											>
												<i className="bi bi-skip-forward-fill"></i>{" "}
												Salta Fase
											</button>
											<button
												className="btn btn-outline-info"
												type="button"
												onClick={restartCycle}
											>
												<i className="bi bi-arrow-repeat"></i>{" "}
												Riavvia Ciclo Attuale
											</button>
											<button
												className="btn btn-outline-warning"
												type="button"
												onClick={endCycle}
											>
												<i className="bi bi-stop-fill"></i>{" "}
												Termina Ciclo Attuale
											</button>
											<button
												className="btn btn-outline-danger"
												type="button"
												onClick={handleClear}
											>
												<i className="bi bi-x-circle"></i>{" "}
												Azzera Tutto
											</button>
										</>
									)}
								</div>
							</form>
						</div>
					</div>

					{/* Didascalia di stato */}
					{isPlaying && (
						<div className="alert alert-info text-center mb-4">
							<h4 className="alert-heading mb-0">
								{isStudyPhase
									? "Fase di Studio"
									: "Fase di Pausa"}{" "}
								- Ciclo {currentCycle} di {cycles}
							</h4>
						</div>
					)}

					{/* Timer Pomodoro */}
					<div
						className="position-relative mx-auto d-flex justify-content-center"
						style={{ maxWidth: "400px", width: "100%" }}
					>
						<div
							className="position-relative mx-auto w-100 pomodoro-wrapper"
							style={{ width: "100%", aspectRatio: "1 / 1" }}
						>
							<Image
								src="/tomato.svg"
								alt="Timer Pomodoro"
								width={400}
								height={400}
								className="position-absolute top-0 start-0 w-100 h-100"
								style={{ zIndex: 2, objectFit: "contain" }}
								priority
							/>
							<div
								style={{
									position: "absolute",
									width: "80%", // 320/400
									height: "66%", // 264/400
									borderRadius:
										"60% 60% 50% 50% / 70% 70% 50% 50%",
									top: "57%",
									left: "50%",
									transform: "translate(-50%, -50%)",
									overflow: "hidden",
									zIndex: 1,
									border: "2px solid #e34c26"
								}}
								className={
									animationClass + " progress-container"
								}
							>
								<div className="progress-fill" />

								{/* Animazioni CSS */}
								<style jsx>{`
									.progress-container {
										position: relative;
										background: #2ecc71;
									}
									.progress-fill {
										position: absolute;
										bottom: 0;
										left: 0;
										width: 100%;
										height: 100%;
										transform-origin: bottom;
										background: linear-gradient(
											to top,
											#e74c3c
										);
										filter: brightness(0.95);
									}
									@keyframes fillUp {
										0% {
											transform: scaleY(0);
										}
										100% {
											transform: scaleY(1);
										}
									}
									@keyframes fillDown {
										0% {
											transform: scaleY(1);
										}
										100% {
											transform: scaleY(0);
										}
									}
									.studyAnim .progress-fill {
										animation: fillUp
											var(--animation-duration) linear
											forwards;
									}
									.pauseAnim .progress-fill {
										animation: fillDown
											var(--animation-duration) linear
											forwards;
									}
									@media (max-width: 576px) {
										.pomodoro-wrapper {
											max-width: 90vw;
										}
									}
								`}</style>
							</div>
							{isPlaying && (
								<div
									className="position-absolute top-50 start-50 translate-middle bg-light bg-opacity-75 px-3 py-2 rounded shadow"
									style={{ zIndex: 3 }}
								>
									<h2 className="mb-0 display-6">
										{displayTime(secondsLeft)}
									</h2>
								</div>
							)}
						</div>
					</div>

					{/* Form per il calcolo delle proposte */}
					<div className="card shadow mt-4">
						<div className="card-body">
							<h2 className="card-title h4 mb-4">
								Trova il Tuo Schema di Studio Ideale
							</h2>
							<form
								onSubmit={(e) => {
									e.preventDefault();
									const value = Number(availableTime);
									const totalMinutes =
										timeUnit === "hours"
											? value * 60
											: value;
									const newProposals =
										calculateProposals(totalMinutes);
									setProposals(newProposals);
									setShowProposals(true);
								}}
							>
								<div className="row g-3 align-items-end">
									<div className="col-md-4">
										<div className="form-floating">
											<input
												type="number"
												className="form-control"
												id="availableTime"
												value={availableTime}
												onChange={(e) =>
													setAvailableTime(
														e.target.value
													)
												}
												min="1"
												max={
													timeUnit === "hours"
														? "24"
														: "1440"
												}
												required
											/>
											<label htmlFor="availableTime">
												Tempo Disponibile
											</label>
										</div>
									</div>
									<div className="col-md-4">
										<div className="form-floating">
											<select
												className="form-select"
												value={timeUnit}
												onChange={(e) =>
													setTimeUnit(
														e.target.value as
															| "minutes"
															| "hours"
													)
												}
												id="timeUnit"
											>
												<option value="minutes">
													Minuti
												</option>
												<option value="hours">
													Ore
												</option>
											</select>
											<label htmlFor="timeUnit">
												Unità di Tempo
											</label>
										</div>
									</div>
									<div className="col-md-4">
										<button
											type="submit"
											className="btn btn-primary w-100"
										>
											<i className="bi bi-search"></i>{" "}
											Ricevi Suggerimenti
										</button>
									</div>
								</div>
							</form>

							{showProposals && (
								<div className="mt-4">
									{proposals.length > 0 ? (
										<select
											className="form-select"
											onChange={(e) => {
												const selected =
													proposals[
														Number(e.target.value)
													];
												setStudyTime(
													`00:${selected.studyMinutes.toString().padStart(2, "0")}:00`
												);
												setPauseTime(
													`00:${selected.pauseMinutes.toString().padStart(2, "0")}:00`
												);
												setCycles(selected.cycles);
											}}
											defaultValue=""
										>
											<option hidden>
												Seleziona uno schema
											</option>
											{proposals.map(
												(proposal, index) => (
													<option
														key={index}
														value={index}
													>
														{proposal.cycles} cicli:{" "}
														{proposal.studyMinutes}
														min studio /{" "}
														{proposal.pauseMinutes}
														min pausa
													</option>
												)
											)}
										</select>
									) : (
										<div className="alert alert-warning text-center">
											Nessuna corrispondenza perfetta
											trovata. Prova una durata diversa.
										</div>
									)}
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
