import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const level = Number(searchParams.get("level"));
  const userId = searchParams.get("userId") || "";

  if (!Number.isFinite(level)) {
    return NextResponse.json({ error: "Invalid level" }, { status: 400 });
  }

  if (!userId) {
    return NextResponse.json({ exists: false, completed: false, locked: true });
  }

  // Check if level exists (has any lessons)
  const { data: lessons, error: lessonsErr } = await supabase
    .from("lessons")
    .select("id")
    .eq("level", level);

  if (lessonsErr) {
    return NextResponse.json({ error: lessonsErr.message }, { status: 500 });
  }

  const exists = (lessons ?? []).length > 0;

  if (!exists) {
    // Level doesn't exist yet - it's locked
    return NextResponse.json({ exists: false, completed: false, locked: true });
  }

  // Get all lesson IDs for this level
  const { data: allLessons, error: allLessonsErr } = await supabase
    .from("lessons")
    .select("id")
    .eq("level", level);

  if (allLessonsErr) {
    return NextResponse.json({ error: allLessonsErr.message }, { status: 500 });
  }

  const lessonIds = (allLessons ?? []).map((l) => l.id);
  if (lessonIds.length === 0) {
    return NextResponse.json({ exists: true, completed: false, locked: false });
  }

  // For each lesson, check if all questions are completed
  let allCompleted = true;
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

    const correctSet = new Set((correctRows ?? []).map((r) => r.question_id));
    const lessonCompleted = questionIds.every((qId) => correctSet.has(qId));

    if (!lessonCompleted) {
      allCompleted = false;
      break;
    }
  }

  return NextResponse.json({
    exists: true,
    completed: allCompleted,
    locked: false,
  });
}
