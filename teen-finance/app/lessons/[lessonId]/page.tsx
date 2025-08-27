"use client";

import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";

export default function LessonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = useMemo(() => {
    const id = Array.isArray(params?.lessonId) ? params.lessonId[0] : (params?.lessonId as string);
    return id as any;
  }, [params]);

  const lesson = useQuery(api.functions.getLessonById, lessonId ? { lessonId } : "skip");
  const completeLesson = useMutation(api.functions.completeLesson);

  const [step, setStep] = useState<"slides" | "quiz" | "reward">("slides");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [score, setScore] = useState(0);

  if (lesson === undefined) return <main className="p-6">Loading…</main>;
  if (lesson === null) return <main className="p-6">Lesson not found.</main>;

  const totalSlides = lesson.slides.length;
  const totalQuestions = lesson.quiz.length;

  async function startQuiz() {
    setStep("quiz");
    setAnswers(Array(totalQuestions).fill(-1));
  }

  async function submitQuiz() {
    let s = 0;
    lesson.quiz.forEach((q: any, i: number) => {
      if (answers[i] === q.correctIndex) s += 1;
    });
    setScore(s);
    await completeLesson({ lessonId });
    setStep("reward");
  }

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <span>{lesson.icon ?? "📘"}</span>
        <span>{lesson.title}</span>
      </h1>

      {step === "slides" && (
        <Card className="p-4 space-y-4">
          <div className="min-h-24">
            {lesson.slides[currentSlide]}
          </div>
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentSlide((s) => Math.max(0, s - 1))}
              disabled={currentSlide === 0}
            >
              Previous
            </Button>
            {currentSlide < totalSlides - 1 ? (
              <Button onClick={() => setCurrentSlide((s) => Math.min(totalSlides - 1, s + 1))}>
                Next
              </Button>
            ) : (
              <Button onClick={startQuiz}>Start Quiz</Button>
            )}
          </div>
        </Card>
      )}

      {step === "quiz" && (
        <Card className="p-4 space-y-6">
          {lesson.quiz.map((q: any, i: number) => (
            <div key={i} className="space-y-2">
              <div className="font-medium">Q{i + 1}. {q.question}</div>
              <div className="grid gap-2">
                {q.options.map((opt: string, idx: number) => (
                  <label key={idx} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name={`q-${i}`}
                      checked={answers[i] === idx}
                      onChange={() =>
                        setAnswers((a) => {
                          const next = [...a];
                          next[i] = idx;
                          return next;
                        })
                      }
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
          <div className="flex justify-end">
            <Button onClick={submitQuiz}>Submit</Button>
          </div>
        </Card>
      )}

      {step === "reward" && (
        <Card className="p-4 space-y-3">
          <div className="text-xl font-semibold">🎉 Well done!</div>
          <div>You got {score} / {totalQuestions} correct.</div>
          <div>+{lesson.rewardCoins} coins added to your balance.</div>
          <div className="flex gap-2">
            <Button onClick={() => router.push("/lessons")}>Back to Lessons</Button>
            <Button variant="outline" onClick={() => router.push("/")}>Go Home</Button>
          </div>
        </Card>
      )}
    </main>
  );
}


