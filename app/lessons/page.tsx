"use client";
import { useEffect, useState } from "react";

type Lesson = {
  id: number;
  prompt: string;
  choices: string[];
  answerIndex: number;
  hint?: string;
};

export default function LessonsPage() {
  const [items, setItems] = useState<Lesson[]>([]);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);

  useEffect(() => {
    fetch("/lessons_level1.json")
      .then(r => r.json())
      .then(data => setItems(Array.isArray(data) ? data : data.lessons ?? []))
      .catch(() => setItems([]));
  }, []);

  if (items.length === 0) {
    return (
      <div className="min-h-screen grid place-items-center">
        <p className="text-zinc-600">Loading lessons…</p>
      </div>
    );
  }

  const q = items[i];
  const correct = picked !== null && picked === q.answerIndex;

  return (
    <div className="min-h-screen grid place-items-center px-6">
      <div className="w-full max-w-xl space-y-6">
        <header className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Lesson {i + 1} / {items.length}</h2>
          <div className="h-2 w-40 bg-zinc-200 rounded">
            <div className="h-2 bg-blue-600 rounded" style={{ width: `${((i + 1)/items.length)*100}%` }} />
          </div>
        </header>

        <p className="text-lg">{q.prompt}</p>

        <div className="grid gap-3">
          {q.choices.map((c, idx) => (
            <button
              key={idx}
              onClick={() => setPicked(idx)}
              className={`rounded-lg border px-4 py-2 text-left transition
                ${picked === idx ? "border-blue-600 bg-blue-50" : "border-zinc-300 hover:bg-zinc-50"}`}
            >
              {c}
            </button>
          ))}
        </div>

        {picked !== null && (
          <div className={`p-3 rounded ${correct ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
            {correct ? "Correct!" : "Try again."}
            {!correct && q.hint && <div className="mt-1 text-sm opacity-80">Hint: {q.hint}</div>}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            onClick={() => { setPicked(null); setI(v => Math.max(0, v - 1)); }}
            className="px-4 py-2 rounded border border-zinc-300 disabled:opacity-50"
            disabled={i === 0}
          >
            Back
          </button>
          <button
            onClick={() => { setPicked(null); setI(v => Math.min(items.length - 1, v + 1)); }}
            className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
            disabled={i === items.length - 1}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
