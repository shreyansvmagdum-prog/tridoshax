from chatbot_ollama import ask_llm

while True:
    q = input("You: ")
    print("Bot:", ask_llm(q))