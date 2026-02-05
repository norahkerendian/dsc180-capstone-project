import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const level = Number(searchParams.get("level"));
  const topic = searchParams.get("topic") || "";
  const userId = searchParams.get("userId") || "";

  if (!Number.isFinite(level) || !topic) {
    return NextResponse.json({ error: "Invalid level or topic" }, { status: 400 });
  }

  if (!userId) {
    return NextResponse.json({ completed: false, inProgress: false, locked: false });
  }

  // Get all lesson IDs for this topic in this level
  const { data: lessons, error: lessonsErr } = await supabase
    .from("lessons")
    .select("id")
    .eq("level", level)
    .eq("topic", topic);

  if (lessonsErr) {
    return NextResponse.json({ error: lessonsErr.message }, { status: 500 });
  }

  const lessonIds = (lessons ?? []).map((l) => l.id);
  if (lessonIds.length === 0) {
    return NextResponse.json({ completed: false, inProgress: false, locked: false });
  }

  // Check completion status for all lessons in this topic
  let allCompleted = true;
  let anyStarted = false;

  for (const lessonId of lessonIds) {
    // Get all questions for this lesson
    const { data: lq, error: lqErr } = await supabase
      .from("lesson_questions")
      .select("question_id")
      .eq("lesson_id", lessonId);

    if (lqErr) continue;

    const questionIds = (lq ?? []).map((r) => r.question_id);
    if (questionIds.length === 0) continue; // No questions, skip

    // Check if all questions are correctly answered
    const { data: correctRows, error: cErr } = await supabase
      .from("user_responses")
      .select("question_id")
      .eq("lesson_id", lessonId)
      .eq("user_id", userId)
      .eq("is_correct", true);

    if (cErr) continue;

    // Check if user has ANY responses (correct or incorrect) for this lesson
    // This determines if the user has started the lesson
    const { data: anyResponses, error: anyErr } = await supabase
      .from("user_responses")
      .select("question_id")
      .eq("lesson_id", lessonId)
      .eq("user_id", userId)
      .limit(1);

    const hasStarted = !anyErr && anyResponses && anyResponses.length > 0;

    const correctSet = new Set((correctRows ?? []).map((r) => r.question_id));
    const lessonCompleted = questionIds.every((qId) => correctSet.has(qId));

    if (!lessonCompleted) {
      allCompleted = false;
    }
    if (hasStarted) {
      anyStarted = true;
    }
  }

  // Topic is in progress if:
  // 1. Not all lessons are completed (allCompleted = false)
  // 2. AND at least one lesson has been started (anyStarted = true)
  const inProgress = !allCompleted && anyStarted;

  return NextResponse.json({
    completed: allCompleted,
    inProgress: inProgress,
    locked: false,
  });
}
