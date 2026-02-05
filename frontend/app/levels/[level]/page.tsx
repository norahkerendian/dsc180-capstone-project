"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type TopicRow = {
  topic: string;
  count: number;
  completed: boolean;
  inProgress: boolean;
  locked: boolean;
};

export default function LevelPage() {
  const params = useParams();

  // params.level can be string | string[] | undefined
  const levelRaw = params?.level;
  const levelStr = Array.isArray(levelRaw) ? levelRaw[0] : levelRaw;

  const levelNum = useMemo(() => {
    const n = Number(levelStr);
    return Number.isFinite(n) ? n : null;
  }, [levelStr]);

  const [topics, setTopics] = useState<TopicRow[]>([]);
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
    if (levelNum === null) return;

    setLoading(true);
    setErr(null);
    setIsVisible(false);

    // First fetch topics
    fetch(`/api/topics?level=${levelNum}`)
      .then(async (r) => {
        if (!r.ok) throw new Error(await r.text());
        return r.json();
      })
      .then(async (data) => {
        const topicsData = data.topics ?? [];
        
        // Then fetch status for each topic
        const topicsWithStatus = await Promise.all(
          topicsData.map(async (t: { topic: string; count: number }) => {
            try {
              const statusRes = await fetch(
                `/api/topics/status?level=${levelNum}&topic=${encodeURIComponent(t.topic)}&userId=${userId || ""}`
              );
              const statusData = await statusRes.json();
              
              return {
                ...t,
                completed: statusData.completed ?? false,
                inProgress: statusData.inProgress ?? false,
                locked: statusData.locked ?? false,
              };
            } catch {
              return {
                ...t,
                completed: false,
                inProgress: false,
                locked: false,
              };
            }
          })
        );

        setTopics(topicsWithStatus);
        // Trigger fade-in animation after a brief delay
        setTimeout(() => setIsVisible(true), 50);
      })
      .catch((e) => setErr(e.message ?? "Failed to load topics"))
      .finally(() => setLoading(false));
  }, [levelNum, userId]);

  if (levelNum === null) {
    return (
      <div className="bg-gradient-to-b from-green-50 to-blue-50 -mx-4 sm:-mx-6 lg:-mx-8 -mt-[80px] min-h-[calc(100vh+80px)] pt-[80px] p-10">
        <h1 className="text-2xl font-semibold">Invalid level</h1>
        <p className="text-gray-600">
          URL param <span className="font-mono">{String(levelStr)}</span> is not a number. Try{" "}
          <Link className="underline" href="/levels/1">
            /levels/1
          </Link>
        </p>
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-black text-gray-800">Level {levelNum}: Fundamentals</h1>
            <p className="text-gray-600 mt-2">Choose a topic</p>
          </div>
          <Link
            href="/levels"
            className="text-sm text-gray-600 hover:text-gray-800 underline transition-colors duration-200"
          >
            ← Back to Levels
          </Link>
        </div>

        {loading && <p className="text-gray-600">Loading topics…</p>}
        {err && <p className="text-red-600">Error: {err}</p>}

        {!loading && !err && (
          <div className="grid gap-6">
            {topics.length === 0 ? (
              <p className="text-gray-600">No topics found for this level.</p>
            ) : (
              topics.map((t, index) => {
                const getTopicIcon = () => {
                  if (t.locked) {
                    return (
                      <div className="w-10 h-10 flex items-center justify-center bg-gray-300 rounded-full">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="#6b7280"
                          className="w-5 h-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
                          />
                        </svg>
                      </div>
                    );
                  }

                  if (t.completed) {
                    return (
                      <div className="w-10 h-10 flex items-center justify-center bg-green-500 rounded-full">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={3}
                          stroke="white"
                          className="w-6 h-6"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4.5 12.75l6 6 9-13.5"
                          />
                        </svg>
                      </div>
                    );
                  }

                  // In progress - blue filled circle with three white dots
                  if (t.inProgress) {
                    return (
                      <div className="w-10 h-10 flex items-center justify-center bg-blue-500 rounded-full">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          className="w-10 h-10"
                        >
                          {/* Three white dots - horizontal, separated */}
                          <circle cx="8" cy="12" r="1.5" fill="white" />
                          <circle cx="12" cy="12" r="1.5" fill="white" />
                          <circle cx="16" cy="12" r="1.5" fill="white" />
                        </svg>
                      </div>
                    );
                  }

                  // Not started - green circle
                  return (
                    <div className="w-10 h-10 flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2.5}
                        stroke="#22c55e"
                        className="w-10 h-10"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                        />
                      </svg>
                    </div>
                  );
                };

                const getRightIcon = () => {
                  if (t.locked) return null;
                  if (t.completed) {
                    return <span className="text-2xl">🏆</span>;
                  }
                  if (t.inProgress) {
                    return <span className="text-2xl">⭐</span>;
                  }
                  return null;
                };

                const getCardStyles = () => {
                  if (t.locked) {
                    return "border-gray-300 bg-white opacity-60";
                  }
                  if (t.completed) {
                    return "border-green-200 bg-green-50 hover:bg-green-100";
                  }
                  if (t.inProgress) {
                    return "border-blue-200 bg-blue-50 hover:bg-blue-100";
                  }
                  return "border-green-200 bg-white hover:bg-green-50";
                };

                const getStatusText = () => {
                  if (t.locked) return "Locked";
                  if (t.completed) return "Completed";
                  if (t.inProgress) return "In Progress";
                  return "";
                };

                const content = (
                  <div
                    className={`rounded-2xl border-2 py-6 px-6 shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-[1.01] ${
                      isVisible ? "fade-in-up" : "opacity-0"
                    } ${getCardStyles()}`}
                    style={{
                      animationDelay: `${index * 100}ms`,
                    }}
                  >
                    <div className="flex items-center gap-4">
                      {getTopicIcon()}
                      <div className="flex-1">
                        <div className="font-bold text-xl text-gray-800">{t.topic}</div>
                        {getStatusText() && (
                          <div
                            className={`text-sm font-medium mt-1 ${
                              t.completed
                                ? "text-green-600"
                                : t.inProgress
                                ? "text-blue-600"
                                : "text-gray-500"
                            }`}
                          >
                            {getStatusText()}
                          </div>
                        )}
                      </div>
                      {getRightIcon()}
                    </div>
                  </div>
                );

                if (t.locked) {
                  return <div key={t.topic}>{content}</div>;
                }

                return (
                  <Link
                    key={t.topic}
                    href={`/levels/${levelNum}/topics/${encodeURIComponent(t.topic)}`}
                  >
                    {content}
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
