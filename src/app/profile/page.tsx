import { getCurrentUser } from "../actions/auth";
import styles from "../page.module.css";

export default async function ProfilePage() {
	const user = await getCurrentUser();
	if (!user) return <div>Not logged in</div>;

	return (
		<div className={styles.page}>
			<main className={styles.main}>
				<div>
					<h1>Profile</h1>
					<p>Name: {user.name}</p>
					<p>Surname: {user.surname}</p>
					<p>Email: {user.email}</p>
					<p>Birthday: {user.birthdate.toString()}</p>
				</div>
			</main>
		</div>
	);
}
