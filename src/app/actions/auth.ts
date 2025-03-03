"use server";

import { SignupFormSchema, FormState } from "@/app/lib/definitions";
import bcrypt from "bcrypt";
import { insertDB } from "../lib/mongodb";
import { findDB } from "../lib/mongodb";
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
  // Hash the user's password before storing it
  const hashedPassword = await bcrypt.hash(password, 10);

  // 3. Insert the user into the database
  // Payload to insert into the database
  const payload = {
    name,
    email,
    password: hashedPassword,
  };

  // Payload to compare with existing users in the database
  // Essenzialmente qua diciamo a MongoDB di cercare un documento che abbia lo stesso nome o la stessa email
  const compare_payload = {
    $or: [{ name: name }, { email: email }],
  };

  // Check if user already exists
  if (findDB(USERS, compare_payload) == null) {
    // Insert user into database if they don't already exist
    insertDB(USERS, payload);
    console.log("User inserted into database");
  } else {
    // If user already exists, log a message
    console.log("User already exists");
  }
  // TODO:

  // 4. Create user session

  // 5. Redirect user
}
