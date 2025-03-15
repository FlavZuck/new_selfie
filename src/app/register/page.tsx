import styles from "@/app/page.module.css";
import Link from "next/link";
import SignupForm from "../ui/signup-form";

export default function RegisterPage() {
	return (
		<div className={styles.page}>
			<div className={styles.modalBackground}>
				<div className={styles.modal}>
					<Link href="/landing">
						<button className={styles.closeButton}>&times;</button>
					</Link>
					<h1>Register</h1>
					<SignupForm />
				</div>
			</div>
		</div>
	);
}
