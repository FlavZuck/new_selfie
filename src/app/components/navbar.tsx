import Link from "next/link";
import React from "react";
import isAuthenticated from "../actions/auth";

// Obblighiamo il componente a essere dinamico, in modo che venga ricaricato ogni volta
export const dynamic = "force-dynamic";

export default async function Navbar() {
	const authstatus = await isAuthenticated();

	return (
		<nav style={{ display: "flex", gap: "3rem" }}>
			<Link href="/">Home</Link>
			{authstatus ? (
				<>
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
