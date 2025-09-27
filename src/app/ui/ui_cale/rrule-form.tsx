"use client";

import {
	MonthlyHandler,
	WeeklyHandler,
	YearlyHandler
} from "./freqHandler-form";

// La seguente funzione viene chiamata per completare il form event-form.tsx
type RRuleFormProps = {
	// This is the frequency state
	Freqform: string;
	setFreqform: React.Dispatch<React.SetStateAction<string>>;
	// This is the state of the indefinite checkbox
	undef: boolean;
	setUndef: React.Dispatch<React.SetStateAction<boolean>>;
	// This is the props for the WeeklyHandler
	WeeklyHandlerProps: {
		selectedDays: string[];
		setSelectedDays: React.Dispatch<React.SetStateAction<string[]>>;
	};
};

export default function RRuleForm({
	Freqform,
	setFreqform,
	undef,
	setUndef,
	WeeklyHandlerProps
}: RRuleFormProps) {
	return (
		<div className="border rounded-3 p-3 bg-body-tertiary">
			<div className="mb-3">
				<label htmlFor="frequency" className="form-label fw-medium">
					Frequenza
				</label>
				<select
					id="frequency"
					name="frequency"
					className="form-select"
					onChange={(e) => {
						if (e.target.value === "DAILY") setFreqform("DAILY");
						else if (e.target.value === "WEEKLY")
							setFreqform("WEEKLY");
						else if (e.target.value === "MONTHLY")
							setFreqform("MONTHLY");
						else if (e.target.value === "YEARLY")
							setFreqform("YEARLY");
					}}
				>
					<option value="DAILY">Ogni giorno</option>
					<option value="WEEKLY">Ogni settimana</option>
					<option value="MONTHLY">Ogni mese</option>
					<option value="YEARLY">Ogni anno</option>
				</select>
			</div>
			<div hidden={Freqform !== "WEEKLY"}>
				<WeeklyHandler
					selectedDays={WeeklyHandlerProps.selectedDays}
					setSelectedDays={WeeklyHandlerProps.setSelectedDays}
				/>
			</div>
			<div hidden={Freqform !== "MONTHLY"}>
				<MonthlyHandler />
			</div>
			<div hidden={Freqform !== "YEARLY"}>
				<YearlyHandler />
			</div>
			<div className="form-check form-switch mb-3">
				<input
					className="form-check-input"
					type="checkbox"
					id="undef"
					name="undef"
					checked={undef}
					onChange={(e) => {
						setUndef(e.target.checked);
						if (!e.target.checked) {
							const countField = document.getElementById(
								"count"
							) as HTMLInputElement;
							const untilField = document.getElementById(
								"until"
							) as HTMLInputElement;
							if (countField) countField.value = "0";
							if (untilField) untilField.value = "";
						}
					}}
				/>
				<label className="form-check-label" htmlFor="undef">
					Ricorrenza indefinita
				</label>
			</div>
			<div hidden={undef} className="row g-3">
				<div className="col-sm-6">
					<label htmlFor="count" className="form-label fw-medium">
						Numero di occorrenze
					</label>
					<input
						type="number"
						id="count"
						name="count"
						min={0}
						max={100}
						defaultValue={0}
						placeholder="Numero di occorrenze"
						className="form-control"
					/>
				</div>
				<div className="col-sm-6">
					<label htmlFor="until" className="form-label fw-medium">
						Fino al
					</label>
					<input
						type="date"
						id="until"
						name="until"
						placeholder="Data di scadenza"
						className="form-control"
					/>
				</div>
			</div>
		</div>
	);
}
