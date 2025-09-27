"use client";

import { exportCalendar } from "@/app/actions/cale_logic/port_logic";

export function ExportButton() {
	const handleExport = async () => {
		try {
			const icalData = await exportCalendar();
			const blob = new Blob([icalData], { type: "text/calendar" });
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = "calendar.ics";
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
		} catch (error) {
			console.error("Error exporting calendar:", error);
			alert("Failed to export calendar.");
		}
	};

	return (
		<div>
			<button
				type="button"
				className="btn btn-outline-primary btn-sm"
				onClick={handleExport}
			>
				Esporta Calendario
			</button>
		</div>
	);
}
