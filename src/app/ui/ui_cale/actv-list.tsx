"use client";

import { Activity_FullCalendar } from "@/app/lib/definitions/def_actv";
import { useState } from "react";

// Funzione per filtrare le attività scadute e ritornare solo quest'ultime, se filter_exp è false
// nel caso filter_exp è true, vengono ritornate solo le attività NON scadute
// di base inoltre non ritornia le attività completate
function ExpActvList_filter(
	activity_array: Activity_FullCalendar[],
	current_date: Date,
	filter_exp: boolean = false
): Activity_FullCalendar[] {
	// Rimuoviamo le attività completate
	const activities = activity_array.filter(
		(activity) => !activity.extendedProps.completed
	);
	if (filter_exp === false) {
		// Filtriamo le attività e ritorniamo solo quelle scadute
		const filtered_activities = activities.filter((activity) => {
			const expiration_date = new Date(activity.start);
			return expiration_date < current_date;
		});
		return filtered_activities;
	} else {
		// Filtriamo le attività e ritorniamo solo quelle NON scadute
		const filtered_activities = activities.filter((activity) => {
			const expiration_date = new Date(activity.start);
			return expiration_date >= current_date;
		});
		return filtered_activities;
	}
}

function CompletedActv_filter(
	allactv: Activity_FullCalendar[]
): Activity_FullCalendar[] {
	return allactv.filter((activity) => activity.extendedProps.completed);
}

type ActvListProps = {
	allactv: Activity_FullCalendar[];
	listClick: boolean;
	setListClick: (listClick: boolean) => void;
	activity: Activity_FullCalendar | undefined;
	set_activity: (activity: Activity_FullCalendar | undefined) => void;
	current_date: Date;
};

// Componente ActvList per il rendering della lista delle attività
export function ActvList({
	allactv = [],
	setListClick,
	set_activity,
	current_date
}: ActvListProps) {
	const [isOpen, setIsOpen] = useState(true);
	// Filtriamo le attività e ritorniamo solo quelle NON scadute
	const filtered_activities = ExpActvList_filter(allactv, current_date, true);

	return (
		<div className="card shadow-sm mb-4">
			<div
				className="card-header bg-white d-flex justify-content-between align-items-center"
				style={{ cursor: "pointer" }}
				onClick={() => setIsOpen(!isOpen)}
			>
				<span className="fw-semibold text-primary">
					Lista delle attività
				</span>
				<span className="text-secondary small">
					{isOpen ? "▼" : "▶"}
				</span>
			</div>
			{isOpen && (
				<div
					className="list-group list-group-flush"
					style={{
						maxHeight: "calc(100vh - 500px)",
						minHeight: "200px",
						overflowY: "auto"
					}}
				>
					{filtered_activities.map(
						(activity: Activity_FullCalendar) => (
							<button
								key={activity.id}
								type="button"
								className="list-group-item list-group-item-action py-3"
								onClick={() => {
									setListClick(true);
									set_activity(activity);
								}}
							>
								<div className="d-flex w-100 justify-content-between">
									<h6 className="mb-1 fw-semibold">
										{activity.title}
									</h6>
								</div>
								<small className="text-muted">
									{new Date(activity.start).toDateString()}
								</small>
							</button>
						)
					)}
				</div>
			)}
		</div>
	);
}

type ExpActvListProps = {
	allactv: Activity_FullCalendar[];
	listClick: boolean;
	setListClick: (listClick: boolean) => void;
	activity: Activity_FullCalendar | undefined;
	set_activity: (activity: Activity_FullCalendar | undefined) => void;
	current_date: Date;
};

export function ExpActvList({
	allactv = [],
	setListClick,
	set_activity,
	current_date
}: ExpActvListProps) {
	const [isOpen, setIsOpen] = useState(true);
	const filtered_activities = ExpActvList_filter(allactv, current_date);

	return (
		<div className="card shadow-sm mb-4">
			<div
				className="card-header bg-white d-flex justify-content-between align-items-center"
				style={{ cursor: "pointer" }}
				onClick={() => setIsOpen(!isOpen)}
			>
				<span className="fw-semibold text-primary">
					Lista attività scadute
				</span>
				<span className="text-secondary small">
					{isOpen ? "▼" : "▶"}
				</span>
			</div>
			{isOpen && (
				<div
					className="list-group list-group-flush"
					style={{
						maxHeight: "calc(100vh - 500px)",
						minHeight: "200px",
						overflowY: "auto"
					}}
				>
					{filtered_activities.map(
						(activity: Activity_FullCalendar) => (
							<button
								key={activity.id}
								type="button"
								className="list-group-item list-group-item-action py-3"
								onClick={() => {
									setListClick(true);
									set_activity(activity);
								}}
							>
								<div className="d-flex w-100 justify-content-between">
									<h6 className="mb-1 fw-semibold">
										{activity.title}
									</h6>
								</div>
								<small className="text-muted">
									{new Date(activity.start).toDateString()}
								</small>
							</button>
						)
					)}
				</div>
			)}
		</div>
	);
}

export function CompletedActvList({
	allactv = [],
	setListClick,
	set_activity
}: ActvListProps) {
	const [isOpen, setIsOpen] = useState(true);
	const filtered_activities = CompletedActv_filter(allactv);

	return (
		<div className="card shadow-sm mb-4">
			<div
				className="card-header bg-white d-flex justify-content-between align-items-center"
				style={{ cursor: "pointer" }}
				onClick={() => setIsOpen(!isOpen)}
			>
				<span className="fw-semibold text-primary">
					Lista attività completate
				</span>
				<span className="text-secondary small">
					{isOpen ? "▼" : "▶"}
				</span>
			</div>
			{isOpen && (
				<div
					className="list-group list-group-flush"
					style={{
						maxHeight: "calc(100vh - 500px)",
						minHeight: "200px",
						overflowY: "auto"
					}}
				>
					{filtered_activities.map(
						(activity: Activity_FullCalendar) => (
							<button
								key={activity.id}
								type="button"
								className="list-group-item list-group-item-action py-3"
								onClick={() => {
									setListClick(true);
									set_activity(activity);
								}}
							>
								<div className="d-flex w-100 justify-content-between">
									<h6 className="mb-1 fw-semibold">
										{activity.title}
									</h6>
								</div>
								<small className="text-muted">
									{new Date(activity.start).toDateString()}
								</small>
							</button>
						)
					)}
				</div>
			)}
		</div>
	);
}
