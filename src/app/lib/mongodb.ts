import { MongoClient, WithId, ObjectId} from "mongodb";
import { User } from "./definitions";
// Nome della collezione per gli utenti
export const USERS = "users";

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
		console.log("Successfully connected to MongoDB Atlas!");
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
export async function findDB<T>(collectionName: string, filter: any): Promise<T | null> {
	const collection = await findCollection(collectionName);
	const output = await collection.findOne(filter);
	console.log(output);
	return output as T | null;
}

// Aggiorna i documenti nella collezione che corrispondono al filtro con i valori specificati
export async function updateDB(collectionName: string, filter: any, updates: any) {
	const collection = await findCollection(collectionName);
	collection.updateMany(filter, { $set: updates });
}

// Elimina i documenti nella collezione che soddisfano il filtro
export async function deleteDB(collectionName: string, filter: any) {
	const collection = await findCollection(collectionName);
	collection.deleteMany(filter);
}

export async function findUserById(userId: string): Promise<User | null> {
	const objectId = new ObjectId(userId);
	return findDB<User>(USERS, { _id: objectId });
}