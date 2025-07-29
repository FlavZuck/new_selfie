import styles from "@/app/page.module.css";

// Function that takes selectedDays and srts them in the order of the week

type WeeklyHandlerProps = {
	selectedDays: string[];
	setSelectedDays: React.Dispatch<React.SetStateAction<string[]>>;
};
type MonthlyHandlerProps = {
	mh_day?: number;
};
type YearlyHandlerProps = {
	yh_day?: number;
	yh_month?: number;
};	

export function WeeklyHandler({
	selectedDays,
	setSelectedDays
}: WeeklyHandlerProps) {
	const days = [
		"Lunedì",
		"Martedì",
		"Mercoledì",
		"Giovedì",
		"Venerdì",
		"Sabato",
		"Domenica"
	];

	function handleCheckboxChange(day: string) {
		setSelectedDays((prev) => {
			if (prev.includes(day)) {
				return prev.filter((d) => d !== day);
			} else {
				const updated = [...prev, day];
				return updated.sort(
					(a, b) => days.indexOf(a) - days.indexOf(b)
				);
			}
		});
	}

	return (
		<div className={styles.formGroup}>
			{/* Use the hidden input to store the array of selected days as a string */}
			<input
				type="hidden"
				id="dayarray"
				name="dayarray"
				value={selectedDays}
			/>
			<label className={styles.label}>Seleziona i giorni</label>
			{days.map((day) => (
				<div key={day}>
					<input
						type="checkbox"
						id={day}
						onChange={() => {
							handleCheckboxChange(day);
						}}
						checked={selectedDays.includes(day)}
					/>
					<label htmlFor={day}>{day}</label>
				</div>
			))}
		</div>
	);
}

export function MonthlyHandler({ mh_day = new Date().getDate() }: MonthlyHandlerProps) {
	return (
		<div>
			<label htmlFor="mh_day">Giorno del mese</label>
			<input
				type="number"
				id="mh_day"
				name="mh_day"
				defaultValue={mh_day}
				min="1"
				max="31"
			/>
		</div>
	);
}

export function YearlyHandler(
	{ yh_day = new Date().getDate(), yh_month = new Date().getMonth() }: YearlyHandlerProps
) {
	return (
		<div>
			<label htmlFor="yh_day">Giorno</label>
			<input
				type="number"
				id="yh_day"
				name="yh_day"
				defaultValue={yh_day}
				min="1"
				max="31"
			/>
			<label htmlFor="yh_month">Mese</label>
			<input
				type="number"
				id="yh_month"
				name="yh_month"
				defaultValue={yh_month}
				min="1"
				max="12"
			/>
		</div>
	);
}
