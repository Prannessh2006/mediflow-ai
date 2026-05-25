import os
import sys

def download_model():
    try:
        from sentence_transformers import SentenceTransformer
        print("Downloading all-MiniLM-L6-v2 model weights...")
        # This will download and cache the model in the huggingface cache directory
        model = SentenceTransformer("all-MiniLM-L6-v2")
        print("Model downloaded successfully!")
    except ImportError:
        print("sentence-transformers not installed. Skipping download.")
        sys.exit(1)
    except Exception as e:
        print(f"Error downloading model: {e}")
        sys.exit(1)

if __name__ == "__main__":
    download_model()
