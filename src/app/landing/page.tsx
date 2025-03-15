import styles from "@/app/page.module.css";
import Image from "next/image";
import Link from "next/link";

export default function Landing() {
	return (
		<div className={styles.page}>
			<div className={styles.modalBackground}>
				<div className={styles.modal}>
					<h1>Welcome to Selfie</h1>
					<Image
						className="card-img-top"
						src="/bradipo.webp"
						alt="Bradipo Logo"
						width={500}
						height={500}
					/>
					<p>Please log in or register to continue.</p>
					<div>
						<Link href="/login">
							<button className={styles.button}>Login</button>
						</Link>
						<Link href="/register">
							<button className={styles.button}>Register</button>
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
