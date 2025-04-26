import Link from "next/link";
import React from "react";
import isAuthenticated from "../actions/auth";
import { getCurrentUser } from "../actions/auth";

// Obblighiamo il componente a essere dinamico, in modo che venga ricaricato ogni volta
export const dynamic = "force-dynamic";

export default async function Navbar() {
	const authstatus = await isAuthenticated();

	return (
		<nav style={{ display: "flex", marginLeft: "auto", gap: "3rem" }}>
			{authstatus ? (
				<>
					<div>
						Logged in as{" "}
						<Link href="/profile">
							{(await getCurrentUser())?.name}
						</Link>
					</div>
					<Link href="/logout">Logout</Link>
				</>
			) : (
				<>
					<Link href="/login">Login</Link>
					<Link href="/register">Register</Link>
				</>
			)}
		</nav>
	);
}
