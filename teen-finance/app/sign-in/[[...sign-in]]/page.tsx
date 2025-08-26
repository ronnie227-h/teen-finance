'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSignIn } from "@clerk/nextjs";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";

export default function SignInPage() {
  const router = useRouter();
  const { isLoaded, signIn, setActive } = useSignIn();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoaded) return;
    setPending(true);
    setError(null);
    try {
      const result = await signIn.create({ identifier, password });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/");
      } else {
        setError("Additional steps required to sign in.");
      }
    } catch (err: any) {
      const message = err?.errors?.[0]?.longMessage || err?.message || "Sign in failed";
      setError(message);
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4 p-6 rounded border">
        <h1 className="text-xl font-semibold">Sign in</h1>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={async () => {
            if (!isLoaded) return;
            await signIn.authenticateWithRedirect({
              strategy: "oauth_google",
              redirectUrl: "/sso-callback",
              redirectUrlComplete: "/",
            });
          }}
        >
          Continue with Google
        </Button>
        <div className="text-xs text-center text-gray-500">or</div>
        <div className="space-y-2">
          <label className="block text-sm">Email or Username</label>
          <Input
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm">Password</label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Signing in..." : "Sign in"}
        </Button>
        <p className="text-sm text-center text-gray-600">
          New here? <a className="text-blue-600" href="/sign-up">Create an account</a>
        </p>
      </form>
    </main>
  );
}


