import { getCurrentUser } from "../actions/auth_logic";

export default async function ProfilePage() {
	const user = await getCurrentUser();
	if (!user)
		return (
			<div className="container py-5">
				<div className="alert alert-warning">Not logged in</div>
			</div>
		);

	// Helpers per avatar (fallback iniziali) ((santo cielo che casino))
	const initials =
		`${(user.name || "").charAt(0)}${(user.surname || "").charAt(0)}`.toUpperCase();
	const formattedBirthday = (() => {
		try {
			const d = new Date(user.birthdate);
			return isNaN(d.getTime())
				? user.birthdate.toString()
				: d.toLocaleDateString();
		} catch {
			return user.birthdate.toString();
		}
	})();

	return (
		<div className="container py-5">
			<main className="row justify-content-center">
				<div className="col-12 col-lg-10 col-xl-8">
					<div className="card border-0 shadow-lg overflow-hidden rounded-4">
						{/* Header gradient */}
						<div
							className="position-relative"
							style={{
								background:
									"linear-gradient(135deg, #0d6efd, #6610f2)",
								height: 160
							}}
						>
							<div
								className="position-absolute start-50 translate-middle-x"
								style={{ bottom: -56 }}
							>
								<div
									className="rounded-circle bg-white shadow d-flex align-items-center justify-content-center"
									style={{ width: 112, height: 112 }}
								>
									<div
										className="rounded-circle bg-primary text-white fw-semibold d-flex align-items-center justify-content-center"
										style={{
											width: 100,
											height: 100,
											fontSize: 34
										}}
									>
										{initials}
									</div>
								</div>
							</div>
						</div>
						<div className="pt-5 px-4 px-md-5 pb-4 pb-md-5">
							<div className="text-center mb-4">
								<h1 className="h2 fw-bold mb-1">
									{user.name} {user.surname}
								</h1>
								<p className="text-secondary mb-2">
									{user.email}
								</p>
							</div>
							<hr className="my-4" />
							<div className="row g-4 justify-content-center">
								<div className="col-12 col-md-8 text-center mx-auto">
									<h2 className="h6 text-uppercase text-secondary fw-semibold mb-3">
										Informazioni
									</h2>
									<ul className="list-unstyled vstack gap-2 mb-0 small">
										<li>
											<span className="text-secondary d-block">
												Nome
											</span>
											<span className="fw-medium">
												{user.name}
											</span>
										</li>
										<li>
											<span className="text-secondary d-block">
												Cognome
											</span>
											<span className="fw-medium">
												{user.surname}
											</span>
										</li>
										<li>
											<span className="text-secondary d-block">
												Email
											</span>
											<span className="fw-medium">
												{user.email}
											</span>
										</li>
										<li>
											<span className="text-secondary d-block">
												Data di nascita
											</span>
											<span className="fw-medium">
												{formattedBirthday}
											</span>
										</li>
									</ul>
								</div>
							</div>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
