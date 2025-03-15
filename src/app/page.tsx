import "bootstrap/dist/css/bootstrap.min.css";
import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";

export default async function Home() {
	return (
		<div className={styles.page}>
			<main className={styles.main}>
				<h1 className={styles.title}>Benvenuto in Selfie</h1>
				<div className={styles.container}>
					<div className="row row-cols-sm-2 row-cols-md-3">
						<div className="col">
							<div
								className={styles.card}
								style={{
									width: "15rem",
									height: "22rem",
									position: "relative"
								}}
							>
								<Image
									className="card-img-top"
									src="/calendarlogo.png"
									alt="calendar Logo"
									width={286}
									height={180}
								/>
								<div className="card-body">
									<Image
										src="/calendarlogo.png"
										alt="calendar Logo"
										width={50}
										height={50}
									/>
									<h5 className="card-title">Calendario</h5>
									<p className="card-text">
										Gestisci i tuoi impegni giorno per
										giorno
									</p>
									<Link
										href="/calendar"
										className="stretched-link"
									/>
								</div>
							</div>
						</div>
						<div className="col">
							<div
								className={styles.card}
								style={{
									width: "15rem",
									height: "22rem",
									position: "relative"
								}}
							>
								<Image
									className="card-img-top"
									src="/notelogo.png"
									alt="Notes Logo"
									width={286}
									height={180}
								/>
								<div className="card-body">
									<Image
										src="/notelogo.png"
										alt="Notes Logo"
										width={50}
										height={50}
									/>
									<h5 className="card-title">Note</h5>
									<p className="card-text">
										Appuntati ciò che non vuoi dimenticare
									</p>
									<Link
										href="/notes"
										className="stretched-link"
									/>
								</div>
							</div>
						</div>
						<div className="col">
							<div
								className={styles.card}
								style={{
									width: "15rem",
									height: "22rem",
									position: "relative"
								}}
							>
								<Image
									className="card-img-top"
									src="/pomodorologo.png"
									alt="Pomodoro Logo"
									width={286}
									height={180}
								/>
								<div className="card-body">
									<Image
										src="/pomodorologo.png"
										alt="Pomodoro Logo"
										width={50}
										height={50}
									/>
									<h5 className="card-title">Pomodoro</h5>
									<p className="card-text">
										Pomodoro Timer per il tuo studio
									</p>
									<Link
										href="/pomodoro"
										className="stretched-link"
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
