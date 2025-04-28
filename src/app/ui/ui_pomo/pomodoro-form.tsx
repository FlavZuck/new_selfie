"use client";

import {
	PomodoroProposal,
	PomodoroSchema
} from "@/app/lib/definitions/def_pomo";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { loadPomodoro, savePomodoro } from "../../actions/pomodoro_logic";
import pomodoro from "../../pomodoro/pomodoro.module.css";

export default function PomodoroTimer() {
	const [studyTime, setStudyTime] = useState("00:00:10");
	const [pauseTime, setPauseTime] = useState("00:00:10");
	const [cycles, setCycles] = useState(5);

	const [secondsLeft, setSecondsLeft] = useState(0);
	const [isPlaying, setIsPlaying] = useState(false);
	const [isStudyPhase, setIsStudyPhase] = useState(true);
	const [currentCycle, setCurrentCycle] = useState(1);
	const [animationClass, setAnimationClass] = useState("");

	const [availableTime, setAvailableTime] = useState("");
	const [proposals, setProposals] = useState<PomodoroProposal[]>([]);
	const [showProposals, setShowProposals] = useState(false);
	const [timeUnit, setTimeUnit] = useState<"minutes" | "hours">("minutes");

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

	useEffect(() => {
		async function loadConfig() {
			const config = await loadPomodoro();
			if (config) {
				const { studyMin, pauseMin, savedCycles } = config.timerConfig;
				setStudyTime(studyMin);
				setPauseTime(pauseMin);
				setCycles(savedCycles);
			}
		}
		loadConfig();
	}, []);

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
		setStudyTime("00:00:10");
		setPauseTime("00:00:10");
		setCycles(5);
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

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		console.log("form submitted:", studyTime, pauseTime, cycles);
		const validation = PomodoroSchema.safeParse({
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

	const handleClear = async () => {
		Clear();
		await savePomodoro("00:00:10", "00:00:10", 5); //cambia con default prof
	};

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
		<div>
			<h1 className={pomodoro.h1}>Pomodoro Timer</h1>

			{/* da inserire in flex container con classi per input e bottoni */}
			<form id={pomodoro.studyForm} onSubmit={handleSubmit}>
				<div style={{ float: "left" }}>
					<label htmlFor="studyTime">Study Time:</label>
					<input
						className={pomodoro.input}
						type="time"
						id="studyTime"
						name="studyTime"
						min="00:00:00"
						max="23:59:59"
						step={10}
						value={studyTime}
						onChange={(e) => setStudyTime(e.target.value)}
						required
					/>
				</div>

				<div style={{ float: "left" }}>
					<label htmlFor="pauseTime">Pause Time:</label>
					<input
						className={pomodoro.input}
						type="time"
						id="pauseTime"
						name="pauseTime"
						min="00:00:00"
						max="23:59:59"
						step={10}
						value={pauseTime}
						onChange={(e) => setPauseTime(e.target.value)}
						required
					/>
				</div>

				<div style={{ float: "left" }}>
					<label htmlFor="cycles">Repeat for:</label>
					<input
						className={pomodoro.input}
						type="number"
						id="cycles"
						name="cycles"
						min={1}
						value={cycles}
						onChange={(e) => setCycles(Number(e.target.value))}
					/>{" "}
					times
				</div>
				<br />

				<button id={pomodoro.clear} type="button" onClick={handleClear}>
					Clear
				</button>

				<button id={pomodoro.start} type="submit">
					Start
				</button>

				<button id={pomodoro.skip} type="button" onClick={Skip}>
					Skip
				</button>

				<button
					id={pomodoro.restart}
					type="button"
					onClick={restartCycle}
				>
					Restart
				</button>
				<button id={pomodoro.end} type="button" onClick={endCycle}>
					End
				</button>
			</form>

			{/* o cosi o sparisce del tutto (isplaying &&*/}
			<h2 className={isPlaying ? "" : pomodoro.hidden}>
				{isStudyPhase ? "Study Phase" : "Pause Phase"} - Cycle{" "}
				{currentCycle} of {cycles}
			</h2>

			<div id={pomodoro.clock}>
				<Image
					src="tomato.svg"
					alt="Tomato"
					width={500}
					height={500}
					className={pomodoro.img}
				/>
				<div id={pomodoro.juice} className={animationClass}></div>
				{isPlaying && (
					<h2 id={pomodoro.timer}>{displayTime(secondsLeft)}</h2>
				)}
			</div>

			<div className={pomodoro.proposalSection}>
				<h2>Find the Best Study Schedule</h2>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						const value = Number(availableTime);
						const totalMinutes =
							timeUnit === "hours" ? value * 60 : value;

						const newProposals = calculateProposals(totalMinutes);
						setProposals(newProposals);
						setShowProposals(true);
					}}
				>
					<div className={pomodoro.inputWrapper}>
						<label htmlFor="availableTime">Available Time:</label>
						<div className={pomodoro.timeInputGroup}>
							<input
								type="number"
								id="availableTime"
								value={availableTime}
								onChange={(e) =>
									setAvailableTime(e.target.value)
								}
								min="1"
								max={timeUnit === "hours" ? "24" : "1440"}
								required
							/>
							<select
								value={timeUnit}
								onChange={(e) =>
									setTimeUnit(
										e.target.value as "minutes" | "hours"
									)
								}
							>
								<option value="minutes">Minutes</option>
								<option value="hours">Hours</option>
							</select>
						</div>
						<button type="submit">Get Proposals</button>
					</div>
				</form>

				{showProposals && (
					<div className={pomodoro.proposalsList}>
						{proposals.length > 0 ? (
							<select
								className={pomodoro.proposalDropdown}
								onChange={(e) => {
									const selected =
										proposals[Number(e.target.value)];
									console.log("Selected proposal:", selected);
									setStudyTime(
										`00:${selected.studyMinutes
											.toString()
											.padStart(2, "0")}:00`
									);
									setPauseTime(
										`00:${selected.pauseMinutes
											.toString()
											.padStart(2, "0")}:00`
									);
									console.log(
										"Selected study time:",
										studyTime
									);
									console.log(
										"Selected pause time:",
										pauseTime
									);
									setCycles(selected.cycles);
									// setShowProposals(false);
									// setAvailableTime("");
								}}
								defaultValue=""
							>
								<option hidden>Select a schedule</option>
								{proposals.map((proposal, index) => (
									<option key={index} value={index}>
										{proposal.cycles} cycles:{" "}
										{proposal.studyMinutes}min study /{" "}
										{proposal.pauseMinutes}min break
									</option>
								))}
							</select>
						) : (
							<p className={pomodoro.noResults}>
								No perfect matches found. Try a different
								duration.
							</p>
						)}
					</div>
				)}
			</div>
		</div>
	);
}

// • Input di ore/minuti e proposta durata ciclo
// • Notifica per inizio ciclo, passaggio da una fase alla
// successiva, fine ciclo.
