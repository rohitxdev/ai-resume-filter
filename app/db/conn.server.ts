import { styleText } from "node:util";
import { MongoClient, type MongoClientOptions } from "mongodb";
import { config } from "~/utils/config.server";

const connectToDb = async (url: string, options?: MongoClientOptions) => {
	try {
		console.log(styleText("dim", "Connecting to DB..."));
		const client = new MongoClient(url, options);
		await client.connect();
		console.log(styleText("green", "Connected to DB."));
		return client;
	} catch (err) {
		console.log(styleText("red", "Error connecting to DB:"), err);
		process.exit(1);
	}
};

const client = await connectToDb(config.DB_URL, {
	connectTimeoutMS: 5000,
	monitorCommands: true,
});

export const db = client.db("filtercv");
