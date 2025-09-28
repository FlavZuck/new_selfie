import Image from "next/image";
import Link from "next/link";

export default function Landing() {
	return (
		<div className="min-vh-100 d-flex flex-column bg-light">
			<div className="flex-grow-1 d-flex align-items-center justify-content-center py-5 px-3">
				<div
					className="bg-white border rounded-4 shadow-lg p-4 p-md-5 text-center"
					style={{ maxWidth: 520, width: "100%" }}
				>
					<h1 className="mb-4 fw-bold">Welcome to Selfie</h1>
					<div
						className="ratio ratio-1x1 mb-4"
						style={{ maxWidth: 320, margin: "0 auto" }}
					>
						<Image
							className="object-fit-contain rounded"
							src="/BarryTheBradypus.jpeg"
							alt="Bradipo Logo"
							fill
							priority
						/>
					</div>
					<p className="mb-4 text-secondary">
						Please log in or register to continue.
					</p>
					<div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
						<Link
							href="/login"
							className="btn btn-primary px-4 fw-medium"
						>
							Login
						</Link>
						<Link
							href="/register"
							className="btn btn-outline-primary px-4 fw-medium"
						>
							Register
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
