import { redirect } from "next/navigation";
import isAuthenticated, {logout} from "../actions/auth";

export async function GET() {
  const authstatus = await isAuthenticated();
  
  // If the user is not authenticated, redirect to the login page 
  if (!authstatus) {
    redirect("/login");
  }
  // Else, log out
  else{
    await logout();
  }
}
