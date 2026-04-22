import os
from groq import Groq
from dotenv import load_dotenv
from pathlib import Path

# Explicitly load from backend directory
env_path = Path(__file__).parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

api_key = os.environ.get("GROQ_API_KEY")

# Initialize client only if key exists, otherwise let it fail gracefully later or mock it
if api_key:
    client = Groq(api_key=api_key)
else:
    client = None

def analyze_query(query: str, inventory_data: list) -> dict:
    prompt = f"""
    You are an Operational AI Assistant (AIP-inspired) for a Medical Supply dashboard. 
    You help users manage inventory, track risks, and make business decisions.

    --------------------------------
    Context Data (Current Inventory):
    {inventory_data}
    --------------------------------

    User Query:
    "{query}"

    INSTRUCTIONS:
    1. If the user is just saying hello, asking how you are, or making small talk, respond conversationally and naturally. Do not use any strict reporting formats.
    2. If the user asks a specific question about the inventory, risks, or operations, answer using ONLY the Context Data provided.
    3. For operational questions, be concise, highlight critical/emergency risks, and provide actionable recommendations.
    4. Never invent numbers or facts not present in the Context Data.
    5. Use emojis strategically and sparingly—only at the beginning of a line or bullet point to quickly indicate status (e.g., 🚨 for Critical, ⚠️ for Warning, ✅ for Healthy, 📦 for Items). Do NOT scatter unnecessary emojis throughout the sentences. Your response should remain clean, highly professional, and easy to read.
    """
    
    try:
        if not client:
            return {"response": "⚠️ System Error: Groq API Key not configured in backend/.env"}

        completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are a helpful, professional, and explainable operational AI assistant."},
                {"role": "user", "content": prompt}
            ],
            model="llama-3.3-70b-versatile", 
            temperature=0.4,
        )
        return {"response": completion.choices[0].message.content}
    except Exception as e:
        return {"response": f"⚠️ AI Service Unavailable: {str(e)}"}
