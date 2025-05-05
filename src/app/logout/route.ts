import { logout } from "../actions/auth_logic";

//direi rimuovibile
export async function GET() {
	await logout();
}
