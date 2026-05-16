import requests
from app.rag.rag_retriever import retrieve_context

OLLAMA_URL = "http://localhost:11434/api/generate"


def ask_llm(question: str) -> str:
    context = retrieve_context(question)

    prompt = f"""
You are an Ayurvedic AI assistant for the TriDoshaX system.

Use the context below to answer the question.
If context is insufficient, use your knowledge but stay within Ayurveda.

Context:
{context}

Question:
{question}

Answer in a clear, helpful, safe manner.
"""

    payload = {
        "model": "phi3:mini",
        "prompt": prompt,
        "stream": False
    }

    response = requests.post(OLLAMA_URL, json=payload)
    result = response.json()

    return result["response"]