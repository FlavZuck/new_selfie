import { RequestCookies } from "next/dist/compiled/@edge-runtime/cookies";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt } from "./app/lib/session";

export default async function isAuthenticated(biscottino: RequestCookies) {
	const sessionCookie = biscottino.get("session")?.value;

	const sessionData = sessionCookie ? await decrypt(sessionCookie) : null;
	const isAuthenticated = Boolean(sessionData && "userId" in sessionData);
	console.log("isAuthenticated", isAuthenticated);
	return isAuthenticated;
}

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;
	const cookie = request.cookies;

	if (
		pathname == "/" ||
		pathname.startsWith("/profile") ||
		pathname.startsWith("/logout") ||
		pathname.startsWith("/calendar") ||
		pathname.startsWith("/pomodoro") ||
		pathname.startsWith("/notes")
	) {
		if (await isAuthenticated(cookie)) {
			return NextResponse.next();
		} else {
			const url = request.nextUrl.clone();
			url.pathname = "/landing";
			return NextResponse.redirect(url);
		}
	} else {
		return NextResponse.next();
	}
}

// See "Matching Paths" below to learn more
export const config = {
	matcher: ["/(.*)"]
};
