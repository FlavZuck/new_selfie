"use client";

import { importCalendar } from "@/app/actions/cale_logic/port_logic";

export function ImportButton() {
	const handleImport = async (file: File) => {
		try {
			const icalData = await file.text();
			await importCalendar(icalData);
			alert("Calendar imported successfully!");
		} catch (error) {
			console.error("Error importing calendar:", error);
			alert("Failed to import calendar.");
		}
	};

	return (
		<div>
			<input
				type="file"
				accept=".ics"
				onChange={(e) => {
					if (e.target.files && e.target.files[0]) {
						handleImport(e.target.files[0]);
					}
				}}
			/>
		</div>
	);
}
