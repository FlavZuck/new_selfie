"use client";

import { login } from "@/app/actions/auth_logic";
import { useRouter } from "next/navigation";
import { useActionState } from "react";

export default function LoginForm() {
	const [state, action, pending] = useActionState(login, undefined);
	const router = useRouter();

	return (
		<form action={action} className="vstack gap-3" noValidate>
			<div className="mb-2">
				<label htmlFor="email" className="form-label fw-medium">
					Email
				</label>
				<input
					id="email"
					name="email"
					placeholder="Email"
					className="form-control"
				/>
				{state?.errors?.email && (
					<p className="text-danger small mb-0 mt-1">
						{state.errors.email}
					</p>
				)}
			</div>
			<div className="mb-2">
				<label htmlFor="password" className="form-label fw-medium">
					Password
				</label>
				<input
					id="password"
					name="password"
					type="password"
					placeholder="Password"
					className="form-control"
				/>
				{state?.errors?.password && (
					<div className="mt-2">
						<p className="text-danger small mb-1 fw-semibold">
							Password must:
						</p>
						<ul className="text-danger small ps-3 mb-0">
							{state.errors.password.map((error) => (
								<li key={error}>{error}</li>
							))}
						</ul>
					</div>
				)}
			</div>
			{state?.error && (
				<div className="alert alert-danger py-2 mb-0" role="alert">
					{state.error}
				</div>
			)}
			<div className="d-flex flex-column flex-sm-row gap-2 mt-2">
				<button
					className="btn btn-primary flex-fill"
					disabled={pending}
					type="submit"
				>
					{pending ? "Logging in..." : "Login"}
				</button>
				<button
					type="button"
					className="btn btn-outline-secondary flex-fill"
					onClick={() => router.push("/register")}
				>
					Don&apos;t have an account?
				</button>
			</div>
		</form>
	);
}
