const raw = import.meta.env.VITE_API_BASE_URL?.trim();
if (!raw) {
  throw new Error(
    'VITE_API_BASE_URL is required — set it to your API origin (e.g. http://localhost:8000).',
  );
}

export const API_BASE_URL = raw;
