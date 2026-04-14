"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

interface UseUserReturn {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

export function useUser(): UseUserReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;

    try {
      const supabase = createClient();

      // Get initial session without letting auth setup crash the whole page.
      supabase.auth
        .getUser()
        .then(({ data: { user } }) => {
          setUser(user);
        })
        .catch((error) => {
          console.error("Failed to fetch current user", error);
          setUser(null);
        })
        .finally(() => {
          setLoading(false);
        });

      const result = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      });

      subscription = result.data.subscription;
    } catch (error) {
      console.error("Failed to initialize Supabase client", error);
      setUser(null);
      setLoading(false);
    }

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Failed to sign out", error);
    }
    setUser(null);
  };

  return { user, loading, signOut };
}
