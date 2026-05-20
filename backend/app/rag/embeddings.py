"""
RAG Embeddings Module
Generates embeddings using Gemini text-embedding-004.
Falls back to mock embeddings in demo mode.
"""

import os
import random
from typing import List


def get_embedding(text: str) -> List[float]:
    """
    Returns a 3072-dim embedding for the given text.
    Uses Gemini text-embedding-004 if available, else mock.
    """
    api_key = os.getenv("GEMINI_API_KEY", "")
    if not api_key:
        # Return consistent mock embedding (seeded by text hash for consistency)
        random.seed(hash(text) % (2**32))
        return [random.uniform(-1, 1) for _ in range(3072)]

    try:
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        result = genai.embed_content(
            model="models/gemini-embedding-2",
            content=text,
            task_type="retrieval_document",
        )
        return result["embedding"]
    except Exception as e:
        print(f"[Embeddings] Gemini error, using mock: {e}")
        random.seed(hash(text) % (2**32))
        return [random.uniform(-1, 1) for _ in range(3072)]


def get_query_embedding(text: str) -> List[float]:
    """Embedding for query (different task_type for retrieval)."""
    api_key = os.getenv("GEMINI_API_KEY", "")
    if not api_key:
        random.seed(hash(text) % (2**32))
        return [random.uniform(-1, 1) for _ in range(3072)]

    try:
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        result = genai.embed_content(
            model="models/gemini-embedding-2",
            content=text,
            task_type="retrieval_query",
        )
        return result["embedding"]
    except Exception as e:
        print(f"[Embeddings] Query embedding error, using mock: {e}")
        random.seed(hash(text) % (2**32))
        return [random.uniform(-1, 1) for _ in range(3072)]
