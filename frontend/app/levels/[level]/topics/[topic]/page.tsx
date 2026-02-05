"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type TitleRow = {
  id: number;
  title: string;
  slug: string | null;
  level: number;
  topic: string;
  completed?: boolean;
  inProgress?: boolean;
};

export default function TopicPage() {
  const params = useParams();

  const levelRaw = params?.level;
  const levelStr = Array.isArray(levelRaw) ? levelRaw[0] : levelRaw;
  const topicRaw = params?.topic;
  const topicStr = Array.isArray(topicRaw) ? topicRaw[0] : topicRaw;

  const levelNum = useMemo(() => {
    const n = Number(levelStr);
    return Number.isFinite(n) ? n : null;
  }, [levelStr]);

  const decodedTopic = useMemo(() => {
    try {
      return topicStr ? decodeURIComponent(topicStr) : "";
    } catch {
      return topicStr ? String(topicStr) : "";
    }
  }, [topicStr]);

  const [titles, setTitles] = useState<TitleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Get user ID
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      setUserId(data.user?.id || null);
    })();
  }, []);

  useEffect(() => {
    if (levelNum === null || !decodedTopic) return;

    setLoading(true);
    setErr(null);
    setIsVisible(false);

    // First fetch titles
    fetch(`/api/titles?level=${levelNum}&topic=${encodeURIComponent(decodedTopic)}`)
      .then(async (r) => {
        if (!r.ok) throw new Error(await r.text());
        return r.json();
      })
      .then(async (data) => {
        const titlesData = data.titles ?? [];
        
        // Then fetch status for each lesson
        const titlesWithStatus = await Promise.all(
          titlesData.map(async (t: TitleRow) => {
            try {
              if (!userId) {
                return { ...t, completed: false, inProgress: false };
              }
              
              const statusRes = await fetch(
                `/api/quiz/state?lessonId=${t.id}&userId=${userId}`
              );
              const statusData = await statusRes.json();
              
              return {
                ...t,
                completed: statusData.completed ?? false,
                inProgress: (statusData.correctCount > 0 && !statusData.completed) ?? false,
              };
            } catch {
              return {
                ...t,
                completed: false,
                inProgress: false,
              };
            }
          })
        );

        setTitles(titlesWithStatus);
        // Trigger fade-in animation after a brief delay
        setTimeout(() => setIsVisible(true), 50);
      })
      .catch((e) => setErr(e.message ?? "Failed to load titles"))
      .finally(() => setLoading(false));
  }, [levelNum, decodedTopic, userId]);

  if (levelNum === null) {
    return (
      <div className="bg-gradient-to-b from-green-50 to-blue-50 -mx-4 sm:-mx-6 lg:-mx-8 -mt-[80px] min-h-[calc(100vh+80px)] pt-[80px] p-10">
        <h1 className="text-2xl font-semibold">Invalid level</h1>
        <p className="text-gray-600">Try /levels/1</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-green-50 to-blue-50 -mx-4 sm:-mx-6 lg:-mx-8 -mt-[80px] min-h-[calc(100vh+80px)] pt-[80px]">
      <div
        className={`mx-auto max-w-4xl px-8 py-10 transition-opacity duration-500 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="mb-4">
          <span
            className="inline-block rounded-lg border-2 px-3 py-1 text-sm font-semibold"
            style={{
              borderColor: levelNum === 1 ? "#c38e70" : levelNum === 2 ? "#b07d62" : levelNum === 3 ? "#9d6b53" : levelNum === 4 ? "#8a5a44" : "#774936",
              color: levelNum === 1 ? "#c38e70" : levelNum === 2 ? "#b07d62" : levelNum === 3 ? "#9d6b53" : levelNum === 4 ? "#8a5a44" : "#774936",
            }}
          >
            Level {levelNum}
          </span>
        </div>
        <div className="flex items-center justify-between mb-8 mt-4">
          <div className="flex-1">
            <h1 className="text-4xl font-black text-gray-800">{decodedTopic}</h1>
          </div>
          <Link
            href={`/levels/${levelNum}`}
            className="text-sm text-gray-600 hover:text-gray-800 underline transition-colors duration-200"
          >
            ← Back to Topics
          </Link>
        </div>

        {loading && <p className="text-gray-600">Loading titles…</p>}
        {err && <p className="text-red-600">Error: {err}</p>}

        {!loading && !err && (
          <div className="grid gap-6">
            {titles.length === 0 ? (
              <p className="text-gray-600">No titles found under this topic.</p>
            ) : (
              titles.map((t, index) => {
                const getStatusBadge = () => {
                  if (t.completed) {
                    return (
                      <div className="rounded-xl border-2 border-green-500 px-3 py-1.5 flex-shrink-0 flex items-center justify-center">
                        <span className="text-green-500 font-semibold text-xs">Completed</span>
                      </div>
                    );
                  }
                  if (t.inProgress) {
                    return (
                      <div className="rounded-xl border-2 border-blue-500 px-3 py-1.5 flex-shrink-0 flex items-center justify-center">
                        <span className="text-blue-500 font-semibold text-xs">In Progress</span>
                      </div>
                    );
                  }
                  return null;
                };

                const isInProgress = t.inProgress;
                const isCompleted = t.completed;
                
                return (
                  <Link
                    key={t.id}
                    href={`/levels/${levelNum}/topics/${encodeURIComponent(decodedTopic)}/${t.id}`}
                    className={`rounded-2xl border-2 bg-white py-5 px-6 shadow-md transition-all duration-200 transform hover:scale-[1.01] ${
                      isInProgress
                        ? "border-blue-200 hover:bg-blue-50 hover:border-blue-300"
                        : isCompleted
                        ? "border-green-200 hover:bg-green-50 hover:border-green-300"
                        : "border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                    } hover:shadow-lg ${
                      isVisible ? "fade-in-up" : "opacity-0"
                    }`}
                    style={{
                      animationDelay: `${index * 100}ms`,
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-8 h-8 flex items-center justify-center rounded-full flex-shrink-0 ${
                          isInProgress
                            ? "bg-blue-500"
                            : isCompleted
                            ? "bg-green-500"
                            : "bg-gray-400"
                        }`}
                      >
                        <span className="text-white font-bold text-base">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-lg text-gray-800">{t.title}</div>
                        <div className="text-sm text-gray-600 font-medium mt-1">Tap to view lesson → quiz</div>
                      </div>
                      {getStatusBadge()}
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
