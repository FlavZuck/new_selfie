"use client";

import { importCalendar } from "@/app/actions/cale_logic/port_logic";
import { useRef } from "react";

export function ImportButton({ refetch }: { refetch: () => void }) {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const handleImport = async (file: File) => {
		try {
			const icalData = await file.text();
			await importCalendar(icalData);
			refetch();
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
				ref={fileInputRef}
				style={{ display: "none" }}
			/>
			<button
				className="fc-custom-button"
				onClick={() => fileInputRef.current?.click()}
			>
				Importa Calendario
			</button>
		</div>
	);
}
