"use client";

import { login } from "@/app/actions/auth";
import { useRouter } from "next/navigation";
import { useActionState } from "react";

export default function LoginForm() {
	const [state, action, pending] = useActionState(login, undefined);
	const router = useRouter();

	return (
		<form action={action}>
			<div>
				<label htmlFor="email">Email </label>
				<input id="email" name="email" placeholder="Email" />
			</div>
			{state?.errors?.email && <p>{state.errors.email}</p>}

			<div>
				<label htmlFor="password">Password </label>
				<input
					id="password"
					name="password"
					type="password"
					placeholder="Password"
				/>
			</div>
			{state?.errors?.password && (
				<div>
					<p>Password must:</p>
					<ul>
						{state.errors.password.map((error) => (
							<li key={error}>- {error}</li>
						))}
					</ul>
				</div>
			)}

			{state?.error && <p>{state.error}</p>}
			<button disabled={pending} type="submit">
				{pending ? "Logging in..." : "Login"}
			</button>
			<button type="button" onClick={() => router.push("/register")}>
				Don&apos;t have an account?
			</button>
		</form>
	);
}
