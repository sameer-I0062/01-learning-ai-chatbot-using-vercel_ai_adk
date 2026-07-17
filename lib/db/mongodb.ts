import dns from "node:dns";
import { MongoClient } from "mongodb";

// The default network DNS resolver fails to resolve mongodb+srv:// SRV records
// (common on managed/office networks). Point Node at public resolvers instead,
// which resolve Atlas's records correctly.
dns.setServers(["8.8.8.8", "1.1.1.1"]);

// Despite the name, this holds a full mongodb+srv:// connection string, not a bare API key.
const uri = process.env.MONGODB_API_KEY;

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

function connect(): Promise<MongoClient> {
  if (!uri) {
    return Promise.reject(new Error("Missing MONGODB_API_KEY environment variable"));
  }

  // If connecting fails, drop the cached promise so the next call retries
  // instead of permanently reusing a rejected connection.
  return new MongoClient(uri).connect().catch((err: unknown) => {
    globalThis._mongoClientPromise = undefined;
    clientPromise = undefined;
    throw err;
  });
}

let clientPromise: Promise<MongoClient> | undefined;

export function getMongoClient(): Promise<MongoClient> {
  // Reuse the same connection across Next.js dev-mode hot reloads instead of
  // opening a fresh one on every file save, which exhausts Atlas's connection pool.
  if (process.env.NODE_ENV === "development") {
    globalThis._mongoClientPromise ??= connect();
    return globalThis._mongoClientPromise;
  }

  clientPromise ??= connect();
  return clientPromise;
}
