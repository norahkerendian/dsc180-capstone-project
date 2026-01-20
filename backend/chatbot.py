"""
OpenAI client wrapper for chatbot functionality.
Handles API calls and response formatting.
"""

import os
from typing import Optional
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()


def get_openai_client() -> OpenAI:
    """Get configured OpenAI client."""
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key or api_key.startswith("sk-your"):
        raise ValueError(
            "OPENAI_API_KEY not configured. "
            "Copy .env.example to .env and add your API key."
        )
    return OpenAI(api_key=api_key)


def get_model() -> str:
    """Get the configured model name."""
    return os.getenv("OPENAI_MODEL", "gpt-5-mini")


# System prompt for the chatbot
SYSTEM_PROMPT = """You are a helpful Data Science tutor assistant. Your role is to help students understand concepts from their coursework.

Guidelines:
- Answer questions based ONLY on the provided lesson content
- Be concise but thorough in your explanations
- If asked something outside the lesson scope, politely explain that you can only help with the current lesson topic
- Use examples when helpful to clarify concepts
- Encourage the student and provide positive reinforcement
- If the student seems confused, try explaining the concept differently

If no lesson context is provided, let the student know you need more information about which lesson they're studying."""


def chat_with_context(
    user_message: str,
    lesson_context: Optional[str] = None,
    conversation_history: Optional[list[dict]] = None,
) -> str:
    """
    Send a message to the chatbot with optional lesson context.
    
    Args:
        user_message: The user's question or message
        lesson_context: Formatted lesson content to use as context
        conversation_history: Previous messages for multi-turn conversation
    
    Returns:
        The assistant's response text
    """
    client = get_openai_client()
    model = get_model()
    
    messages = []
    
    # Build system prompt with lesson context
    system_content = SYSTEM_PROMPT
    if lesson_context:
        system_content += f"\n\n--- LESSON CONTENT ---\n{lesson_context}\n--- END LESSON CONTENT ---"
    
    messages.append({"role": "system", "content": system_content})
    
    # Add conversation history if provided
    if conversation_history:
        messages.extend(conversation_history)
    
    # Add the current user message
    messages.append({"role": "user", "content": user_message})
    
    # Call OpenAI API
    response = client.chat.completions.create(
        model=model,
        messages=messages,
        temperature=0.7,
        max_tokens=500,
    )
    
    return response.choices[0].message.content


def estimate_tokens(text: str) -> int:
    """
    Rough estimate of token count for a text string.
    Uses the ~4 chars per token approximation.
    """
    return len(text) // 4
