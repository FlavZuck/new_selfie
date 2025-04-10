"use client";

import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import rrulePlugin from "@fullcalendar/rrule";
import { useEffect, useState } from "react";
import { getAllEvents } from "../actions/cale_logic/event_logic";
import EventCard from "../ui/ui_cale/event-card";
import EventForm from "../ui/ui_cale/event-form";
import "./calendar.css";

export default function PageCalendar() {
	// Inizializzazione degli stati
	const [show_create, setShow_Create] = useState(false);
	const [show_card, setShow_Card] = useState(false);
	const [info, setInfo] = useState({});
	const [events, setEvents] = useState([]);

	async function fetchEvents() {
		try {
			const fetchedEvents = await getAllEvents();
			setEvents(fetchedEvents);
		} catch (error) {
			console.error("Error fetching events:", error);
		}
	}

	useEffect(() => {
		fetchEvents();
	}, []);

	return (
		<div>
			<div>
				<button
					className="create-event-button"
					onClick={() => setShow_Create(true)}
				>
					Create Event
				</button>
			</div>
			<FullCalendar
				plugins={[dayGridPlugin, interactionPlugin, rrulePlugin]}
				initialView="dayGridMonth"
				eventClick={function (info) {
					setInfo(info);
					setShow_Card(true);
				}}
				selectable={true}
				events={events}
			/>
			<EventForm
				show={show_create}
				setShow={setShow_Create}
				refetch={fetchEvents}
			/>
			<EventCard
				show={show_card}
				setShow={setShow_Card}
				info={info}
				refetch={fetchEvents}
			/>
		</div>
	);
}
