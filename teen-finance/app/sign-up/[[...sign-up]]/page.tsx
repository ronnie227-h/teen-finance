'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSignUp } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";

export default function SignUpPage() {
  const router = useRouter();
  const { isLoaded, signUp, setActive } = useSignUp();
  const setProfile = useMutation(api.functions.setProfile);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoaded) return;
    setPending(true);
    setError(null);
    try {
      const result = await signUp.create({ emailAddress: email, password });
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        // Save profile to Convex (creates user doc if missing)
        await setProfile({ name: name || 'New User' });
        router.push('/');
        return;
      }

      // If email verification is enabled, prepare email verification
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      router.push('/verify-email');
    } catch (err: any) {
      const message = err?.errors?.[0]?.longMessage || err?.message || 'Sign up failed';
      setError(message);
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4 p-6 rounded border">
        <h1 className="text-xl font-semibold">Create account</h1>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={async () => {
            if (!isLoaded) return;
            await signUp.authenticateWithRedirect({
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
          <label className="block text-sm">Name</label>
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm">Email</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            placeholder="At least 8 characters"
            required
          />
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? 'Creating...' : 'Create account'}
        </Button>
        <p className="text-sm text-center text-gray-600">
          Already have an account? <a className="text-blue-600" href="/sign-in">Sign in</a>
        </p>
      </form>
    </main>
  );
}


