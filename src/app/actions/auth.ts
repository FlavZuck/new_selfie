"use server";

import {
  SignupFormSchema,
  SigninFormSchema,
  FormState,
} from "@/app/lib/definitions";
import bcrypt from "bcrypt";
import { insertDB } from "../lib/mongodb";
import { findDB } from "../lib/mongodb";
import { USERS } from "../lib/mongodb";
import { generateSessionToken } from "../lib/session";
import { User } from "../lib/definitions";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

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

  // 3. Prepare for the payload and the comparison payload
  // Payload to insert into the database
  const payload = {
    name,
    email,
    password: hashedPassword,
  };

  // Payload to compare with existing users in the database
  // Essenzialmente qua diciamo a MongoDB di cercare un documento che abbia lo stesso nome o la stessa email
  // Diamo per scontato che sia il nome che la email siano unici
  const compare_payload = {
    $or: [{ name: name }, { email: email }],
  };

  // 4. Check if user already exists and insert
  if ((await findDB(USERS, compare_payload)) == null) {
    // Insert user into database if they don't already exist
    insertDB(USERS, payload);
    console.log("User inserted into database");
    // 5. Redirect the user to the login page
    redirect("/login");
  } else {
    // If user already exists, log a message
    console.log("User already exists");
  }
}

export async function login(state: FormState, formData: FormData) {
  const validatedFields = SigninFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  // If any form fields are invalid, return early
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  // 2. Prepare data for comparison with database
  const { email, password } = validatedFields.data;

  // 3. Insert the user into the database
  // Payload to insert into the database
  const payload = {
    email,
  };

  const user = await findDB<User>(USERS, payload);
  if (!user) {
    // If user is not found
    console.log("User not found");
    return { error: "User not found" };
  } else {
    // If user is found
    console.log("User found");
    // 4. Creation of the session token
    //Compare the password
    if (await bcrypt.compare(password, user.password)) {
      const token = await generateSessionToken(user._id);
      const biscottino = await cookies();
      biscottino.set("session", token, {
        httpOnly: true,
        secure: true,
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        sameSite: "lax",
        path: "/",
      });
      console.log("Session created");
      // 5. Redirect the user to the home page
      redirect("/");
    } else {
      //If the password is incorrect, log a message
      console.log("Incorrect password");
    }
  }
}
