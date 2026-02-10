"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type LevelStatus = {
  level: number;
  exists: boolean;
  completed: boolean;
  locked: boolean;
};

export default function LevelsPage() {
  const [levelStatuses, setLevelStatuses] = useState<LevelStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Get user ID
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      setUserId(data.user?.id || null);
    })();
  }, []);

  // Load level statuses
  useEffect(() => {
    (async () => {
      setLoading(true);
      const statuses: LevelStatus[] = [];

      // Check status for levels 1-5
      for (let level = 1; level <= 5; level++) {
        try {
          const url = `/api/levels/status?level=${level}&userId=${userId || ""}`;
          const res = await fetch(url);
          const data = await res.json();

          statuses.push({
            level,
            exists: data.exists ?? false,
            completed: data.completed ?? false,
            locked: data.locked ?? true,
          });
        } catch (error) {
          // If error, assume locked
          statuses.push({
            level,
            exists: false,
            completed: false,
            locked: true,
          });
        }
      }

      setLevelStatuses(statuses);
      setLoading(false);
    })();
  }, [userId]);

  const getIcon = (status: LevelStatus) => {
    if (status.locked) {
      return (
        <div className="w-8 h-8 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="#d1d5db"
            className="w-6 h-6"
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

    if (status.completed) {
      return (
        <div className="w-8 h-8 flex items-center justify-center bg-green-500 rounded-full">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={3}
            stroke="white"
            className="w-5 h-5"
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

    // Not completed - open circle with bright green
    return (
      <div className="w-8 h-8 flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          stroke="#22c55e"
          className="w-8 h-8"
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

  return (
    <div className="bg-gradient-to-b from-green-50 to-blue-50 -mx-4 sm:-mx-6 lg:-mx-8 -mt-[80px] min-h-[calc(100vh+80px)] pt-[80px]">
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-4xl font-black text-gray-800 mb-2">Choose a Level</h1>
        <p className="text-gray-600 mb-8">Select a level to start or continue your learning journey</p>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading levels...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {levelStatuses.map((status) => {
              const isLocked = status.locked;
              const content = (
                <div
                  className={`rounded-2xl p-6 border-2 shadow-md transition-all duration-200 ${
                    isLocked
                      ? "border-gray-300 bg-white cursor-not-allowed"
                      : status.completed
                      ? "border-green-500 bg-white hover:bg-green-50 hover:shadow-lg hover:scale-105"
                      : "border-green-500 bg-white hover:bg-green-50 hover:shadow-lg hover:scale-105 cursor-pointer"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {getIcon(status)}
                    <div className="flex-1">
                      <h2
                        className={`text-2xl font-bold ${
                          isLocked ? "text-gray-400" : "text-gray-800"
                        }`}
                      >
                        Level {status.level}
                      </h2>
                      {status.completed && !isLocked && (
                        <p className="text-sm text-green-600 font-medium mt-1">Completed</p>
                      )}
                      {!status.completed && !isLocked && (
                        <p className="text-sm text-gray-600 mt-1">In Progress</p>
                      )}
                      {isLocked && (
                        <p className="text-sm text-gray-400 mt-1">Locked</p>
                      )}
                    </div>
                  </div>
                </div>
              );

              if (isLocked) {
                return <div key={status.level}>{content}</div>;
              }

              return (
                <Link key={status.level} href={`/levels/${status.level}`}>
                  {content}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}