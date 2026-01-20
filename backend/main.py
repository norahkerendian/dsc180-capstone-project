"""
FastAPI backend for the Data Science Chatbot.
Provides endpoints for chatbot interactions with filtered lesson context.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import os

from lessons import (
    load_lessons_data,
    get_filtered_context,
    get_question_by_id,
    get_lesson_by_id,
    format_lesson_context,
)
from chatbot import chat_with_context, estimate_tokens

# Load lessons data at startup
try:
    LESSONS_DATA = load_lessons_data()
    print(f"✓ Loaded {len(LESSONS_DATA)} lessons")
except FileNotFoundError as e:
    print(f"⚠ Warning: {e}")
    LESSONS_DATA = []

# Initialize FastAPI app
app = FastAPI(
    title="Data Science Chatbot API",
    description="AI-powered chatbot that answers questions based on filtered lesson content",
    version="1.0.0",
)

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Next.js dev server
        "http://127.0.0.1:3000",
        os.getenv("FRONTEND_URL", ""),
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request/Response models
class ChatRequest(BaseModel):
    """Request body for chat endpoint."""
    message: str
    question_id: Optional[int] = None  # Filter by specific question
    lesson_id: Optional[int] = None    # Or filter by lesson
    conversation_history: Optional[list[dict]] = None


class ChatResponse(BaseModel):
    """Response body for chat endpoint."""
    response: str
    lesson_title: Optional[str] = None
    token_estimate: int


class QuestionInfo(BaseModel):
    """Question details response."""
    id: int
    question: str
    answer: str
    difficulty: Optional[int] = None
    category: Optional[str] = None
    lesson_id: int
    lesson_title: str
    lesson_topic: str


# API Endpoints
@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "status": "ok",
        "message": "Data Science Chatbot API is running",
        "lessons_loaded": len(LESSONS_DATA),
    }


@app.get("/lessons")
async def list_lessons():
    """List all available lessons (without full question content)."""
    return [
        {
            "id": lesson.get("id"),
            "title": lesson.get("title"),
            "topic": lesson.get("topic"),
            "level": lesson.get("level"),
            "question_count": len(lesson.get("questions", [])),
        }
        for lesson in LESSONS_DATA
    ]


@app.get("/lessons/{lesson_id}")
async def get_lesson(lesson_id: int):
    """Get a specific lesson by ID."""
    lesson = get_lesson_by_id(LESSONS_DATA, lesson_id)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return lesson


@app.get("/questions/{question_id}", response_model=QuestionInfo)
async def get_question(question_id: int):
    """Get a specific question by ID with its lesson info."""
    question = get_question_by_id(LESSONS_DATA, question_id)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    return question


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Chat with the AI tutor.
    
    Provide either question_id or lesson_id to filter the context.
    The AI will only have access to the relevant lesson content.
    """
    lesson_context = None
    lesson_title = None
    
    # Get filtered context based on question_id or lesson_id
    if request.question_id:
        lesson_context = get_filtered_context(LESSONS_DATA, request.question_id)
        if lesson_context:
            # Extract title from context (first line after #)
            lines = lesson_context.split("\n")
            if lines and lines[0].startswith("#"):
                lesson_title = lines[0].lstrip("# ")
    elif request.lesson_id:
        lesson = get_lesson_by_id(LESSONS_DATA, request.lesson_id)
        if lesson:
            lesson_context = format_lesson_context(lesson)
            lesson_title = lesson.get("title")
    
    if not lesson_context and (request.question_id or request.lesson_id):
        raise HTTPException(
            status_code=404,
            detail="Lesson/Question not found. Please provide a valid ID."
        )
    
    try:
        response_text = chat_with_context(
            user_message=request.message,
            lesson_context=lesson_context,
            conversation_history=request.conversation_history,
        )
        
        # Estimate tokens used for context
        context_tokens = estimate_tokens(lesson_context) if lesson_context else 0
        
        return ChatResponse(
            response=response_text,
            lesson_title=lesson_title,
            token_estimate=context_tokens,
        )
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error communicating with OpenAI: {str(e)}"
        )


@app.get("/context/{question_id}")
async def get_context_preview(question_id: int):
    """
    Preview the filtered context that would be sent to the LLM for a question.
    Useful for debugging and understanding token usage.
    """
    context = get_filtered_context(LESSONS_DATA, question_id)
    if not context:
        raise HTTPException(status_code=404, detail="Question not found")
    
    return {
        "question_id": question_id,
        "context": context,
        "token_estimate": estimate_tokens(context),
        "char_count": len(context),
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
