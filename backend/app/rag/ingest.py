import faiss
import numpy as np
import ollama
from docx import Document
import pickle

# ---------- CONFIG ----------
DOC_PATH = "knowledge_base/TridoshaX_Knowledge_Base.docx"
INDEX_PATH = "app/rag/vector_store/faiss_index.bin"
TEXT_PATH = "app/rag/vector_store/texts.pkl"
EMBED_MODEL = "nomic-embed-text"


# ---------- LOAD DOCUMENT ----------
def load_docx(path):
    doc = Document(path)
    text = "\n".join([p.text for p in doc.paragraphs if p.text.strip()])
    return text


# ---------- SPLIT INTO CHUNKS ----------
def chunk_text(text, chunk_size=500):
    words = text.split()
    chunks = []

    for i in range(0, len(words), chunk_size):
        chunk = " ".join(words[i:i + chunk_size])
        chunks.append(chunk)

    return chunks


# ---------- CREATE EMBEDDINGS ----------
def embed_text(text):
    response = ollama.embeddings(
        model=EMBED_MODEL,
        prompt=text
    )
    return response["embedding"]


# ---------- MAIN ----------
def main():
    print("Loading document...")
    text = load_docx(DOC_PATH)

    print("Chunking text...")
    chunks = chunk_text(text)

    print(f"Total chunks: {len(chunks)}")

    print("Creating embeddings...")
    embeddings = [embed_text(chunk) for chunk in chunks]

    dim = len(embeddings[0])

    print("Building FAISS index...")
    index = faiss.IndexFlatL2(dim)
    index.add(np.array(embeddings).astype("float32"))

    faiss.write_index(index, INDEX_PATH)

    with open(TEXT_PATH, "wb") as f:
        pickle.dump(chunks, f)

    print("✅ Knowledge base indexed successfully!")


if __name__ == "__main__":
    main()