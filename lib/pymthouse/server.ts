import { PmtHouseClient } from "@/lib/pymthouse/client";
import { PmtHouseError } from "@/lib/pymthouse/errors";

let cachedClient: PmtHouseClient | null = null;

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (value && value.trim()) {
    return value.trim();
  }

  throw new PmtHouseError(`Missing required environment variable: ${name}`, {
    status: 500,
    code: "missing_env",
  });
}

export function getPmtHouseClient(): PmtHouseClient {
  if (cachedClient) {
    return cachedClient;
  }

  cachedClient = new PmtHouseClient({
    issuerUrl: requiredEnv("PYMTHOUSE_ISSUER_URL"),
    publicClientId: requiredEnv("PYMTHOUSE_PUBLIC_CLIENT_ID"),
    m2mClientId: requiredEnv("PYMTHOUSE_M2M_CLIENT_ID"),
    m2mClientSecret: requiredEnv("PYMTHOUSE_M2M_CLIENT_SECRET"),
    logger: {
      debug: (message, details) => {
        if (process.env.NODE_ENV !== "production") {
          console.debug(`[pymthouse] ${message}`, details ?? {});
        }
      },
      warn: (message, details) => {
        console.warn(`[pymthouse] ${message}`, details ?? {});
      },
    },
  });

  return cachedClient;
}
