import EventForm from "../ui/event-form";
import styles from "./../page.module.css";

export default function Calendar() {
	return (
		<div className={styles.page}>
			<div className={styles.modal}>
				<h1>Event</h1>
				<EventForm />
			</div>
		</div>
	);
}
