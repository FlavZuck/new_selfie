import styles from "@/app/page.module.css";
import Link from "next/link";
import LoginForm from "../ui/ui_auth/login-form";

export default function LoginPage() {
	return (
		<div className={styles.page}>
			<div className={styles.modalBackground}>
				<div className={styles.modal}>
					<Link href="/landing">
						<button className={styles.closeButton}>&times;</button>
					</Link>
					<h1>Login</h1>
					<LoginForm />
				</div>
			</div>
		</div>
	);
}
