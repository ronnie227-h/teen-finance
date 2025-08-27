"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { Card } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";

export default function LessonsPage() {
  const lessons = useQuery(api.functions.listLessons) ?? [];
  const me = useQuery(api.functions.getMe) ?? null;
  const seedLessons = useMutation(api.functions.seedLessons);
  const completed = new Set(me?.lessonsCompleted?.map((id) => id) ?? []);

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Lessons</h1>
      {Array.isArray(lessons) && lessons.length === 0 && (
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-600">No lessons found. Seed initial lessons for dev:</div>
          <Button
            variant="outline"
            onClick={() => {
              seedLessons().catch(console.error);
            }}
          >
            Seed Lessons
          </Button>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {lessons.map((l) => (
          <Link key={l._id} href={`/lessons/${l._id}`}>
            <Card className="p-4 space-y-2 hover:shadow-md transition-shadow cursor-pointer">
              <div className="text-2xl">{l.icon ?? "📘"}</div>
              <div className="font-semibold">{l.title}</div>
              {completed.has(l._id) ? (
                <div className="text-green-600 text-sm">Completed ✓</div>
              ) : (
                <div className="text-gray-500 text-sm">Reward: {l.rewardCoins} coins</div>
              )}
            </Card>
          </Link>
        ))}
      </div>
    </main>
  );
}


