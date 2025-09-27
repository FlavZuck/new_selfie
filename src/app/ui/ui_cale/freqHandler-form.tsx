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
		<div className="mb-3">
			<input
				type="hidden"
				id="dayarray"
				name="dayarray"
				value={selectedDays}
			/>
			<label className="form-label fw-medium d-block mb-2">
				Seleziona i giorni
			</label>
			<div className="d-flex flex-wrap gap-3">
				{days.map((day) => (
					<div className="form-check" key={day}>
						<input
							className="form-check-input"
							type="checkbox"
							id={day}
							onChange={() => handleCheckboxChange(day)}
							checked={selectedDays.includes(day)}
						/>
						<label className="form-check-label" htmlFor={day}>
							{day}
						</label>
					</div>
				))}
			</div>
		</div>
	);
}

export function MonthlyHandler({
	mh_day = new Date().getDate()
}: MonthlyHandlerProps) {
	return (
		<div className="mb-3">
			<label htmlFor="mh_day" className="form-label fw-medium">
				Giorno del mese
			</label>
			<input
				type="number"
				id="mh_day"
				name="mh_day"
				defaultValue={mh_day}
				min="1"
				max="31"
				className="form-control"
			/>
		</div>
	);
}

export function YearlyHandler({
	yh_day = new Date().getDate(),
	yh_month = new Date().getMonth()
}: YearlyHandlerProps) {
	return (
		<div className="row g-3">
			<div className="col-sm-6">
				<label htmlFor="yh_day" className="form-label fw-medium">
					Giorno
				</label>
				<input
					type="number"
					id="yh_day"
					name="yh_day"
					defaultValue={yh_day}
					min="1"
					max="31"
					className="form-control"
				/>
			</div>
			<div className="col-sm-6">
				<label htmlFor="yh_month" className="form-label fw-medium">
					Mese
				</label>
				<input
					type="number"
					id="yh_month"
					name="yh_month"
					defaultValue={yh_month}
					min="1"
					max="12"
					className="form-control"
				/>
			</div>
		</div>
	);
}
