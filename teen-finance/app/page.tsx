"use client";

import EnsureUserGate from "./EnsureUserGate";
import MeCard from "./MeCard";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Teen Finance Demo</h1>

      {/* Sign in / Sign out button */}
      <SignedOut>
        <Link href="/sign-in" className="px-4 py-2 bg-blue-500 text-white rounded inline-block">
          Sign In
        </Link>
      </SignedOut>
      <SignedIn>
        <div className="flex items-center gap-3">
          <UserButton afterSignOutUrl="/" />
          <span className="text-sm text-gray-600">Signed in</span>
        </div>
      </SignedIn>

      {/* Ensure the user exists in Convex DB */}
      <EnsureUserGate />

      {/* Display the current user document */}
      <MeCard />
    </main>
  );
}
