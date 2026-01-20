"""
Lesson content loader and filtering utilities.
Provides functions to load lesson data and filter by question/lesson ID.
"""

import json
import os
from typing import Optional
from pathlib import Path


# Default path to the lessons JSON file
DEFAULT_LESSONS_PATH = os.getenv(
    "LESSONS_DATA_PATH",
    "../NEW_AIGeneratedData_json/final_merged_lessons_with_mcqs_16Jan 16, 2026_153124_randomized_16Jan_161140.json"
)


def load_lessons_data(path: Optional[str] = None) -> list[dict]:
    """Load lessons data from JSON file."""
    file_path = Path(path or DEFAULT_LESSONS_PATH)
    
    # Handle relative paths from the backend directory
    if not file_path.is_absolute():
        file_path = Path(__file__).parent / file_path
    
    if not file_path.exists():
        raise FileNotFoundError(f"Lessons data file not found: {file_path}")
    
    with open(file_path, "r", encoding="utf-8") as f:
        return json.load(f)


def get_lesson_by_id(lessons: list[dict], lesson_id: int) -> Optional[dict]:
    """Find a lesson by its ID."""
    for lesson in lessons:
        if lesson.get("id") == lesson_id:
            return lesson
    return None


def get_lesson_by_question_id(lessons: list[dict], question_id: int) -> Optional[dict]:
    """
    Find the lesson that contains a specific question ID.
    Questions are nested within lessons as lesson['questions'][i]['id'].
    """
    for lesson in lessons:
        questions = lesson.get("questions", [])
        for question in questions:
            if question.get("id") == question_id:
                return lesson
    return None


def get_question_by_id(lessons: list[dict], question_id: int) -> Optional[dict]:
    """Find a specific question by its ID across all lessons."""
    for lesson in lessons:
        questions = lesson.get("questions", [])
        for question in questions:
            if question.get("id") == question_id:
                return {
                    **question,
                    "lesson_id": lesson.get("id"),
                    "lesson_title": lesson.get("title"),
                    "lesson_topic": lesson.get("topic"),
                }
    return None


def format_lesson_context(lesson: dict) -> str:
    """
    Format a lesson's content for use as LLM context.
    Returns a concise string representation optimized for token efficiency.
    """
    parts = [
        f"# {lesson.get('title', 'Untitled Lesson')}",
        f"Topic: {lesson.get('topic', 'Unknown')}",
        f"Level: {lesson.get('level', 'N/A')}",
    ]
    
    # Add metadata if available
    metadata = lesson.get("metadata", {})
    if metadata.get("source_path"):
        parts.append(f"Source: {metadata['source_path']}")
    
    # Add all questions and answers as study material
    questions = lesson.get("questions", [])
    if questions:
        parts.append("\n## Key Concepts (Q&A):")
        for q in questions:
            parts.append(f"\nQ: {q.get('question', '')}")
            parts.append(f"A: {q.get('answer', '')}")
    
    return "\n".join(parts)


def get_filtered_context(lessons: list[dict], question_id: int) -> Optional[str]:
    """
    Get the filtered lesson context for a specific question ID.
    This is the main function to use for chatbot context retrieval.
    
    Returns the formatted lesson content or None if question not found.
    """
    lesson = get_lesson_by_question_id(lessons, question_id)
    if lesson:
        return format_lesson_context(lesson)
    return None
