"use client";

import {
	complete_activity,
	delete_activity,
	get_ActivityById
} from "@/app/actions/cale_logic/activity_logic";
import { Activity_FullCalendar } from "@/app/lib/definitions/def_actv";

type ActivityCalendarClickProps = {
	show: boolean;
	setShow: (show: boolean) => void;
	setActivity: (activity: Activity_FullCalendar | null) => void;
	setShow_Update_Event: (show: boolean) => void;
	info: any;
	refetch: () => Promise<void>;
};

export function ActivityCalendarCard({
	show,
	setShow,
	setActivity,
	setShow_Update_Event,
	info,
	refetch
}: ActivityCalendarClickProps) {
	// Stato neutrale mentre non va mostrato
	if (!show) return null;

	// Prendiamo l'attività
	const activity = info.event;
	// Prepariamo le variabili per nascondere i campi
	const showplace = activity.extendedProps.place === "";
	const showdescription = activity.extendedProps.description == "";
	const shownotification = activity.extendedProps.notification;
	const showcompletion = activity.extendedProps.completed;

	const handleDelete = async () => {
		// Call the delete function
		await delete_activity(activity.id);
		// Close the modal
		setShow(false);
		// Refetch the events
		refetch();
	};

	const handleUpdate = async () => {
		const parsedActivity = await get_ActivityById(activity.id);
		if (!parsedActivity) {
			console.error("Activity not found");
		}
		setActivity(parsedActivity as Activity_FullCalendar);
		setShow(false);
		setShow_Update_Event(true);
	};

	const handleComplete = async () => {
		await complete_activity(activity.id);
		// Close the modal
		setShow(false);
		// Refetch the events
		refetch();
	};

	return (
		<div
			className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex align-items-start justify-content-center py-4 overflow-auto"
			style={{ zIndex: 1050 }}
		>
			<div
				className="bg-white rounded-4 shadow-lg p-4 w-100 position-relative"
				style={{ maxWidth: 560 }}
			>
				<button
					type="button"
					className="btn-close position-absolute end-0 top-0 m-3"
					aria-label="Close"
					onClick={() => setShow(false)}
				/>
				<h4 className="mb-4 fw-semibold text-primary">
					{activity.title}
				</h4>
				<div className="vstack gap-3">
					<div>
						<h6 className="text-uppercase text-secondary mb-1 small">
							Giorno di scadenza
						</h6>
						<p className="mb-0">{activity.start.toDateString()}</p>
					</div>
					<div hidden={showplace}>
						<h6 className="text-uppercase text-secondary mb-1 small">
							Luogo
						</h6>
						<p className="mb-0">{activity.extendedProps.place}</p>
					</div>
					<div hidden={showdescription}>
						<h6 className="text-uppercase text-secondary mb-1 small">
							Descrizione
						</h6>
						<p className="mb-0">
							{activity.extendedProps.description}
						</p>
					</div>
					<div hidden={!shownotification}>
						<h6 className="text-uppercase text-secondary mb-1 small">
							Notification Time
						</h6>
						<p className="mb-0">
							{activity.extendedProps.notificationtime}
						</p>
					</div>
					<div className="d-flex flex-wrap gap-2 pt-2 border-top">
						<button
							className="btn btn-outline-danger"
							onClick={handleDelete}
						>
							Elimina attività
						</button>
						<button
							className="btn btn-primary"
							onClick={handleUpdate}
						>
							Modifica evento
						</button>
						<button
							className="btn btn-success"
							hidden={showcompletion}
							onClick={handleComplete}
						>
							Attività Completata
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

type ActivityListCardProps = {
	show: boolean;
	setShow: (show: boolean) => void;
	activity: Activity_FullCalendar | undefined;
	refetch: () => Promise<void>;
};

export function ActivityListCard({
	show,
	setShow,
	activity,
	refetch
}: ActivityListCardProps) {
	// Stato neutrale mentre non va mostrato
	if (!show) {
		return <></>;
	}

	// Se l'attività non esiste, non mostriamo nulla
	if (!activity) {
		return <></>;
	}

	const handleDelete = async () => {
		// Call the delete function
		await delete_activity(activity.id);
		// Close the modal
		setShow(false);
		// Refetch the events
		refetch();
	};

	const handleComplete = async () => {
		await complete_activity(activity.id);
		// Close the modal
		setShow(false);
		// Refetch the events
		refetch();
	};

	// Prepariamo le variabili per nascondere i campi
	const showdescription = activity.extendedProps.description == "";
	const shownotification = activity.extendedProps.notification;
	const showcompletion = activity.extendedProps.completed;

	return (
		<div
			className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex align-items-start justify-content-center py-4 overflow-auto"
			style={{ zIndex: 1050 }}
		>
			<div
				className="bg-white rounded-4 shadow-lg p-4 w-100 position-relative"
				style={{ maxWidth: 560 }}
			>
				<button
					type="button"
					className="btn-close position-absolute end-0 top-0 m-3"
					aria-label="Close"
					onClick={() => setShow(false)}
				/>
				<h4 className="mb-4 fw-semibold text-primary">
					{activity.title}
				</h4>
				<div className="vstack gap-3">
					<div>
						<h6 className="text-uppercase text-secondary mb-1 small">
							Giorno di scadenza
						</h6>
						<p className="mb-0">{activity.start.toDateString()}</p>
					</div>
					<div hidden={showdescription}>
						<h6 className="text-uppercase text-secondary mb-1 small">
							Descrizione
						</h6>
						<p className="mb-0">
							{activity.extendedProps.description}
						</p>
					</div>
					<div hidden={!shownotification}>
						<h6 className="text-uppercase text-secondary mb-1 small">
							Notification Time
						</h6>
						<p className="mb-0">
							{activity.extendedProps.notificationtime}
						</p>
					</div>
					<div className="d-flex flex-wrap gap-2 pt-2 border-top">
						<button
							className="btn btn-outline-danger"
							onClick={handleDelete}
						>
							Elimina attività
						</button>
						<button
							className="btn btn-success"
							hidden={showcompletion}
							onClick={handleComplete}
						>
							Attività Completata
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
