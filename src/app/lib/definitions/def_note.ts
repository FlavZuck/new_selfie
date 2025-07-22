//import {z} from "zod";
import { ObjectId } from "mongodb";

export type note = {
	_id: ObjectId;
	title: String;
	content: String;
	tags: String[];
	created: Date;
	modified: Date;
};
