interface MongoConfig {
	serverUrl: string;
	database: string;
}

// When MONGO_URL is set (in Docker), use it directly
// Otherwise, use localhost for local development
const mongoUrl = process.env.MONGO_URL || "mongodb://localhost:27017";

export const mongoConfig: MongoConfig = {
	serverUrl: mongoUrl,
	database: "mini-wiki"
};
