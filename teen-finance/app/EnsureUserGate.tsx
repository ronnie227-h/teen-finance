"use client";
import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function EnsureUserGate() {
  const { isSignedIn } = useUser();
  const ensureUser = useMutation(api.functions.ensureUser);

  useEffect(() => {
    if (isSignedIn) {
      ensureUser().catch(console.error);
    }
  }, [isSignedIn, ensureUser]);

  return null; // 不渲染任何 UI
}
