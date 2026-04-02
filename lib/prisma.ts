import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}
 
function mustGetEnv(name: string): string {
  const v = process.env[name];
  if (!v || !v.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return v.trim();
} 

function parseDbUrl(raw: string): URL {
  // ต้องเป็น URL format เท่านั้น (เช่น mysql://user:pass@host:3306/dbname)
  // ถ้า password มีอักขระพิเศษ ต้อง URL-encode (เช่น @ -> %40)
  try {
    return new URL(raw);
  } catch {
    throw new Error(
        [
          "Invalid DATABASE_URL format.",
          "Expected: mysql://USER:PASSWORD@HOST:PORT/DBNAME",
          "Note: If PASSWORD contains special characters, it must be URL-encoded.",
        ].join(" ")
    );
  }
}

function intEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return Math.floor(n);
}

function createPrismaClient(): PrismaClient {
  const dbUrl = parseDbUrl(mustGetEnv("DATABASE_URL"));

  const host = dbUrl.hostname;
  const port = Number(dbUrl.port || 3306);

  // URL.username / URL.password จะถูก decode ให้แล้ว
  const user = decodeURIComponent(dbUrl.username || "");
  const password = decodeURIComponent(dbUrl.password || "");
  const database = dbUrl.pathname?.replace(/^\//, "");

  if (!host) throw new Error("DATABASE_URL missing host.");
  if (!user) throw new Error("DATABASE_URL missing username.");
  if (!database) throw new Error("DATABASE_URL missing database name.");

  const connectionLimit = intEnv("DB_POOL_LIMIT", 5);

  const adapter = new PrismaMariaDb({
    host,
    port,
    user,
    password,
    database,
    connectionLimit,
  });

  return new PrismaClient({
    adapter,
    // ลด noise ใน production แต่ยังเห็น error สำคัญ
    log:
        process.env.NODE_ENV === "development"
            ? ["error", "warn"]
            : ["error"],
  });
}

export const prisma = globalThis.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}