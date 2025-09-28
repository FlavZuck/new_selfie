"use client";

import {
	getPomodoro,
	notifyPomodoro,
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
import React, { useEffect, useState } from "react";

export default function PomodoroTimer() {
	// Default config (duh)
	const defaultConfig = {
		studyMin: "00:30:00",
		pauseMin: "00:05:00",
		savedCycles: 5
	};

	// Stati del ciclo di input
	const [studyTime, setStudyTime] = useState(defaultConfig.studyMin);
	const [pauseTime, setPauseTime] = useState(defaultConfig.pauseMin);
	const [cycles, setCycles] = useState(defaultConfig.savedCycles);

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
		setIsPlaying(true);
		setSecondsLeft(inSeconds(studyTime));
		setIsStudyPhase(true);
		setCurrentCycle(1);
		studyAnimation(inSeconds(studyTime));
		await notifyStart();
	};
	const Clear = () => {
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
		setIsStudyPhase(true);
		setSecondsLeft(inSeconds(studyTime));
		setAnimationClass("");
		setTimeout(() => {
			studyAnimation(inSeconds(studyTime));
		}, 20);
		setIsPlaying(true);
	};
	const endCycle = () => {
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
			notifyStudy();
			setIsStudyPhase(false);
			pauseAnimation(inSeconds(pauseTime));
			setSecondsLeft(inSeconds(pauseTime));
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
			<div className="row justify-content-center">
				<div className="col-12 col-lg-8">
					<h1 className="text-center mb-4 display-4">
						Timer Pomodoro
					</h1>

					<div className="card shadow mb-4">
						<div className="card-body">
							{/* Form di input principale */}
							<form onSubmit={handleSubmit}>
								<div className="row g-3 mb-4">
									{/* Input per il tempo di studio */}
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
															e.target.value
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

									{/* Input per il tempo di pausa */}
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
															e.target.value
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

									{/* Input per il numero di cicli */}
									<div className="col-md-4">
										<div className="form-floating">
											<input
												type="number"
												className="form-control"
												id="cycles"
												name="cycles"
												min={1}
												value={cycles}
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

								{/* Bottoni di controllo */}
								<div className="d-flex gap-2 flex-wrap justify-content-center">
									<button
										className="btn btn-success"
										type="submit"
									>
										<i className="bi bi-play-fill"></i>{" "}
										Avvia
									</button>
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
						className="position-relative mx-auto"
						style={{ width: "400px", height: "400px" }}
					>
						<Image
							src="/tomato.svg"
							alt="Timer Pomodoro"
							width={400}
							height={400}
							className="position-absolute top-0 start-0 w-100 h-100"
							style={{ zIndex: 2 }}
							priority
						/>
						<div
							style={{
								position: "absolute",
								width: "320px",
								height: "264px",
								borderRadius:
									"60% 60% 50% 50% / 70% 70% 50% 50%",
								top: "57%",
								left: "50%",
								transform: "translate(-50%, -50%)",
								overflow: "hidden",
								zIndex: 1,
								border: "2px solid #e34c26"
							}}
							className={animationClass + " progress-container"}
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
									animation: fillUp var(--animation-duration)
										linear forwards;
								}
								.pauseAnim .progress-fill {
									animation: fillDown
										var(--animation-duration) linear
										forwards;
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
