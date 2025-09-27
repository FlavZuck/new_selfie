"use client";

import {
	delete_event,
	get_EventById
} from "@/app/actions/cale_logic/event_logic";
import { Event_FullCalendar } from "@/app/lib/definitions/def_event";


type EventClickProps = {
	show: boolean;
	setShow: (show: boolean) => void;
	setEventToUpdate: (event: Event_FullCalendar | null) => void;
	setShow_Update_Event: (show: boolean) => void;
	info: any;
	refetch: () => Promise<void>;
};

export default function EventCard({
	show,
	setShow,
	setEventToUpdate,
	setShow_Update_Event,
	info,
	refetch
}: EventClickProps) {
	if (!show) return null;

	// Prendiamo l'evento
	const event = info.event;
	// Prepariamo le variabili per nascondere i campi
	const showtime = event.allDay;
	const showduration = event.extendedProps.duration === "";
	const showplace = event.extendedProps.place === "";

	const handleUpdate = async () => {
		const parsedevent = await get_EventById(event.id);
		if (!parsedevent) {
			console.error("Event not found");
		}
		setEventToUpdate(parsedevent as Event_FullCalendar);
		setShow(false);
		setShow_Update_Event(true);
	};

	const handleDelete = () => {
		delete_event(event.id);
		setShow(false);
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
				<h4 className="mb-4 fw-semibold text-primary">{event.title}</h4>
				<div className="vstack gap-3">
					<div hidden={showplace}>
						<h6 className="text-uppercase text-secondary mb-1 small">
							Luogo
						</h6>
						<p className="mb-0">{event.extendedProps.place}</p>
					</div>
					<div>
						<h6 className="text-uppercase text-secondary mb-1 small">
							Descrizione
						</h6>
						<p className="mb-0">
							{event.extendedProps.description}
						</p>
					</div>
					<div>
						<h6 className="text-uppercase text-secondary mb-1 small">
							Data di inizio
						</h6>
						<p className="mb-0">{event.start.toDateString()}</p>
					</div>
					<div hidden={showtime}>
						<div className="d-flex flex-wrap gap-4">
							<div>
								<h6 className="text-uppercase text-secondary mb-1 small">
									Orario
								</h6>
								<p className="mb-0">
									{event.start.toLocaleTimeString([], {
										hour: "2-digit",
										minute: "2-digit"
									})}
								</p>
							</div>
							<div hidden={showduration}>
								<h6 className="text-uppercase text-secondary mb-1 small">
									Durata (ore)
								</h6>
								<p className="mb-0">
									{event.extendedProps.duration}
								</p>
							</div>
						</div>
					</div>
					<div className="d-flex flex-wrap gap-2 pt-2 border-top">
						<button
							className="btn btn-outline-danger"
							onClick={handleDelete}
						>
							Elimina evento
						</button>
						<button
							className="btn btn-primary"
							onClick={handleUpdate}
						>
							Modifica evento
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
