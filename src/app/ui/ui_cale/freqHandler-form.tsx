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
			<label className={styles.formLabel}>Seleziona i giorni</label>
			{days.map((day) => (
				<div key={day} style={{ margin: "0.5rem 0" }}>
					<input
						type="checkbox"
						id={day}
						onChange={() => {
							handleCheckboxChange(day);
						}}
						checked={selectedDays.includes(day)}
						style={{ marginRight: "0.5rem" }}
					/>
					<label htmlFor={day} style={{ fontWeight: "normal" }}>
						{day}
					</label>
				</div>
			))}
		</div>
	);
}

export function MonthlyHandler({
	mh_day = new Date().getDate()
}: MonthlyHandlerProps) {
	return (
		<div className={styles.formGroup}>
			<label htmlFor="mh_day" className={styles.formLabel}>
				Giorno del mese
			</label>
			<input
				type="number"
				id="mh_day"
				name="mh_day"
				defaultValue={mh_day}
				min="1"
				max="31"
				className={styles.formInput}
			/>
		</div>
	);
}

export function YearlyHandler({
	yh_day = new Date().getDate(),
	yh_month = new Date().getMonth()
}: YearlyHandlerProps) {
	return (
		<div>
			<div className={styles.formGroup}>
				<label htmlFor="yh_day" className={styles.formLabel}>
					Giorno
				</label>
				<input
					type="number"
					id="yh_day"
					name="yh_day"
					defaultValue={yh_day}
					min="1"
					max="31"
					className={styles.formInput}
				/>
			</div>
			<div className={styles.formGroup}>
				<label htmlFor="yh_month" className={styles.formLabel}>
					Mese
				</label>
				<input
					type="number"
					id="yh_month"
					name="yh_month"
					defaultValue={yh_month}
					min="1"
					max="12"
					className={styles.formInput}
				/>
			</div>
		</div>
	);
}
