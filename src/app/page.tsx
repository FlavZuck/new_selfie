import "bootstrap/dist/css/bootstrap.min.css";
import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";

export default async function Home() {
	return (
		<div className={styles.page}>
			{/* === HERO SECTION === */}
			<div className="bg-primary text-white py-5 mb-5">
				<div className="container">
					<div className="row align-items-center">
						<div className="col-lg-6">
							<h1 className="display-4 fw-bold">
								Benvenuto in Selfie
							</h1>
							<p className="lead">
								Il tuo assistente personale per organizzare al
								meglio il tuo tempo e aumentare la tua
								produttività.
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* === FEATURES SECTION === */}
			<div className="container mb-5">
				<h2 className="text-center mb-4">I nostri strumenti</h2>
				<div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-4">
					{/* --- Calendar Card --- */}
					<div className="col">
						<div
							className={`card h-100 shadow-sm hover-card ${styles.cardCalendar}`}
						>
							<div className="card-body text-center">
								<div className={styles.iconWrapperCalendar}>
									<Image
										src="/calendarlogo.png"
										alt="Calendar"
										width={60}
										height={60}
										className={styles.icon}
										priority
									/>
								</div>
								<h5 className="card-title mt-3">Calendario</h5>
								<p className="card-text">
									Organizza i tuoi impegni con un calendario
									intelligente e intuitivo
								</p>
								<Link
									href="/calendar"
									className={`btn stretched-link ${styles.btnCalendar}`}
								>
									Vai al Calendario
								</Link>
							</div>
						</div>
					</div>

					{/* --- Notes Card --- */}
					<div className="col">
						<div
							className={`card h-100 shadow-sm hover-card ${styles.cardNotes}`}
						>
							<div className="card-body text-center">
								<div className={styles.iconWrapperNotes}>
									<Image
										src="/notelogo.png"
										alt="Notes"
										width={40}
										height={40}
										className={styles.icon}
									/>
								</div>
								<h5 className="card-title mt-3">Note</h5>
								<p className="card-text">
									Cattura le tue idee al volo e organizzale in
									modo efficiente
								</p>
								<Link
									href="/notes"
									className={`btn stretched-link ${styles.btnNotes}`}
								>
									Vai alle Note
								</Link>
							</div>
						</div>
					</div>

					{/* --- Pomodoro Card --- */}
					<div className="col">
						<div
							className={`card h-100 shadow-sm hover-card ${styles.cardPomodoro}`}
						>
							<div className="card-body text-center">
								<div className={styles.iconWrapperPomodoro}>
									<Image
										src="/pomodorologo.png"
										alt="Pomodoro"
										width={40}
										height={40}
										className={styles.icon}
									/>
								</div>
								<h5 className="card-title mt-3">
									Pomodoro Timer
								</h5>
								<p className="card-text">
									Massimizza la tua concentrazione con il
									metodo Pomodoro
								</p>
								<Link
									href="/pomodoro"
									className={`btn stretched-link ${styles.btnPomodoro}`}
								>
									Vai al Timer
								</Link>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* === FOOTER SECTION === */}
			<footer className="bg-dark text-white py-4 mt-5">
				<div className="container">
					<div className="row">
						<div className="col-md-6">
							<h5>Selfie</h5>
							<p>
								Il tuo assistente personale per la produttività
							</p>
						</div>
					</div>
				</div>
			</footer>
		</div>
	);
}
