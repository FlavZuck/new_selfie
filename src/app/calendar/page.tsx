"use client";

import { EventClickArg } from "@fullcalendar/core/index.js";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import rrulePlugin from "@fullcalendar/rrule";
import { useEffect, useState } from "react";
import { getAllActivities } from "../actions/cale_logic/activity_logic";
import { getAllEvents } from "../actions/cale_logic/event_logic";
import { getVirtualDate } from "../actions/timemach_logic";
import { Activity_FullCalendar } from "../lib/definitions/def_actv";
import { Event_FullCalendar } from "../lib/definitions/def_event";
import {
	ActivityCalendarCard,
	ActivityListCard
} from "../ui/ui_cale/actv-cards";
import ActivityForm from "../ui/ui_cale/actv-form";
import {
	ActvList,
	CompletedActvList,
	ExpActvList
} from "../ui/ui_cale/actv-list";
import EventCard from "../ui/ui_cale/event-card";
import EventForm from "../ui/ui_cale/event-form";
import { ExportButton } from "../ui/ui_cale/export-button";
import { ImportButton } from "../ui/ui_cale/import-button";
import UpdateActivityForm from "../ui/ui_cale/upd-actv";
import UpdateEventForm from "../ui/ui_cale/upd-event";
import "./calendar.css";

export default function PageCalendar() {
	// Stati per le fetch
	const [events, setEvents] = useState([]);
	const [allactv, setAllActv] = useState<Activity_FullCalendar[]>();
	const [now, setNow] = useState<Date>(new Date());

	// Stati per i modali per FullCalendar
	const [show_Event_create, setShow_Event_Create] = useState(false);
	const [show_Update_Event, setShow_Update_Event] = useState(false);
	const [show_Update_Activity, setShow_Update_Activity] = useState(false);
	const [show_Event_card, setShow_Event_Card] = useState(false);
	const [show_Activity_create, setShow_Activity_Create] = useState(false);
	const [show_Activity_card, setShow_Activity_Card] = useState(false);

	// Stato per il modale della ActivityList ed ExpActvList
	const [show_ActvList_card, setShow_ActvList_Card] = useState(false);
	const [show_ExpActvList_card, setShow_ExpActvList_Card] = useState(false);
	const [show_CompActv_card, setShowCompActv_Card] = useState(false);

	// Stato per l'oggetto dell'attività selezionata (ActivityList e ExpActvList)
	// entrambe le liste condividono lo stesso oggetto, dato che sono simili e solo una card può essere aperta alla volta
	const [actvList_obj, setActvList_obj] = useState<Activity_FullCalendar>();

	// Stato per l'oggetto dell'evento selezionato (FullCalendar)
	const [info, setInfo] = useState<EventClickArg | null>(null);

	// Stato per l'evento da aggiornare
	const [eventToUpdate, setEventToUpdate] =
		useState<Event_FullCalendar | null>(null);
	const [activityToUpdate, setActivityToUpdate] =
		useState<Activity_FullCalendar | null>(null);

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

	async function fetchVirtualDate() {
		try {
			const vd = await getVirtualDate();
			if (!vd) {
				console.log("No virtual date set, current date will be used.");
			} else {
				setNow(vd);
			}
		} catch (error) {
			console.error("Error fetching virtual date:", error);
		}
	}

	// UseEffect che si occupa di fetchare gli eventi,le attività e la data virtual
	useEffect(() => {
		fetchEvents();
		fetchVirtualDate();
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
					<ExportButton />
					<ImportButton />
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
				{/* FULLCALENDAR */}
				<div style={{ flex: "3" }}>
					<FullCalendar
						key={now.toISOString()} // forza il rerender del calendar quando cambia la virt_date
						plugins={[
							dayGridPlugin,
							interactionPlugin,
							rrulePlugin
						]}
						initialView="dayGridMonth"
						headerToolbar={{
							left: "prev,next today",
							center: "title",
							right: "dayGridMonth,dayGridWeek,dayGridDay"
						}}
						eventClick={function (info) {
							setInfo(info);
						}}
						now={now.toISOString()}
						selectable={true}
						events={events}
					/>
				</div>

				{/* LISTE */}
				<div>
					<div style={{ flex: "1" }}>
						<ActvList
							key={now.toISOString()} // forza il rerender della lista quando cambia la virt_date
							allactv={allactv ? allactv : []}
							listClick={show_ActvList_card}
							setListClick={setShow_ActvList_Card}
							activity={actvList_obj}
							set_activity={setActvList_obj}
							current_date={now}
						/>
					</div>
					<div>
						<ExpActvList
							key={now.toISOString()} // forza il rerender della lista quando cambia la virt_date
							allactv={allactv ? allactv : []}
							listClick={show_ExpActvList_card}
							setListClick={setShow_ExpActvList_Card}
							activity={actvList_obj}
							set_activity={setActvList_obj}
							current_date={now}
						/>
					</div>
					<div style={{ flex: "1" }}>
						<CompletedActvList
							key={now.toISOString()} // forza il rerender della lista quando cambia la virt_date
							allactv={allactv ? allactv : []}
							listClick={show_CompActv_card}
							setListClick={setShowCompActv_Card}
							activity={actvList_obj}
							set_activity={setActvList_obj}
							current_date={now}
						/>
					</div>
				</div>
			</div>

			{/* SEZIONE DEI MODALI */}
			<EventForm
				show={show_Event_create}
				setShow={setShow_Event_Create}
				refetch={fetchEvents}
			/>
			<UpdateEventForm
				show={show_Update_Event}
				setShow={setShow_Update_Event}
				refetch={fetchEvents}
				event={eventToUpdate}
			/>
			<EventCard
				show={show_Event_card}
				setShow={setShow_Event_Card}
				setEventToUpdate={setEventToUpdate}
				setShow_Update_Event={setShow_Update_Event}
				info={info}
				refetch={fetchEvents}
			/>
			<ActivityForm
				show={show_Activity_create}
				setShow={setShow_Activity_Create}
				refetch={fetchEvents}
			/>
			<UpdateActivityForm
				show={show_Update_Activity}
				setShow={setShow_Update_Activity}
				refetch={fetchEvents}
				activity={activityToUpdate}
			/>
			<ActivityCalendarCard
				show={show_Activity_card}
				setShow={setShow_Activity_Card}
				setActivity={setActivityToUpdate}
				setShow_Update_Event={setShow_Update_Activity}
				info={info}
				refetch={fetchEvents}
			/>
			<ActivityListCard
				show={show_ActvList_card}
				setShow={setShow_ActvList_Card}
				activity={actvList_obj}
				refetch={fetchEvents}
			/>
			<ActivityListCard
				show={show_ExpActvList_card}
				setShow={setShow_ExpActvList_Card}
				activity={actvList_obj}
				refetch={fetchEvents}
			/>
			<ActivityListCard
				show={show_CompActv_card}
				setShow={setShowCompActv_Card}
				activity={actvList_obj}
				refetch={fetchEvents}
			/>
		</div>
	);
}
