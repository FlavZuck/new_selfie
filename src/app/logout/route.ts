import { redirect } from "next/navigation";
import isAuthenticated, { logout } from "../actions/auth";

//direi rimuovibile
export async function GET() {
	await logout();
}
