const base = process.env.BACKEND_API_URL;

if (!base) {
  throw new Error("BACKEND_API_URL is not set. Add it to .env.local.");
}

export const BACKEND_API_URL = base.replace(/\/+$/, "");
export const API_PREFIX = "/api/v1";
