"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import pomodoro from "../pomodoro/pomodoro.module.css";

export default function PomodoroTimer() {
	const [studyTime, setStudyTime] = useState("00:00:10");
	const [pauseTime, setPauseTime] = useState("00:00:10");
	const [cycles, setCycles] = useState(5);

	const [secondsLeft, setSecondsLeft] = useState(0);
	const [isPlaying, setIsPlaying] = useState(false);
	const [isStudyPhase, setIsStudyPhase] = useState(true);
	const [currentCycle, setCurrentCycle] = useState(1);
	const [animationClass, setAnimationClass] = useState("");

	const inSeconds = (time: string) => {
		const splitted = time.split(":").map(Number);
		return splitted[0] * 3600 + splitted[1] * 60 + splitted[2];
	};

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

	const displayTime = (seconds: number) => {
		const hour = Math.floor(seconds / 3600);
		const min = Math.floor((seconds % 3600) / 60);
		const sec = seconds % 60;
		return `${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
	};

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
			<form
				id={pomodoro.studyForm}
				onSubmit={(e) => {
					e.preventDefault();
					console.log(
						"form submitted:",
						studyTime,
						pauseTime,
						cycles
					);
					Start();
				}}
			>
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

				<button id={pomodoro.clear} type="button" onClick={Clear}>
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
		</div>
	);
}

// • Input di ore/minuti e proposta durata ciclo
// • Notifica per inizio ciclo, passaggio da una fase alla
// successiva, fine ciclo.

// I cicli previsti e non completati vengono automaticamente passati alle giornate successive e si sommano a quelli previsti per quella giornata.
// Vi è necessità, ovviamente, che ogni utente abbia collegato al suo profilo una sezione di dati legata al suo profilo
// utente che mantenga i cambiamenti fatti in passato ai timer (i.e. aver allungato la pausa a 10 min invece dei 5 di default)
// e che tenga conto dei cicli passati non finiti
