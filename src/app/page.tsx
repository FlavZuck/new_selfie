import Image from "next/image";
import styles from "./page.module.css";
import Link from "next/link";

export default function Home() {
	return (
		<div className={styles.page}>
			<main className={styles.main}>
				<h1>SELFIE</h1>
				<Image
					src="/bradipo.webp"
					alt="Next.js logo"
					width={180}
					height={180}
					priority
				/>
				<div className={styles.ctas}>
					<Link href="/calendar" className={styles.primary}>
						<Image
							src="/calendarlogo.png"
							alt="calendar Logo"
							width={20}
							height={20}
						/>
						Calendario
					</Link>
				</div>
				<div className={styles.ctas}>
					<Link href="/notes" className={styles.primary}>
						<Image
							src="/notelogo.png"
							alt="Note Logo"
							width={20}
							height={20}
							className={styles.secondary}
						/>
						Note
					</Link>
				</div>
				<div className={styles.ctas}>
					<Link href="/login" className={styles.primary}>
						<Image
							src="/notelogo.png"
							alt="Note Logo"
							width={20}
							height={20}
							className={styles.secondary}
						/>
						Login
					</Link>
				</div>
				<div className={styles.ctas}>
					<Link href="/register" className={styles.primary}>
						<Image
							src="/notelogo.png"
							alt="Note Logo"
							width={20}
							height={20}
							className={styles.secondary}
						/>
						Register
					</Link>
				</div>
			</main>
		</div>
	);
}
