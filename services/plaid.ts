import { supabase, isSupabaseConfigured } from "./supabase";

function functionsBaseUrl(): string {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  if (!url) throw new Error("EXPO_PUBLIC_SUPABASE_URL is not set");
  return `${url}/functions/v1`;
}

function anonKey(): string {
  const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) throw new Error("EXPO_PUBLIC_SUPABASE_ANON_KEY is not set");
  return key;
}

export function isLivePlaidAvailable(): boolean {
  return isSupabaseConfigured();
}

/** Uses persisted Supabase session (JWT in AsyncStorage). */
export async function hasAuthSession(): Promise<boolean> {
  const { data: { session } } = await supabase.auth.getSession();
  return Boolean(session?.access_token);
}

export async function createLinkToken(): Promise<string> {
  console.log("🔍 [PLAID] createLinkToken called");
  const { data: { session } } = await supabase.auth.getSession();
  console.log("🔍 [PLAID] Session exists:", !!session);
  console.log("🔍 [PLAID] Access token exists:", !!session?.access_token);
  console.log("🔍 [PLAID] Access token first 30 chars:", session?.access_token?.slice(0, 30));
  console.log("🔍 [PLAID] User ID:", session?.user?.id);
  console.log("🔍 [PLAID] Functions URL:", functionsBaseUrl());
  console.log("🔍 [PLAID] Anon key first 20:", anonKey()?.slice(0, 20));
  if (!session?.access_token) {
    throw new Error("User not authenticated");
  }

  const url = `${functionsBaseUrl()}/create-link-token`;
  console.log("🔍 [PLAID] Fetching URL:", url);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${session.access_token}`,
    apikey: anonKey(),
  };
  console.log("🔍 [PLAID] Request headers:", JSON.stringify(Object.keys(headers)));

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
    });

    console.log("🔍 [PLAID] Response status:", response.status);
    console.log("🔍 [PLAID] Response ok:", response.ok);

    const responseText = await response.text();
    console.log("🔍 [PLAID] Response body:", responseText);

    let data: unknown;
    try {
      data = JSON.parse(responseText);
    } catch {
      throw new Error(`Non-JSON response: ${responseText}`);
    }

    if (!response.ok) {
      const errorMessage =
        typeof data === "object" && data !== null && "error" in data
          ? String((data as { error?: unknown }).error ?? `HTTP ${response.status}: ${responseText}`)
          : `HTTP ${response.status}: ${responseText}`;
      throw new Error(errorMessage);
    }

    return (data as { link_token: string }).link_token;
  } catch (fetchError: unknown) {
    const msg = fetchError instanceof Error ? fetchError.message : String(fetchError);
    console.error("🔍 [PLAID] Fetch error:", msg);
    if (msg.includes("Network request failed")) {
      console.error("🔍 [PLAID] This is a NETWORK error, not an HTTP error.");
      console.error("🔍 [PLAID] The request never reached the server.");
      console.error("🔍 [PLAID] Possible causes: wrong URL, no internet, SSL issue, iOS ATS blocking");
    }
    throw fetchError;
  }
}

export interface ExchangeAccountPayload {
  institution_name?: string | null;
  account_mask?: string | null;
  account_name?: string | null;
  account_type?: string | null;
}

export async function exchangePublicToken(
  publicToken: string,
  metadata: unknown,
): Promise<{ success: boolean; account: ExchangeAccountPayload }> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error("User not authenticated");
  }

  const response = await fetch(`${functionsBaseUrl()}/exchange-public-token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
      apikey: anonKey(),
    },
    body: JSON.stringify({ public_token: publicToken, metadata }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to exchange token");
  }
  return data as { success: boolean; account: ExchangeAccountPayload };
}
