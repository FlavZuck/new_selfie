"use client";

import { EventClickArg } from "@fullcalendar/core/index.js";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import rrulePlugin from "@fullcalendar/rrule";
import { useEffect, useState } from "react";
import { getAllActivities } from "../actions/cale_logic/activity_logic";
import { getAllEvents } from "../actions/cale_logic/event_logic";
import { getPomoEvents } from "../actions/pomo_logic/pomoback_logic";
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

function currentDate(): Date {
	return new Date(Date.now() + 2 * 60 * 60 * 1000);
}

export default function PageCalendar() {
	// Stati per le fetch
	const [events, setEvents] = useState([]);
	const [allactv, setAllActv] = useState<Activity_FullCalendar[]>();
	const [now, setNow] = useState<Date>(currentDate());

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

	// NEW: stato per rilevare viewport mobile e tab selezionata per le liste
	const [isMobile, setIsMobile] = useState(false);
	const [mobileTab, setMobileTab] = useState<"actv" | "exp" | "comp">("actv");

	useEffect(() => {
		function handleResize() {
			if (typeof window !== "undefined") {
				setIsMobile(window.innerWidth < 576); // breakpoint Bootstrap xs
			}
		}
		handleResize();
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	// Funzione che si occupa di fetchare gli eventi ed attività
	// (da mettere apposto il tipaggio tbf)
	async function fetchEvents() {
		try {
			// Prendiamo gli eventi e le attività
			const fetchedPomoEvents = (await getPomoEvents()) || [];
			const fetchedEvents: Event_FullCalendar[] =
				(await getAllEvents()) || [];
			const fetchedActivities: Activity_FullCalendar[] =
				(await getAllActivities()) || [];
			// Uniamo i fetch per FullCalendar
			const united_fetch: any = [
				...fetchedEvents,
				...fetchedActivities,
				...fetchedPomoEvents
			];
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
		} else if (obj == "POMOEVENT") {
			// Quando si tocca un pomodoro event, si viene rimandati alla Pomodoro Page
			window.location.href = "/pomodoro";
		}
	}, [info]);

	// Header toolbar dinamico per mobile / desktop
	const calendarHeader = isMobile
		? { left: "prev,next", center: "title", right: "" }
		: {
				left: "prev,next today",
				center: "title",
				right: "dayGridMonth,dayGridWeek,dayGridDay"
			};

	return (
		<div className="container-fluid py-4">
			{/* Sezione controlli e legenda */}
			<div className="mb-4 d-flex flex-column gap-3">
				<div className="d-flex flex-wrap gap-2 align-items-center">
					<button
						className="btn btn-primary"
						onClick={() => setShow_Event_Create(true)}
					>
						Crea un Evento
					</button>
					<button
						className="btn btn-primary"
						onClick={() => setShow_Activity_Create(true)}
					>
						Crea una Attività
					</button>
					<ExportButton />
					<ImportButton refetch={fetchEvents} />
				</div>
				<div className="d-flex flex-wrap gap-4 align-items-center small">
					<span className="d-flex align-items-center gap-2">
						<span className="badge text-bg-primary">Attività</span>=
						blu
					</span>
					<span className="d-flex align-items-center gap-2">
						<span className="badge text-bg-danger">Evento</span>=
						rosso
					</span>
					<span className="d-flex align-items-center gap-2">
						<span className="badge text-bg-success">
							Evento Ricorrente
						</span>
						= verde
					</span>
				</div>
			</div>

			<div className="row g-4">
				<div className="col-12 col-lg-8">
					<div className="card shadow-sm">
						<div className="card-body">
							<FullCalendar
								key={
									now.toISOString() + (isMobile ? "-m" : "-d")
								}
								plugins={[
									dayGridPlugin,
									interactionPlugin,
									rrulePlugin
								]}
								initialView="dayGridMonth"
								headerToolbar={calendarHeader}
								eventClick={function (info) {
									setInfo(info);
								}}
								now={now.toISOString()}
								selectable={true}
								buttonText={
									isMobile
										? {
												oday: "Oggi",
												month: "Mese",
												week: "Sett",
												day: "Giorno"
											}
										: {
												oday: "Oggi",
												month: "Mese",
												week: "Settimana",
												day: "Giorno"
											}
								}
								events={events}
								height={isMobile ? "auto" : undefined}
							/>
						</div>
					</div>

					{/* Liste versione mobile (tabs) */}
					<div className="d-lg-none mt-4">
						<ul
							className="nav nav-pills nav-justified small mb-3"
							role="tablist"
						>
							<li className="nav-item" role="presentation">
								<button
									className={`nav-link ${mobileTab === "actv" ? "active" : ""}`}
									onClick={() => setMobileTab("actv")}
									type="button"
								>
									Attive
								</button>
							</li>
							<li className="nav-item" role="presentation">
								<button
									className={`nav-link ${mobileTab === "exp" ? "active" : ""}`}
									onClick={() => setMobileTab("exp")}
									type="button"
								>
									Scadute
								</button>
							</li>
							<li className="nav-item" role="presentation">
								<button
									className={`nav-link ${mobileTab === "comp" ? "active" : ""}`}
									onClick={() => setMobileTab("comp")}
									type="button"
								>
									Completate
								</button>
							</li>
						</ul>
						<div className="tab-content">
							<div
								className={`tab-pane fade ${mobileTab === "actv" ? "show active" : ""}`}
							>
								<ActvList
									key={"mob-actv-" + now.toISOString()}
									allactv={allactv ? allactv : []}
									listClick={show_ActvList_card}
									setListClick={setShow_ActvList_Card}
									activity={actvList_obj}
									set_activity={setActvList_obj}
									current_date={now}
								/>
							</div>
							<div
								className={`tab-pane fade ${mobileTab === "exp" ? "show active" : ""}`}
							>
								<ExpActvList
									key={"mob-exp-" + now.toISOString()}
									allactv={allactv ? allactv : []}
									listClick={show_ExpActvList_card}
									setListClick={setShow_ExpActvList_Card}
									activity={actvList_obj}
									set_activity={setActvList_obj}
									current_date={now}
								/>
							</div>
							<div
								className={`tab-pane fade ${mobileTab === "comp" ? "show active" : ""}`}
							>
								<CompletedActvList
									key={"mob-comp-" + now.toISOString()}
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
				</div>

				{/* Colonna liste desktop */}
				<div className="col-lg-4 d-none d-lg-flex flex-column gap-4">
					<div>
						<ActvList
							key={now.toISOString()}
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
							key={now.toISOString()}
							allactv={allactv ? allactv : []}
							listClick={show_ExpActvList_card}
							setListClick={setShow_ExpActvList_Card}
							activity={actvList_obj}
							set_activity={setActvList_obj}
							current_date={now}
						/>
					</div>
					<div>
						<CompletedActvList
							key={now.toISOString()}
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

			{/* Modali */}
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

			{/* Stili aggiuntivi per migliorare la leggibilità su mobile */}
			<style jsx global>{`
				@media (max-width: 575.98px) {
					.fc .fc-toolbar.fc-header-toolbar {
						flex-wrap: wrap;
						gap: 0.25rem;
					}
					.fc .fc-toolbar-title {
						font-size: 1.05rem;
					}
					.fc .fc-daygrid-day-number {
						font-size: 0.65rem;
					}
					.fc-daygrid-event {
						font-size: 0.55rem;
						padding: 0 2px;
					}
				}
			`}</style>
		</div>
	);
}
