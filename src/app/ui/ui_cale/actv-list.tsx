import { Activity_FullCalendar } from "@/app/lib/definitions/def_actv";

// Funzione per filtrare le attività scadute e ritornare solo quest'ultime, se filter_exp è false
// nel caso filter_exp è true, vengono ritornate solo le attività NON scadute
function ExpActvList_filter(
	activity_array: Activity_FullCalendar[],
	current_date: Date,
	filter_exp: boolean = false
): Activity_FullCalendar[] {
	if (filter_exp === false) {
		// Filtriamo le attività e ritorniamo solo quelle scadute
		const filtered_activities = activity_array.filter((activity) => {
			const expiration_date = new Date(activity.start);
			return expiration_date < current_date;
		});
		return filtered_activities;
	} else {
		// Filtriamo le attività e ritorniamo solo quelle NON scadute
		const filtered_activities = activity_array.filter((activity) => {
			const expiration_date = new Date(activity.start);
			return expiration_date >= current_date;
		});
		return filtered_activities;
	}
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
	// Filtriamo le attività e ritorniamo solo quelle NON scadute
	const filtered_activities = ExpActvList_filter(allactv, current_date, true);

	return (
		<div
			className="actv-list-container"
			style={{
				padding: "1rem",
				backgroundColor: "#fff",
				borderRadius: "8px",
				boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
				margin: "1rem 0",
				border: "1px solid #ddd"
			}}
		>
			<h2
				style={{
					borderBottom: "2px solid #2c3e50",
					paddingBottom: "0.5rem",
					marginBottom: "1rem",
					fontSize: "1.2rem",
					color: "#2c3e50"
				}}
			>
				Lista delle attività
			</h2>
			<div
				className="actv-list"
				style={{
					maxHeight: "calc(100vh - 500px)",
					minHeight: "200px",
					overflowY: "auto",
					padding: "0.5rem"
				}}
			>
				{filtered_activities.map((activity: Activity_FullCalendar) => (
					<div
						key={activity.id}
						style={{
							padding: "0.8rem",
							marginBottom: "0.5rem",
							borderLeft: "3px solid #3788d8",
							backgroundColor: "#f8f9fa",
							borderRadius: "4px",
							transition: "background-color 0.2s",
							cursor: "pointer"
						}}
						onMouseOver={(e) =>
							(e.currentTarget.style.backgroundColor = "#eef1f5")
						}
						onMouseOut={(e) =>
							(e.currentTarget.style.backgroundColor = "#f8f9fa")
						}
						onClick={() => {
							// Handle click event
							setListClick(true);
							set_activity(activity);
						}}
					>
						<h3
							style={{
								margin: "0 0 0.5rem 0",
								fontSize: "1rem",
								color: "#2c3e50"
							}}
						>
							{activity.title}
						</h3>
						<p
							style={{
								margin: 0,
								fontSize: "0.9rem",
								color: "#666"
							}}
						>
							{new Date(activity.start).toDateString()}
						</p>
					</div>
				))}
			</div>
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
	const filtered_activities = ExpActvList_filter(allactv, current_date);

	return (
		<div
			className="actv-list-container"
			style={{
				padding: "1rem",
				backgroundColor: "#fff",
				borderRadius: "8px",
				boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
				margin: "1rem 0",
				border: "1px solid #ddd"
			}}
		>
			<h2
				style={{
					borderBottom: "2px solid #2c3e50",
					paddingBottom: "0.5rem",
					marginBottom: "1rem",
					fontSize: "1.2rem",
					color: "#2c3e50"
				}}
			>
				Lista attività scadute
			</h2>
			<div
				className="actv-list"
				style={{
					maxHeight: "calc(100vh - 500px)",
					minHeight: "200px",
					overflowY: "auto",
					padding: "0.5rem"
				}}
			>
				{filtered_activities.map((activity: Activity_FullCalendar) => (
					<div
						key={activity.id}
						style={{
							padding: "0.8rem",
							marginBottom: "0.5rem",
							borderLeft: "3px solid #3788d8",
							backgroundColor: "#f8f9fa",
							borderRadius: "4px",
							transition: "background-color 0.2s",
							cursor: "pointer"
						}}
						onMouseOver={(e) =>
							(e.currentTarget.style.backgroundColor = "#eef1f5")
						}
						onMouseOut={(e) =>
							(e.currentTarget.style.backgroundColor = "#f8f9fa")
						}
						onClick={() => {
							// Handle click event
							setListClick(true);
							set_activity(activity);
						}}
					>
						<h3
							style={{
								margin: "0 0 0.5rem 0",
								fontSize: "1rem",
								color: "#2c3e50"
							}}
						>
							{activity.title}
						</h3>
						<p
							style={{
								margin: 0,
								fontSize: "0.9rem",
								color: "#666"
							}}
						>
							{new Date(activity.start).toDateString()}
						</p>
					</div>
				))}
			</div>
		</div>
	);
}
