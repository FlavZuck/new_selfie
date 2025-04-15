import { Activity_FullCalendar } from "@/app/lib/definitions/def_actv";

type ActvListProps = {
	allactv: Activity_FullCalendar[];
	listClick: boolean;
	setListClick: (listClick: boolean) => void;
	activity: Activity_FullCalendar | undefined;
	set_activity: (activity: Activity_FullCalendar | undefined) => void;
};

// Componente ActvList per il rendering della lista delle attività
export default function ActvList({
	allactv,
	setListClick,
	set_activity
}: ActvListProps) {
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
				{allactv.map((activity: Activity_FullCalendar) => (
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
