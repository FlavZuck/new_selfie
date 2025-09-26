"use client";

import {
	PomodoroProposal,
	PomodoroSchema
} from "@/app/lib/definitions/def_pomo";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { getPomodoro, savePomodoro } from "../../actions/pomodoro_logic";
import pomodoro from "../../pomodoro/pomodoro.module.css";

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

	// Funzioni di conversione del tempo
	const inSeconds = (time: string) => {
		const splitted = time.split(":").map(Number);
		return splitted[0] * 3600 + splitted[1] * 60 + splitted[2];
	};
	const displayTime = (seconds: number) => {
		const hour = Math.floor(seconds / 3600);
		const min = Math.floor((seconds % 3600) / 60);
		const sec = seconds % 60;
		return `${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
	};

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

	// Funzioni di controllo del timer
	const Start = () => {
		console.log("Start. isplaying:", isPlaying);
		setIsPlaying(true);
		setSecondsLeft(inSeconds(studyTime));
		setIsStudyPhase(true);
		setCurrentCycle(1);
		console.log("about to Start timer", isPlaying);
		studyAnimation(inSeconds(studyTime));
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
		console.log("form submitted:", studyTime, pauseTime, cycles);
		const validation = await PomodoroSchema.safeParseAsync({
			studyMin: studyTime,
			pauseMin: pauseTime,
			savedCycles: cycles
		});
		console.log("validation", validation);
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
		Start();
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

	// UseEffect per gestisce il timer grafico nel pomodoro
	useEffect(() => {
		console.log("startTimer", isPlaying);
		if (!isPlaying) return;
		console.log("Timer started");

		const timer = setInterval(() => {
			setSecondsLeft((prev) => {
				console.log(prev);
				if (prev <= 1) {
					if (isStudyPhase) {
						console.log("Study phase ended");
						setIsStudyPhase(false);
						pauseAnimation(inSeconds(pauseTime));
						return inSeconds(pauseTime);
					} else {
						if (currentCycle < cycles) {
							console.log("Pause phase ended");
							setIsStudyPhase(true);
							setCurrentCycle(currentCycle + 1);
							studyAnimation(inSeconds(studyTime));
							return inSeconds(studyTime);
						} else {
							setIsPlaying(false);
							clearInterval(timer);
							setAnimationClass("");
							return 0;
						}
					}
				}

				return prev - 1;
			});
		}, 1000);
		return () => clearInterval(timer);
	}, [isPlaying, isStudyPhase, currentCycle, cycles, studyTime, pauseTime]);

	// Funzione per calcolare le proposte in base al tempo disponibile
	function calculateProposals(totalMinutes: number): PomodoroProposal[] {
		const proposals: PomodoroProposal[] = [];

		// Common study/pause time combinations
		const combinations = [
			{ study: 25, pause: 5 },
			{ study: 35, pause: 5 },
			{ study: 40, pause: 5 },
			{ study: 45, pause: 5 },
			{ study: 50, pause: 5 },
			{ study: 30, pause: 10 },
			{ study: 35, pause: 10 },
			{ study: 45, pause: 10 },
			{ study: 50, pause: 10 }
		];

		combinations.forEach(({ study, pause }) => {
			const cycleTime = study + pause;
			const possibleCycles = Math.floor(totalMinutes / cycleTime);
			const totalTime = possibleCycles * cycleTime;

			if (totalTime === totalMinutes) {
				proposals.push({
					cycles: possibleCycles,
					studyMinutes: study,
					pauseMinutes: pause,
					totalTime
				});
			}
		});

		return proposals;
	}

	// Funzioni per gestire l'animazione del timer
	function studyAnimation(seconds: number) {
		console.log("studyanim");
		setAnimationClass(pomodoro.juiceStudy);
		document.documentElement.style.setProperty(
			"--animation-duration",
			`${seconds}s`
		);
	}
	function pauseAnimation(seconds: number) {
		console.log("pauseanim");
		setAnimationClass(pomodoro.juicePause);
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
							<form onSubmit={handleSubmit}>
								<div className="row g-3 mb-4">
									<div className="col-md-4">
										<div className="form-floating">
											<input
												type="time"
												className="form-control"
												id="studyTime"
												name="studyTime"
												min="00:00:00"
												max="23:59:59"
												step={10}
												value={studyTime}
												onChange={(e) =>
													setStudyTime(e.target.value)
												}
												required
											/>
											<label htmlFor="studyTime">
												Tempo di Studio
											</label>
										</div>
									</div>

									<div className="col-md-4">
										<div className="form-floating">
											<input
												type="time"
												className="form-control"
												id="pauseTime"
												name="pauseTime"
												min="00:00:00"
												max="23:59:59"
												step={10}
												value={pauseTime}
												onChange={(e) =>
													setPauseTime(e.target.value)
												}
												required
											/>
											<label htmlFor="pauseTime">
												Tempo di Pausa
											</label>
										</div>
									</div>

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
								backgroundColor: "#e34c26",
								top: "57%",
								left: "50%",
								transform: "translate(-50%, -50%)",
								zIndex: 1
							}}
							className={animationClass}
						>
							<style jsx>{`
								@keyframes spin {
									0% {
										transform: translateY(0%) rotate(0deg);
									}
									100% {
										transform: translateY(-75%)
											rotate(720deg);
									}
								}

								@keyframes spinreverse {
									0% {
										transform: translateY(0%) rotate(0deg);
									}
									100% {
										transform: translateY(75%)
											rotate(720deg);
									}
								}

								.juiceStudy::after {
									content: "";
									position: absolute;
									height: 100%;
									width: 100%;
									bottom: 0;
									left: 0;
									z-index: -1;
									background-color: white;
									border-radius: 40%;
									animation: spin var(--animation-duration)
										linear forwards;
								}

								.juicePause::after {
									content: "";
									position: absolute;
									height: 100%;
									width: 100%;
									bottom: 0;
									left: 0;
									z-index: -1;
									background-color: white;
									border-radius: 40%;
									animation: spinreverse
										var(--animation-duration) linear
										forwards;
									top: -75%;
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

// • Input di ore/minuti e proposta durata ciclo
// • Notifica per inizio ciclo, passaggio da una fase alla
// successiva, fine ciclo.
