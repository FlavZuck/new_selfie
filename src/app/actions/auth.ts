'use server'

import { SignupFormSchema, FormState } from "@/app/lib/definitions";
import bcrypt from "bcrypt";
import { insertDB } from "../lib/mongodb";
import { USERS } from "../lib/mongodb";

export async function signup(state: FormState, formData: FormData) {
  // Validate form fields
  const validatedFields = SignupFormSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  // If any form fields are invalid, return early
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  // 2. Prepare data for insertion into database
  const { name, email, password } = validatedFields.data;
  // e.g. Hash the user's password before storing it
  const hashedPassword = await bcrypt.hash(password, 10);

  // 3. Insert the user into the database
  const payload = {
    name,
    email,
    password: hashedPassword,
  };

  insertDB(USERS, payload);
  console.log("User inserted into database");

  // TODO:
  
  // 3.2 Aggiungere un controllo per verificare se l'utente esiste già

  // 4. Create user session

  // 5. Redirect user
}
