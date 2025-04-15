"use client";

import { EventClickArg } from "@fullcalendar/core/index.js";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import rrulePlugin from "@fullcalendar/rrule";
import { useEffect, useState } from "react";
import { getAllActivities } from "../actions/cale_logic/activity_logic";
import { getAllEvents } from "../actions/cale_logic/event_logic";
import { Activity_FullCalendar } from "../lib/definitions/def_actv";
import { Event_FullCalendar } from "../lib/definitions/def_event";
import {
	ActivityCalendarCard,
	ActivityListCard
} from "../ui/ui_cale/actv-cards";
import ActivityForm from "../ui/ui_cale/actv-form";
import ActvList from "../ui/ui_cale/actv-list";
import EventCard from "../ui/ui_cale/event-card";
import EventForm from "../ui/ui_cale/event-form";
import "./calendar.css";

export default function PageCalendar() {
	// Stati per le fetch
	const [events, setEvents] = useState([]);
	const [allactv, setAllActv] = useState<Activity_FullCalendar[]>();

	// Stati per i modali di FullCalendar
	const [show_Event_create, setShow_Event_Create] = useState(false);
	const [show_Event_card, setShow_Event_Card] = useState(false);
	const [show_Activity_create, setShow_Activity_Create] = useState(false);
	const [show_Activity_card, setShow_Activity_Card] = useState(false);

	// Stato per il modale della ActivityList
	const [show_ActvList_card, setShow_ActvList_Card] = useState(false);

	// Stato per l'oggetto dell'attività selezionata (ActivityList)
	const [actvList_obj, setActvList_obj] = useState<Activity_FullCalendar>();
	// Stato per l'oggetto dell'evento selezionato (FullCalendar)
	const [info, setInfo] = useState<EventClickArg | null>(null);

	// Funzione che si occupa di fetchare gli eventi ed attività
	// (da mettere apposto il tipaggio tbf)
	async function fetchEvents() {
		try {
			// Prendiamo gli eventi e le attività
			const fetchedEvents: Event_FullCalendar[] = await getAllEvents();
			const fetchedActivities: Activity_FullCalendar[] =
				await getAllActivities();
			// Uniamo i fetch per FullCalendar
			const united_fetch: any = fetchedEvents.concat(
				fetchedActivities as any
			);
			// Settiamo per il FullCalendar
			setEvents(united_fetch);
			// Settiamo per la lista delle attività
			setAllActv(fetchedActivities as Activity_FullCalendar[]);
		} catch (error) {
			console.error("Error fetching events or activities :", error);
		}
	}

	// Funzione che si occupa di fetchare gli eventi e le attività
	// al cambio di stato
	useEffect(() => {
		fetchEvents();
	}, []);

	// Aggiungiamo un useEffect per osservare i cambiamenti di info
	useEffect(() => {
		// Controlliamo se info è null (fatto solo per evitare errori)
		if (!info) {
			return;
		}
		// Prendiamo il field "tipo" dalle extendedProps
		const obj = info.event.extendedProps.type;

		// Controlliamo il tipo di evento o attività
		if (obj == "EVENT") {
			setShow_Event_Card(true);
		} else if (obj == "ACTIVITY") {
			setShow_Activity_Card(true);
		}
	}, [info]);

	return (
		<div>
			{/* Header */}
			{/*SEZIONE BOTTONI E LEGENDA */}
			<div
				className="calendar-controls"
				style={{
					marginBottom: "2rem",
					display: "flex",
					flexDirection: "column",
					gap: "1.5rem"
				}}
			>
				<div
					style={{
						display: "flex",
						gap: "1rem"
					}}
				>
					<button
						className="create-event-button"
						onClick={() => setShow_Event_Create(true)}
					>
						Crea un Evento
					</button>
					<button
						className="create-activity-button"
						onClick={() => setShow_Activity_Create(true)}
					>
						Crea una Attività
					</button>
				</div>
				<div
					style={{
						display: "flex",
						gap: "2rem"
					}}
				>
					<label>
						Attività ={" "}
						<span
							style={{
								backgroundColor: "blue",
								color: "white",
								padding: "4px 8px",
								borderRadius: "4px"
							}}
						>
							blu
						</span>
					</label>
					<label>
						Evento ={" "}
						<span
							style={{
								backgroundColor: "red",
								color: "white",
								padding: "4px 8px",
								borderRadius: "4px"
							}}
						>
							rosso
						</span>
					</label>
					<label>
						EventoRicorrente ={" "}
						<span
							style={{
								backgroundColor: "green",
								color: "white",
								padding: "4px 8px",
								borderRadius: "4px"
							}}
						>
							verde
						</span>
					</label>
				</div>
			</div>

			{/*SEZIONE COMPONENTI CALENDARIO */}
			<div
				className="body-calendar"
				style={{ display: "flex", gap: "2rem" }}
			>
				<div style={{ flex: "3" }}>
					<FullCalendar
						plugins={[
							dayGridPlugin,
							interactionPlugin,
							rrulePlugin
						]}
						initialView="dayGridMonth"
						eventClick={function (info) {
							setInfo(info);
						}}
						selectable={true}
						events={events}
					/>
				</div>
				<div style={{ flex: "1" }}>
					<ActvList
						allactv={allactv ? allactv : []}
						listClick={show_ActvList_card}
						setListClick={setShow_ActvList_Card}
						activity={actvList_obj}
						set_activity={setActvList_obj}
					/>
				</div>
			</div>
			<EventForm
				show={show_Event_create}
				setShow={setShow_Event_Create}
				refetch={fetchEvents}
			/>
			<EventCard
				show={show_Event_card}
				setShow={setShow_Event_Card}
				info={info}
				refetch={fetchEvents}
			/>
			<ActivityForm
				show={show_Activity_create}
				setShow={setShow_Activity_Create}
				refetch={fetchEvents}
			/>
			<ActivityCalendarCard
				show={show_Activity_card}
				setShow={setShow_Activity_Card}
				info={info}
				refetch={fetchEvents}
			/>
			<ActivityListCard
				show={show_ActvList_card}
				setShow={setShow_ActvList_Card}
				activity={actvList_obj}
				refetch={fetchEvents}
			/>
		</div>
	);
}
