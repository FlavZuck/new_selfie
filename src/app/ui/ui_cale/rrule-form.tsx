"use client";

import styles from "@/app/page.module.css";
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
		<div>
			{/* FREQUENCY */}
			<div className={styles.formGroup}>
				<label htmlFor="frequency" className={styles.formLabel}>
					Frequenza
				</label>
				<select
					id="frequency"
					name="frequency"
					className={styles.formInput}
					onChange={(e) => {
						if (e.target.value === "DAILY") {
							setFreqform("DAILY");
						} else if (e.target.value === "WEEKLY") {
							setFreqform("WEEKLY");
						}
						if (e.target.value === "MONTHLY") {
							setFreqform("MONTHLY");
						} else if (e.target.value === "YEARLY") {
							setFreqform("YEARLY");
						}
					}}
				>
					<option value="DAILY">Ogni giorno</option>
					<option value="WEEKLY">Ogni settimana</option>
					<option value="MONTHLY">Ogni mese</option>
					<option value="YEARLY">Ogni anno</option>
				</select>
			</div>

			{/* WEEKLY */}
			<div hidden={Freqform !== "WEEKLY"}>
				<WeeklyHandler
					selectedDays={WeeklyHandlerProps.selectedDays}
					setSelectedDays={WeeklyHandlerProps.setSelectedDays}
				/>
			</div>

			{/* MONTHLY */}
			<div hidden={Freqform !== "MONTHLY"}>
				<MonthlyHandler />
			</div>

			{/* YEARLY */}
			<div hidden={Freqform !== "YEARLY"}>
				<YearlyHandler />
			</div>

			{/* UNDEF */}
			<div className={styles.formGroup}>
				<label htmlFor="undef" className={styles.formLabel}>
					Ricorrenza indefinita
				</label>
				<input
					type="checkbox"
					id="undef"
					name="undef"
					defaultChecked={true}
					onChange={(e) => {
						setUndef(e.target.checked);
						// If the checkbox is unchecked, set the count and until fields to empty
						if (!e.target.checked) {
							const countField = document.getElementById(
								"count"
							) as HTMLInputElement;
							const untilField = document.getElementById(
								"until"
							) as HTMLInputElement;
							if (countField) {
								countField.value = "0";
							}
							if (untilField) {
								untilField.value = "";
							}
						}
					}}
				/>
			</div>

			<div hidden={undef}>
				{/* COUNT */}
				<div className={styles.formGroup}>
					<label htmlFor="count" className={styles.formLabel}>
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
						className={styles.formInput}
					/>
				</div>

				{/* UNTIL */}
				<div className={styles.formGroup}>
					<label htmlFor="until" className={styles.formLabel}>
						Fino al
					</label>
					<input
						type="date"
						id="until"
						name="until"
						placeholder="Data di scadenza"
						className={styles.formInput}
					/>
				</div>
			</div>
		</div>
	);
}
