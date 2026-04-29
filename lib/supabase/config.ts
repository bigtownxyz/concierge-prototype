function getRequiredEnv(
  value: string | undefined,
  name: "NEXT_PUBLIC_SUPABASE_URL" | "NEXT_PUBLIC_SUPABASE_ANON_KEY"
) {
  const trimmedValue = value?.trim();

  if (!trimmedValue) {
    throw new Error(`${name} is not configured`);
  }

  return trimmedValue;
}

export function getSupabaseConfig() {
  return {
    // Use direct property access so Next can inline NEXT_PUBLIC_* values into client bundles.
    url: getRequiredEnv(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      "NEXT_PUBLIC_SUPABASE_URL"
    ),
    anonKey: getRequiredEnv(
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      "NEXT_PUBLIC_SUPABASE_ANON_KEY"
    ),
  };
}
