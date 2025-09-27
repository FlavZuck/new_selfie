import Link from "next/link";
import SignupForm from "../ui/ui_auth/signup-form";

export default function RegisterPage() {
	return (
		<div className="min-vh-100 d-flex flex-column bg-light">
			<div className="flex-grow-1 d-flex align-items-center justify-content-center py-5 px-3">
				<div
					className="position-relative bg-white border rounded-4 shadow p-4 p-md-5"
					style={{ maxWidth: 480, width: "100%" }}
				>
					<Link
						href="/landing"
						className="btn-close position-absolute top-0 end-0 m-3"
						aria-label="Close"
					/>
					<h1 className="mb-4 fw-semibold text-center">Register</h1>
					<SignupForm />
				</div>
			</div>
		</div>
	);
}
