

import os
import re
from pathlib import Path
from typing import List, Dict

DOCUMENTS_DIR = Path(__file__).parent.parent.parent / "documents"
CHUNK_SIZE = 500
CHUNK_OVERLAP = 80

def load_documents(docs_dir: Path) -> List[Dict]:

    docs = []
    for ext in ("*.txt", "*.md"):
        for path in docs_dir.glob(ext):
            text = path.read_text(encoding="utf-8", errors="ignore")
            docs.append({"filename": path.name, "text": text})
    print(f"[Ingest] Loaded {len(docs)} documents from {docs_dir}")
    return docs

def chunk_text(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> List[str]:

    paragraphs = re.split(r"\n{2,}", text.strip())
    chunks = []
    current = ""

    for para in paragraphs:
        para = para.strip()
        if not para:
            continue
        if len(current) + len(para) <= chunk_size:
            current += ("\n\n" if current else "") + para
        else:
            if current:
                chunks.append(current)

                current = current[-overlap:] + "\n\n" + para if overlap else para
            else:

                for i in range(0, len(para), chunk_size - overlap):
                    chunks.append(para[i : i + chunk_size])
                current = ""

    if current:
        chunks.append(current)

    return chunks

def ingest_to_pinecone(docs_dir: Path = DOCUMENTS_DIR):
    pinecone_key = os.getenv("PINECONE_API_KEY", "")
    index_name = os.getenv("PINECONE_INDEX", "mediflow")

    if not pinecone_key:
        print("[Ingest] Missing PINECONE_API_KEY — skipping real ingest.")
        return

    try:
        from sentence_transformers import SentenceTransformer
        _model = SentenceTransformer("all-MiniLM-L6-v2")
    except ImportError:
        print("[Ingest] Missing sentence-transformers package. Skipping.")
        return

    from pinecone import Pinecone, ServerlessSpec

    pc = Pinecone(api_key=pinecone_key)

    existing = [i.name for i in pc.list_indexes()]
    if index_name not in existing:
        pc.create_index(
            name=index_name,
            dimension=384,
            metric="cosine",
            spec=ServerlessSpec(cloud="aws", region="us-east-1"),
        )
        print(f"[Ingest] Created Pinecone index: {index_name}")

    index = pc.Index(index_name)
    documents = load_documents(docs_dir)

    vectors = []
    for doc in documents:
        chunks = chunk_text(doc["text"])
        print(f"[Ingest] {doc['filename']}: {len(chunks)} chunks")

        for i, chunk in enumerate(chunks):
            embedding = _model.encode(chunk).tolist()
            vectors.append({
                "id": f"{doc['filename']}_{i}",
                "values": embedding,
                "metadata": {
                    "text": chunk,
                    "source": doc["filename"],
                    "chunk_index": i,
                },
            })

    batch_size = 100
    for i in range(0, len(vectors), batch_size):
        index.upsert(vectors=vectors[i : i + batch_size])
        print(f"[Ingest] Upserted batch {i // batch_size + 1}")

    print(f"[Ingest] Done! {len(vectors)} vectors stored in Pinecone index '{index_name}'")

if __name__ == "__main__":
    from dotenv import load_dotenv
    load_dotenv()
    ingest_to_pinecone()
