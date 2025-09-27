"use client";

import { update_activity } from "@/app/actions/cale_logic/activity_logic";
import { Activity_FullCalendar } from "@/app/lib/definitions/def_actv";
import { useActionState, useEffect } from "react";

type ActivityFormProps = {
	show: boolean;
	setShow: (show: boolean) => void;
	refetch: () => Promise<void>;
	activity: Activity_FullCalendar | null;
};

export default function UpdateActivityForm({
	show,
	setShow,
	refetch,
	activity
}: ActivityFormProps) {
	let activity_id = "";

	if (activity) {
		activity_id = activity.id;
	}

	// This is a custom hook that manages the state of the action
	// Magia nera, come sempre
	const [state, action, pending] = useActionState(
		update_activity.bind(null, activity_id),
		undefined
	);

	// This function will be called when the activity is updated and calls the refetch function to update the activities
	function handleActivityUpdate() {
		if (state?.message && !state?.errors && !pending) {
			refetch();
			setShow(false);
		}
	}

	// This useEffect will refetch the activities only when the state changes or the pending state changes
	useEffect(() => {
		// This is used to refetch the activities when an activity is updated
		handleActivityUpdate();
		// This comment is to avoid the exhaustive-deps warning from eslint
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [pending]);

	if (!show || !activity) {
		return <div></div>;
	}

	return (
		<div
			className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex align-items-start justify-content-center py-4 overflow-auto"
			style={{ zIndex: 1050 }}
		>
			<div
				className="bg-white rounded-4 shadow-lg p-4 w-100 position-relative"
				style={{ maxWidth: 560 }}
			>
				<button
					type="button"
					className="btn-close position-absolute end-0 top-0 m-3"
					onClick={() => setShow(false)}
					aria-label="Close"
				/>
				<h5 className="mb-4 fw-semibold text-primary">
					Modifica Attività
				</h5>
				<form action={action} className="vstack gap-3">
					<div className="mb-1">
						<label htmlFor="title" className="form-label fw-medium">
							Titolo
						</label>
						<input
							id="title"
							name="title"
							placeholder="Titolo"
							defaultValue={activity.title}
							required
							className="form-control"
						/>
						{state?.errors?.title && (
							<p className="text-danger small mb-0 mt-1">
								{state.errors.title}
							</p>
						)}
					</div>
					<div className="mb-1">
						<label htmlFor="place" className="form-label fw-medium">
							Luogo
						</label>
						<input
							id="place"
							name="place"
							placeholder="Luogo"
							defaultValue={activity.extendedProps.place}
							className="form-control"
						/>
						{state?.errors?.place && (
							<p className="text-danger small mb-0 mt-1">
								{state.errors.place}
							</p>
						)}
					</div>
					<div className="mb-1">
						<label
							htmlFor="description"
							className="form-label fw-medium"
						>
							Descrizione
						</label>
						<input
							id="description"
							name="description"
							placeholder="Descrizione"
							defaultValue={activity.extendedProps.description}
							required
							className="form-control"
						/>
						{state?.errors?.description && (
							<p className="text-danger small mb-0 mt-1">
								{state.errors.description}
							</p>
						)}
					</div>
					<button
						className="btn btn-primary w-100"
						disabled={pending}
						type="submit"
					>
						{pending ? "Updating event..." : "Update Event"}
					</button>
				</form>
			</div>
		</div>
	);
}
