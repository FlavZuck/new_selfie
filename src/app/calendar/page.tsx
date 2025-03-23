"use client";

import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import test from "node:test";
import { useEffect, useState } from "react";
import { getAllEvents } from "../actions/event_logic";
import EventForm from "../ui/event-form";
import "./calendar.css";

export default function PageCalendar() {
	const [show, setShow] = useState(false);

	const [events, setEvents] = useState([]);

	async function fetchEvents() {
		try {
			const fetchedEvents = await getAllEvents();
			console.log("Fetched events:", fetchedEvents);
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
					onClick={() => setShow(true)}
				>
					Create Event
				</button>
			</div>
			<FullCalendar
				plugins={[dayGridPlugin, interactionPlugin]}
				initialView="dayGridMonth"
				dateClick={function (info) {}}
				selectable={true}
				events={events}
			/>
			<EventForm show={show} setShow={setShow} refetch={fetchEvents} />
		</div>
	);
}
