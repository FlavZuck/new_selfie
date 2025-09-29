"use client";

import {
	getNearestPomoEventTitle,
	getStudyDebt
} from "@/app/actions/pomo_logic/pomoback_logic";
import { useEffect, useState } from "react";

export default function PomoPreview() {
	const [pomoevent, setPomoevent] = useState<string | null>(null);
	const [debt, setDebt] = useState<number | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	async function fetchData() {
		try {
			setLoading(true);
			setError(null);
			const [evt, deb] = await Promise.all([
				getNearestPomoEventTitle(),
				getStudyDebt()
			]);
			setPomoevent(evt);
			setDebt(deb);
		} catch (e) {
			console.error("Error fetching pomodoro preview:", e);
			setError("Errore nel caricamento");
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		fetchData();
	}, []);

	return (
		<div
			className="rounded border bg-light-subtle px-4 py-3 small text-start position-relative"
			aria-live="polite"
		>
			<div className="mb-2">
				<strong
					className="text-secondary"
					style={{ fontSize: "0.85rem" }}
				>
					Focus Pomodoro
				</strong>
			</div>

			{loading && (
				<div className="text-center py-2">
					<div
						className="spinner-border spinner-border-sm text-primary"
						role="status"
						aria-label="Caricamento"
					/>
				</div>
			)}

			{!loading && error && (
				<div className="text-danger" style={{ fontSize: "0.8rem" }}>
					{error}
				</div>
			)}

			{!loading && !error && (
				<div className="d-flex flex-column gap-2">
					{pomoevent ? (
						<div className="d-flex align-items-start gap-2">
							<span
								className="badge bg-danger"
								style={{ fontSize: "0.65rem" }}
							>
								Prossima
							</span>
							<span
								className="text-truncate flex-grow-1"
								title={pomoevent}
								style={{ fontSize: "0.8rem" }}
							>
								{pomoevent}
							</span>
						</div>
					) : (
						<div
							className="text-muted"
							style={{ fontSize: "0.75rem" }}
						>
							Nessuna sessione imminente
						</div>
					)}

					{debt !== null ? (
						<div className="d-flex align-items-start gap-2">
							<span
								className="badge bg-secondary text-light"
								style={{ fontSize: "0.65rem" }}
							>
								Debito
							</span>
							<span
								className="flex-grow-1"
								style={{ fontSize: "0.8rem" }}
							>
								{debt}
							</span>
						</div>
					) : (
						<div
							className="text-muted"
							style={{ fontSize: "0.75rem" }}
						>
							Nessun debito rilevato
						</div>
					)}
				</div>
			)}
		</div>
	);
}
