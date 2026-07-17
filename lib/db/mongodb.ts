import { Resolver } from "node:dns/promises";
import { MongoClient } from "mongodb";

// Despite the name, this holds a full mongodb+srv:// connection string, not a bare API key.
const srvUri = process.env.MONGODB_API_KEY;

const isDev = process.env.NODE_ENV === "development";

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let clientPromise: Promise<MongoClient> | undefined;

function getCache(): Promise<MongoClient> | undefined {
  return isDev ? globalThis._mongoClientPromise : clientPromise;
}

function setCache(promise: Promise<MongoClient> | undefined): void {
  if (isDev) {
    globalThis._mongoClientPromise = promise;
  } else {
    clientPromise = promise;
  }
}

/**
 * Some network resolvers (common on managed/office networks, and observed
 * under Next.js's dev server specifically) fail to resolve the SRV records
 * that `mongodb+srv://` URIs depend on, even when the same DNS servers
 * resolve them fine outside that environment. Rather than depend on the
 * driver's internal SRV lookup (which always uses the OS resolver with no
 * override point), resolve the SRV/TXT records ourselves against a public
 * resolver and hand the driver a plain, non-SRV connection string that
 * needs no SRV lookup at all.
 */
async function resolveSrvToStandardUri(srv: string): Promise<string> {
  const url = new URL(srv);
  const resolver = new Resolver();
  resolver.setServers(["8.8.8.8", "1.1.1.1"]);

  const [srvRecords, txtRecords] = await Promise.all([
    resolver.resolveSrv(`_mongodb._tcp.${url.hostname}`),
    resolver.resolveTxt(url.hostname).catch(() => []),
  ]);

  const hosts = srvRecords.map((record) => `${record.name}:${record.port}`).join(",");

  const params = new URLSearchParams(url.search);
  params.set("ssl", "true");
  // TXT records on Atlas encode extra required params (replicaSet, authSource).
  for (const record of txtRecords) {
    for (const [key, value] of new URLSearchParams(record.join(""))) {
      params.set(key, value);
    }
  }

  const auth = url.username ? `${url.username}:${url.password}@` : "";
  return `mongodb://${auth}${hosts}${url.pathname}?${params.toString()}`;
}

function connect(): Promise<MongoClient> {
  if (!srvUri) {
    return Promise.reject(new Error("Missing MONGODB_API_KEY environment variable"));
  }

  // If connecting fails, drop the cached promise so the next call retries
  // instead of permanently reusing a rejected connection.
  return resolveSrvToStandardUri(srvUri)
    .then((uri) => new MongoClient(uri).connect())
    .catch((err: unknown) => {
      setCache(undefined);
      throw err;
    });
}

/**
 * Returns a shared MongoClient connection, reused across calls (and across
 * Next.js dev-mode hot reloads via `globalThis`) instead of opening a new
 * connection per request, which would exhaust Atlas's connection pool.
 */
export function getMongoClient(): Promise<MongoClient> {
  const cached = getCache();
  if (cached) return cached;

  const promise = connect();
  setCache(promise);
  return promise;
}
