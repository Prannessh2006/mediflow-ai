

import os
import random
from typing import List

try:
    from sentence_transformers import SentenceTransformer
    _model = SentenceTransformer("all-MiniLM-L6-v2")
except ImportError:
    _model = None
    print("[Embeddings] Warning: sentence-transformers not installed. Using mock embeddings.")

def get_embedding(text: str) -> List[float]:
    if _model is not None:
        return _model.encode(text).tolist()
    
    random.seed(hash(text) % (2**32))
    return [random.uniform(-1, 1) for _ in range(384)]

def get_query_embedding(text: str) -> List[float]:
    if _model is not None:
        return _model.encode(text).tolist()
    
    random.seed(hash(text) % (2**32))
    return [random.uniform(-1, 1) for _ in range(384)]
