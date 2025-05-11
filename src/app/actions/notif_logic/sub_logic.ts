"use server";

import { Subscription_DB } from "@/app/lib/definitions/def_notf";
import {
	SUBSCRIPTIONS,
	deleteDB,
	findAllDB,
	findDB,
	insertDB
} from "../../lib/mongodb";
import { getCurrentID } from "../auth_logic";

// Function to get all subscriptions from the database
export async function getAllSubscriptions(): Promise<Subscription_DB[]> {
	return await findAllDB(SUBSCRIPTIONS, {});
}

// Function to get the subscription of a specific user
export async function getUserSubscriptions(
	userId: string
): Promise<Subscription_DB[]> {
	const subscription = await findAllDB<Subscription_DB>(SUBSCRIPTIONS, {
		userId
	});
	if (!subscription) {
		throw new Error("Subscription not found");
	}
	return subscription;
}

// Function to check if the user is subscribed
export async function isUserSubscribed() {
	// Get the userId
	const userId = await getCurrentID();

	// If the user is not logged in, we don't need to check the subscription
	if (!userId) {
		return false;
	} else {
		// We get the subscription from the database (if it exists)
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

	//If all goes well, we can save the subscription
	else {
		await insertDB(SUBSCRIPTIONS, { userId, subscription });
	}
}

// Function to delete the subscription from the database
export async function deleteSubscription(subscription: Subscription_DB) {
	await deleteDB(SUBSCRIPTIONS, {
		_id: subscription._id
	});
}

// Function to search for a device for a specific user
export async function checkDeviceSubscriptionForUser(
	userId: string,
	subscription: PushSubscriptionJSON
): Promise<boolean> {
	const existingSubscription = await findDB<Subscription_DB>(SUBSCRIPTIONS, {
		userId,
		subscription
	});
	console.log("Existing subscription:", existingSubscription);
	if (existingSubscription) {
		return false;
	} else {
		return true;
	}
}
