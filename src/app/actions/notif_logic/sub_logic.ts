"use server";

import { Subscription_DB } from "@/app/lib/definitions/def_notf";
import { SUBSCRIPTIONS, findAllDB, insertDB } from "../../lib/mongodb";
import { getCurrentID } from "../auth";

// Function to get all subscriptions from the database
export async function getAllSubscriptions(): Promise<Subscription_DB[]> {
	return findAllDB(SUBSCRIPTIONS, {});
}

// Function to check if the user is subscribed
export async function isUserSubscribed() {
	// Get the userId
	const userId = await getCurrentID();

	// If the user is not logged in, we don't need to check the subscription
	if (!userId) {
		return false;
	} else {
		// Check if the user is already subscribed
		const existingSubscription = await findAllDB(SUBSCRIPTIONS, { userId });

		// If the user is already subscribed, we return true
		if (existingSubscription.length > 0) {
			return true;
		} else {
			return false;
		}
	}
}

// Function to save the subscription in the database
export async function saveSubscription(subscription: PushSubscriptionJSON) {
	// Convert the subscription from JSON to normal

	// Get the userId
	const userId = await getCurrentID();

	// If the user is not logged in, we don't need to save the subscription
	if (!userId) {
		throw new Error("User not logged in");
	}
	// If the user is already subscribed, we don't need to save it again
	else if (await isUserSubscribed()) {
		throw new Error("User already subscribed");
	}
	//If all goes well, we can save the subscription
	else {
		console.log("Saving subscription:", subscription);
		await insertDB(SUBSCRIPTIONS, { userId, subscription });
	}
}
