# backend/Chatbot/chatbot.py
import os
import random
import asyncio
from dotenv import load_dotenv
from rapidfuzz import process, fuzz
from pathlib import Path
env_path = Path(__file__).resolve().parent.parent / ".env"

# OPTIONAL: only keep spaCy if you really use it later
import spacy

# ---- Load env & optional NLP ----
load_dotenv(dotenv_path=env_path)

try:
    nlp = spacy.load("en_core_web_sm")
except Exception:
    nlp = None  # not required for current logic

# ---- Gemini setup ----
# Get a key from https://ai.google.dev/ and put it in backend/.env as GOOGLE_API_KEY
GEMINI_API_KEY = os.getenv("GOOGLE_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
print("Loaded GEMINI_MODEL =", GEMINI_MODEL)
print("Loaded GOOGLE_API_KEY =", GEMINI_API_KEY[:6] + "..." if GEMINI_API_KEY else "None")


# We'll import the SDK lazily inside the function so your app can boot
# even if the package isn't installed (helpful during setup).
def _ensure_gemini():
    if not GEMINI_API_KEY:
        raise RuntimeError("GOOGLE_API_KEY is missing in your environment (.env).")
    try:
        import google.generativeai as genai  # type: ignore
    except ImportError:
        raise RuntimeError(
            "google-generativeai is not installed. Run: pip install google-generativeai"
        )
    genai.configure(api_key=GEMINI_API_KEY)
    return genai

# ---- Utility: read topics & blog links ----
def read_topics_from_file(file_path: str):
    with open(file_path, 'r', encoding='utf-8') as f:
        topics = [line.strip().lower() for line in f if line.strip()]
    return topics

def read_blog_links_from_file(file_path: str):
    blogs = {}
    with open(file_path, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if not line or '|' not in line:
                continue
            topic, links = line.split('|', 1)
            blogs[topic.strip().lower()] = [
                link.strip() for link in links.split(',') if link.strip()
            ]
    return blogs

# ---- Spelling correction & topic detection ----
def correct_spelling(question: str, topics: list[str]) -> str:
    # Very lightweight word-level correction against topic vocabulary
    words = question.split()
    corrected = []
    for w in words:
        match = process.extractOne(w, topics, scorer=fuzz.ratio)
        if match and match[1] > 60:
            corrected.append(match[0])
        else:
            corrected.append(w)
    return ' '.join(corrected)

def get_related_topic(question: str, topics: list[str]) -> str | None:
    q = question.lower()
    for t in topics:
        if t in q:
            return t
    return None

def select_random_blog_link(topic: str | None, blogs: dict[str, list[str]]) -> str | None:
    if topic and topic in blogs and blogs[topic]:
        return random.choice(blogs[topic])
    return None

# ---- Load vocab files (relative to this file) ----
BASE_DIR = os.path.dirname(__file__)
topics_file_path = os.path.join(BASE_DIR, 'topics.txt')
blogs_file_path = os.path.join(BASE_DIR, 'blogs.txt')

TOPICS = read_topics_from_file(topics_file_path)
BLOGS = read_blog_links_from_file(blogs_file_path)

# ---- Gemini call helpers ----
def _gemini_generate_sync(prompt: str) -> str:
    """Synchronous call to Gemini; we’ll wrap it in a thread for asyncio compatibility."""
    genai = _ensure_gemini()
    model = genai.GenerativeModel(GEMINI_MODEL)
    # You can add a system style by prefixing your prompt if needed.
    resp = model.generate_content(prompt)
    # Safety: sometimes there’s no .text
    text = getattr(resp, "text", None)
    if not text:
        return "Sorry, I couldn’t generate a reply right now."
    return text

async def gemini_generate(prompt: str) -> str:
    # Run sync model call in a thread so your Flask route can await it
    return await asyncio.to_thread(_gemini_generate_sync, prompt)

# ---- Public function used by Flask route ----
async def chatbot_response(question: str) -> dict:
    """
    Main entry point called by your Flask route.
    Returns: {"response": "<text>"} always (never raises).
    """
    try:
        # 1) Clean/correct input
        corrected_question = correct_spelling(question or "", TOPICS)

        # 2) Try to detect a known topic
        related_topic = get_related_topic(corrected_question, TOPICS)

        # 3) Build a friendly prompt for Gemini
        if related_topic:
            blog_link = select_random_blog_link(related_topic, BLOGS)
            system_instructions = (
                "You are a supportive mental health assistant. "
                "Be empathetic, concise, and offer practical, safe suggestions."
            )
            user_prompt = (
                f"{system_instructions}\n\n"
                f"User question (spell-corrected): {corrected_question}\n"
                f"Detected topic: {related_topic}\n"
                f"If relevant, incorporate evidence-based advice. "
                f"Do NOT provide medical diagnosis. "
                f"If you give resources, limit to a couple of links.\n"
            )
            reply = await gemini_generate(user_prompt)

            # 4) Append a relevant blog link if we have one
            if blog_link:
                reply = f"{reply}\n\nYou might also find this helpful: {blog_link}"

            return {"response": reply}
        else:
            # Topic not recognized → still help the user, but indicate scope
            fallback_prompt = (
                "You are a supportive mental health assistant. "
                "The user asked a question that may be outside the known topic list. "
                "Provide a kind, high-level response, then invite them to try related topics "
                "like stress, anxiety, depression, sleep, mindfulness, breathing exercises."
                f"\n\nUser question: {corrected_question}"
            )
            reply = await gemini_generate(fallback_prompt)
            return {"response": reply or "It seems unrelated to our mental health topics. Could you rephrase?"}

    except Exception as e:
        print("Chatbot error:", e)
        # Never crash the API; return a safe message
        return {
            "response": "The chatbot service is unavailable right now. Please try again later.",
            "error": str(e)
        }
