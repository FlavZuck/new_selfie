import { logout } from "../actions/auth";

//direi rimuovibile
export async function GET() {
	await logout();
}
