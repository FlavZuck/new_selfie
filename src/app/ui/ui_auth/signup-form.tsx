"use client";

import { signup } from "@/app/actions/auth_logic";
import styles from "@/app/page.module.css";
import { useRouter } from "next/navigation";
import { useActionState } from "react";

export default function SignupForm() {
	const [state, action, pending] = useActionState(signup, undefined);
	const router = useRouter();

	return (
		<form action={action}>
			<div>
				<label htmlFor="name">Name </label>
				<input id="name" name="name" placeholder="Name" />
			</div>
			{state?.errors?.name && <p>{state.errors.name}</p>}

			<div>
				<label htmlFor="surname">Surname </label>
				<input id="surname" name="surname" placeholder="Surname" />
			</div>
			{state?.errors?.surname && <p>{state.errors.surname}</p>}

			<div>
				<label htmlFor="birthdate">Date of birth </label>
				<input type="date" id="birthdate" name="birthdate" />
			</div>
			{state?.errors?.birthdate && <p>{state.errors.birthdate}</p>}

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
			<button className={styles.button} disabled={pending} type="submit">
				{pending ? "Signing up..." : "Sign Up"}
			</button>
			<button
				className={styles.button}
				style={{ backgroundColor: "rgb(179, 19, 19)" }}
				type="button"
				onClick={() => router.push("/login")}
			>
				Already have an account?
			</button>
		</form>
	);
}
