import PomodoroTimer from "../ui/ui_pomo/pomo-form";
import PomoEventForm from "../ui/ui_pomo/pomoevent-form";

export default function Pomodoro() {
	return (
		<div className="container-fluid py-4">
			<div className="row g-4">
				<div className="col-lg-8">
					<div className="card h-100">
						<div className="card-body text-center">
							<h2 className="card-title h3 mb-4 d-flex align-items-center justify-content-center">
								<i className="bi bi-stopwatch me-2"></i>
							</h2>
							<PomodoroTimer />
						</div>
					</div>
				</div>
				<div className="col-lg-4">
					<div className="card h-100">
						<div className="card-body">
							<h2 className="card-title h5 mb-3 d-flex align-items-center">
								<i className="bi bi-calendar-check me-2"></i>
								PomoEvento
							</h2>
							<div className="mb-4 small text-muted">
								<p className="mb-2">
									Un <strong>PomoEvento</strong> è un blocco
									pianificato composto da un Pomodoro con un
									numero di cicli a scelta (studio 30min +
									pausa 5min), pensato per programmare le tue
									sessioni di studio.
								</p>
								<ul className="ps-3 mb-2">
									<li>
										Definisci un <em>titolo chiaro</em> (es:
										&quot;Capitolo 3 Fisica&quot;).
									</li>
									<li>
										Imposta i <em>cicli</em> in base a
										quanto materiale vuoi coprire.
									</li>
									<li>
										Usa la <em>data di inizio</em> per
										pianificare e monitorare la
										progressione.
									</li>
									<li>
										Registra cosa hai completato al termine
										di ogni ciclo.
									</li>
								</ul>
								<div className="alert alert-info py-2 px-3 mb-0">
									<i className="bi bi-lightbulb me-1"></i>
									Suggerimento: parti con pochi cicli (2-3) e
									aumenta se mantieni la concentrazione.
								</div>
							</div>
							<PomoEventForm />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
