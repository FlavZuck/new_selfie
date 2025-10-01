"use server";

import { SessionPayload } from "@/app/lib/definitions/def_auth";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { COOKIE_SECURE} from "./cookie_config";

// Prendiamo la chiave segreta dalla variabile d'ambiente e la codifichiamo
const secretKey = process.env.SESSION_SECRET;
const encodedKey = new TextEncoder().encode(secretKey);

// Funzione per criptare il payload della sessione
export async function encrypt(payload: SessionPayload) {
	return new SignJWT(payload)
		.setProtectedHeader({ alg: "HS256" })
		.setIssuedAt()
		.setExpirationTime("7d")
		.sign(encodedKey);
}

// Funzione per decriptare il payload della sessione
export async function decrypt(session: string | undefined = "") {
	try {
		const { payload } = await jwtVerify(session, encodedKey, {
			algorithms: ["HS256"]
		});
		return payload;
	} catch {
		console.log("Failed to verify session");
	}
}

// Funzione per generare il token della sessione
export async function generateSessionToken(userId: string) {
	const expiresAt = new Date(Date.now() + 7 * 26 * 60 * 60 * 1000);
	return await encrypt({ userId, expiresAt });
}

// Funzione per aggiornare la sessione
export async function updateSession() {
	const session = (await cookies()).get("session")?.value;
	const payload = await decrypt(session);

	if (!session || !payload) {
		return null;
	}

	const expires = new Date(Date.now() + 7 * 26 * 60 * 60 * 1000);

	const cookieStore = await cookies();
	cookieStore.set("session", session, {
		httpOnly: true,
		secure: COOKIE_SECURE,
		expires,
		sameSite: "lax",
		path: "/"
	});
}

// Funzione per eliminare la sessione
export async function deleteSession() {
	const cookieStore = await cookies();
	cookieStore.delete("session");
}
