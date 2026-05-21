import type { CoachPrepOutput, CoachPrepRequest } from "../types/coachPrep";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
const COACH_ACCESS_TOKEN_STORAGE_KEY = "reflectloop_coach_access_token";

export function getStoredCoachAccessToken(): string {
  return window.sessionStorage.getItem(COACH_ACCESS_TOKEN_STORAGE_KEY) ?? "";
}

export function storeCoachAccessToken(token: string): void {
  if (token.trim()) {
    window.sessionStorage.setItem(COACH_ACCESS_TOKEN_STORAGE_KEY, token.trim());
  } else {
    window.sessionStorage.removeItem(COACH_ACCESS_TOKEN_STORAGE_KEY);
  }
}

export async function generateCoachPrep(
  request: CoachPrepRequest,
  coachAccessToken: string
): Promise<CoachPrepOutput> {
  const response = await fetch(`${API_BASE_URL}/api/coach-prep/generate`, {
    method: "POST",
    headers: buildHeaders(coachAccessToken),
    body: JSON.stringify(removeEmptyValues(request))
  });

  if (!response.ok) {
    let detail = "Coach prep generation failed.";
    try {
      const body = (await response.json()) as { detail?: unknown };
      if (typeof body.detail === "string") {
        detail = body.detail;
      }
    } catch {
      detail = `Coach prep generation failed with status ${response.status}.`;
    }
    throw new Error(detail);
  }

  return (await response.json()) as CoachPrepOutput;
}

function buildHeaders(coachAccessToken: string): HeadersInit {
  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  };

  if (coachAccessToken.trim()) {
    headers.Authorization = `Bearer ${coachAccessToken.trim()}`;
  }

  return headers;
}

function removeEmptyValues<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map(removeEmptyValues) as T;
  }

  if (value && typeof value === "object") {
    const cleaned = Object.fromEntries(
      Object.entries(value)
        .filter(([, nestedValue]) => nestedValue !== "" && nestedValue !== undefined)
        .map(([key, nestedValue]) => [key, removeEmptyValues(nestedValue)])
    );
    return cleaned as T;
  }

  return value;
}
