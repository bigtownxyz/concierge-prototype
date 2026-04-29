type BootstrapProfileInput = {
  full_name?: string | null;
  email?: string | null;
  phone?: string | null;
  country?: string | null;
  nationality?: string | null;
};

export async function bootstrapProfile(
  supabase: {
    auth: {
      getUser: () => Promise<{
        data: { user: { id: string; email?: string | null; user_metadata?: { full_name?: string | null } } | null };
        error: { message: string } | null;
      }>;
    };
    from: (table: string) => {
      select: (columns: string) => {
        eq: (column: string, value: string) => {
          maybeSingle: () => Promise<{
            data: { id: string } | null;
            error: { message: string } | null;
          }>;
        };
      };
      update: (
        values: Record<string, string | null>
      ) => {
        eq: (column: string, value: string) => Promise<{
          error: { message: string } | null;
        }>;
      };
      insert: (
        values: Record<string, string | null>
      ) => Promise<{ error: { message: string } | null }>;
    };
  },
  input: BootstrapProfileInput = {}
) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(userError.message);
  }

  if (!user) {
    throw new Error("Not authenticated");
  }

  const baseProfilePayload: Record<string, string | null> = {
    full_name: input.full_name ?? user.user_metadata?.full_name ?? null,
    email: input.email ?? user.email ?? null,
    phone: input.phone ?? null,
    country: input.country ?? null,
    nationality: input.nationality ?? null,
  };

  const { data: existingProfile, error: existingProfileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (existingProfileError) {
    throw new Error(existingProfileError.message);
  }

  const writeMode = existingProfile ? "update" : "insert";
  let profilePayload: Record<string, string | null> = existingProfile
    ? {
        ...baseProfilePayload,
        updated_at: new Date().toISOString(),
      }
    : {
        id: user.id,
        ...baseProfilePayload,
      };

  for (;;) {
    const { error } = existingProfile
      ? await supabase
          .from("profiles")
          .update(profilePayload)
          .eq("id", user.id)
      : await supabase
          .from("profiles")
          .insert(profilePayload);

    if (!error) {
      return { user };
    }

    const missingColumnMatch = error.message.match(/Could not find the '([^']+)' column/);
    const missingColumn = missingColumnMatch?.[1];

    if (
      missingColumn &&
      Object.prototype.hasOwnProperty.call(profilePayload, missingColumn)
    ) {
      delete profilePayload[missingColumn];
      continue;
    }

    if (
      writeMode === "insert" &&
      /row-level security policy/i.test(error.message)
    ) {
      throw new Error(
        "We couldn't initialize your profile automatically because the live database is blocking profile creation. Please update the profiles insert policy or add a server-side service role key."
      );
    }

    throw new Error(error.message);
  }
}
