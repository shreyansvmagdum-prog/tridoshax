import faiss
import numpy as np
import ollama
import pickle

INDEX_PATH = "app/rag/vector_store/faiss_index.bin"
TEXT_PATH = "app/rag/vector_store/texts.pkl"
EMBED_MODEL = "nomic-embed-text"

# Load FAISS index
index = faiss.read_index(INDEX_PATH)

# Load text chunks
with open(TEXT_PATH, "rb") as f:
    texts = pickle.load(f)


def embed_query(query):
    response = ollama.embeddings(
        model=EMBED_MODEL,
        prompt=query
    )
    return response["embedding"]


def retrieve_context(query, k=3):
    query_vec = np.array([embed_query(query)]).astype("float32")

    distances, indices = index.search(query_vec, k)

    results = [texts[i] for i in indices[0]]

    return "\n\n".join(results)