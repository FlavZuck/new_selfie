import { MongoClient, ObjectId } from "mongodb";
import { User } from "./definitions/def_auth";

// Nome della collezione per gli utenti
export const USERS = "users";
export const EVENTS = "Events";
export const POMODORO = "Pomodoro";
export const ACTIVITIES = "Activities";
export const SUBSCRIPTIONS = "Subscriptions";

// Recupera la stringa di connessione dal file di ambiente
const DB_URI = process.env.DB_URI as string;
if (!DB_URI) {
	throw new Error("Missing or invalid DB_URI environment variable.");
}

// Crea un'istanza di MongoClient con l'URI specificato
const clientDB = new MongoClient(DB_URI, {});

// Connette il client a MongoDB e gestisce eventuali errori
export async function connectToClient() {
	try {
		await clientDB.connect();
	} catch (error) {
		console.error("Connection to MongoDB Atlas failed!", error);
		process.exit();
	}
	return clientDB;
}

// Recupera la collezione richiesta dal database "selfietw2324"
export async function findCollection(collectionName: string) {
	const client = await connectToClient();
	const db = client.db("selfietw2324");
	// Ottieni la collezione dal database
	const collection = db.collection(collectionName);
	return collection;
}

// Inserisce un documento (data) nella collezione specificata
export async function insertDB(collectionName: string, data: any) {
	const collection = await findCollection(collectionName);
	await collection.insertOne(data);
}

// Cerca un documento nella collezione usando un filtro e restituisce il risultato (o null)
export async function findDB<T>(
	collectionName: string,
	filter: any
): Promise<T | null> {
	const collection = await findCollection(collectionName);
	const output = await collection.findOne(filter);
	return output as T | null;
}

// Cerca tutti i documenti nella collezione che corrispondono al filtro e restituisce il risultato come array
export async function findAllDB<T>(
	collectionName: string,
	filter: any
): Promise<T[]> {
	const collection = await findCollection(collectionName);
	const output = await collection.find(filter).toArray();
	return output as T[];
}

// Aggiorna i documenti nella collezione che corrispondono al filtro con i valori specificati
export async function updateDB(
	collectionName: string,
	filter: any,
	updates: any,
	remove: any = null
) {
	const collection = await findCollection(collectionName);
	if (remove === null) {
		collection.updateOne(filter, { $set: updates });
	} else {
		collection.updateOne(filter, { $set: updates, $unset: remove });
	}
}

// Elimina i documenti nella collezione che soddisfano il filtro
export async function deleteDB(collectionName: string, filter: any) {
	const collection = await findCollection(collectionName);
	collection.deleteMany(filter);
}

export async function findUserById(userId: string): Promise<User | null> {
	if (!ObjectId.isValid(userId)) {
		console.log("Invalid userId", userId);
		console.error(`Invalid userId: ${userId}`);
		return null;
	}
	const objectId = new ObjectId(userId);
	return findDB<User>(USERS, { _id: objectId });
}
