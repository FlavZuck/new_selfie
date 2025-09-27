"use client";

// Migrated from CSS module to Bootstrap utilities + inline custom touches
import { useEffect, useRef, useState } from "react";
import {
	getVirtualDate,
	resetVirtualDate,
	setVirtualDate
} from "../actions/timemach_logic";

// Obblighiamo il componente a essere dinamico, in modo che venga ricaricato ogni volta
export const dynamic = "force-dynamic";

export default function TimeMachineButton() {
	// Virtual date state
	const [now, setNow] = useState<Date | null>(null);
	const [active, setActive] = useState<boolean>(false);

	const [show, setShow] = useState(false);
	const dateInputRef = useRef<HTMLInputElement>(null);

	// Carica data virtuale iniziale (molto arzigogolato ma funziona)
	useEffect(() => {
		(async () => {
			const vd = await getVirtualDate();
			setNow(vd);
			setActive(vd !== null);
		})();
	}, []);

	// Funzione per gestire il click sul pulsante "Set Date"
	const handleSetVirtualDate = async () => {
		if (dateInputRef.current?.value) {
			const date = new Date(dateInputRef.current.value);
			// Controllo un po' particolare ma funzionale
			if (!isNaN(date.getTime())) {
				await setVirtualDate(date);
				setShow(false);
				window.location.reload();
			} else {
				alert("Please enter a valid date");
			}
		} else {
			alert("Please select a date and time");
		}
	};

	// Funzione per gestire il reset della data virtuale
	const handleResetVirtualDate = async () => {
		await resetVirtualDate();
		setShow(false);
		window.location.reload();
	};

	return (
		<>
			<div
				className="position-fixed bottom-0 end-0 p-3"
				style={{ zIndex: 1080 }}
			>
				<button
					onClick={() => setShow(!show)}
					className="btn btn-warning fw-semibold shadow-sm d-flex align-items-center gap-2 rounded-pill px-3 py-2 border-0"
					style={{
						background: "linear-gradient(135deg,#ffc107,#ff9800)",
						boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
						letterSpacing: "0.5px"
					}}
				>
					<span
						style={{
							filter: "drop-shadow(0 2px 2px rgba(0,0,0,.25))"
						}}
					>
						🕐
					</span>
					Time Machine
				</button>
			</div>

			{show && (
				<div
					className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-start align-items-sm-center p-3"
					style={{
						background: "rgba(0,0,0,0.5)",
						backdropFilter: "blur(10px)",
						zIndex: 2000,
						overflowY: "auto"
					}}
				>
					<div
						className="bg-white rounded-4 shadow-lg position-relative p-4 w-100"
						style={{ maxWidth: 560 }}
					>
						<button
							onClick={() => setShow(false)}
							className="btn btn-sm btn-outline-secondary position-absolute top-0 end-0 mt-2 me-2 rounded-circle"
							aria-label="Close"
							style={{ width: 34, height: 34, lineHeight: 1 }}
						>
							&times;
						</button>
						<h2 className="h4 fw-bold mb-4 text-dark text-shadow-sm">
							Time Machine
						</h2>

						{/* VIRTUAL DATE STATUS */}
						<div className="mb-4">
							{active && now ? (
								<div className="alert alert-info d-flex align-items-center gap-2 mb-0 py-2 px-3">
									<span className="fw-semibold">
										Virtual date active:
									</span>
									<span className="small">
										{now.toLocaleString()}
									</span>
								</div>
							) : (
								<div className="alert alert-secondary mb-0 py-2 px-3">
									<span className="small">
										No virtual date set - using real time
									</span>
								</div>
							)}
						</div>

						{/* SET VIRTUAL DATE */}
						<div className="mb-4">
							<label
								htmlFor="virtual-date"
								className="form-label fw-semibold"
							>
								Set virtual date:
							</label>
							<div className="d-flex flex-column flex-sm-row gap-2">
								<input
									ref={dateInputRef}
									type="datetime-local"
									id="virtual-date"
									className="form-control"
								/>
								<button
									onClick={handleSetVirtualDate}
									className="btn btn-primary fw-semibold shadow-sm"
									style={{ minWidth: 140 }}
								>
									Set Date
								</button>
							</div>
						</div>

						{/* RESET VIRTUAL DATE */}
						{active && (
							<div className="mb-2">
								<label className="form-label fw-semibold">
									Reset to real time:
								</label>
								<button
									onClick={handleResetVirtualDate}
									className="btn btn-outline-danger fw-semibold"
									style={{ minWidth: 180 }}
								>
									Reset to Real Time
								</button>
							</div>
						)}
					</div>
				</div>
			)}
		</>
	);
}
