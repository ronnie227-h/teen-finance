"use client";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function MeCard() {
  const me = useQuery(api.functions.getMe) ?? null;

  if (me === undefined) return <div>Loading…</div>;
  if (me === null) return <div>Sign in to create your profile.</div>;

  return (
    <pre className="p-3 rounded border">{JSON.stringify(me, null, 2)}</pre>
  );
}
