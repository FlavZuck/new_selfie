"use client";

import { getNearestActivityTitle } from "@/app/actions/cale_logic/activity_logic";
import { getNearestEventTitle } from "@/app/actions/cale_logic/event_logic";
import { useEffect, useState } from "react";

export default function CalePreview() {
	const [activity, setActivity] = useState<string | null>(null);
	const [event, setEvent] = useState<string | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	async function fetchData() {
		try {
			setLoading(true);
			setError(null);
			const [a, e] = await Promise.all([
				getNearestActivityTitle(),
				getNearestEventTitle()
			]);
			setActivity(a);
			setEvent(e);
		} catch (err) {
			console.error("Error fetching data:", err);
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
			className="preview-box rounded border border-1 bg-light-subtle px-4 py-3 small text-start position-relative"
			aria-live="polite"
		>
			<div className="mb-2">
				<strong
					className="text-secondary"
					style={{ fontSize: "0.85rem" }}
				>
					Prossimi elementi
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
					{activity ? (
						<div className="d-flex align-items-start gap-2">
							<span className="badge preview-badge bg-info text-light shadowed">
								Attività
							</span>
							<span
								className="text-truncate flex-grow-1 fw-semibold"
								title={activity}
								style={{ fontSize: "0.8rem" }}
							>
								{activity}
							</span>
						</div>
					) : (
						<div
							className="text-muted"
							style={{ fontSize: "0.75rem" }}
						>
							Nessuna attività imminente
						</div>
					)}

					{event ? (
						<div className="d-flex align-items-start gap-2">
							<span className="badge preview-badge bg-warning text-light shadowed">
								Evento
							</span>
							<span
								className="text-truncate flex-grow-1 fw-semibold"
								title={event}
								style={{ fontSize: "0.8rem" }}
							>
								{event}
							</span>
						</div>
					) : (
						<div
							className="text-muted"
							style={{ fontSize: "0.75rem" }}
						>
							Nessun evento imminente
						</div>
					)}
				</div>
			)}
		</div>
	);
}
