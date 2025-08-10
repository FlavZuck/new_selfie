"use server";

import nodemailer from "nodemailer";
import { findUserById } from "./mongodb";

const transporter = nodemailer.createTransport({
	host: process.env.SMTP_HOST,
	port: Number(process.env.SMTP_PORT),
	secure: Boolean(process.env.SMTP_SECURE),
	auth: {
		user: process.env.SMTP_USER,
		pass: process.env.SMTP_PASS
	}
});

// Funzione ausiliaria per ottenere l'email dell'utente
async function getUserEmail(user_id: string): Promise<string> {
	const user = await findUserById(user_id);
	if (!user) {
		throw new Error("User not found");
	}
	return user.email;
}

export async function sendEmail(
	user_id: string,
	subject: string,
	text: string
) {
	try {
		const email = await getUserEmail(user_id);
		if (!email) {
			throw new Error("Email not found");
		}
		const info = await transporter.sendMail({
			from: process.env.SMTP_USER,
			to: email,
			subject,
			text
		});
		console.log("Email sent: ", info.messageId);
	} catch (error) {
		console.error("Error sending email: ", error);
		throw new Error("Failed to send email");
	}
}

export async function testsendEmail() {
	try {
		const info = await transporter.sendMail({
			from: process.env.SMTP_USER,
			to: "emailinutile952@gmail.com",
			subject: "Test Email",
			text: "This is a test email"
		});
		console.log("Email sent: ", info.messageId);
	} catch (error) {
		console.error("Error sending email: ", error);
		throw new Error("Failed to send email");
	}
}
