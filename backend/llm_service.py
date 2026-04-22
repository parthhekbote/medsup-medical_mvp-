import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(
    api_key=os.environ.get("GROQ_API_KEY"),
)

def generate_situation_summary(data_context: dict) -> str:
    """
    Generates a 'Situation Summary' based on the structured data provided.
    """
    prompt = f"""
    You are a Medical Supply Operational AI. 
    Analyze the following supply status data and provide a concise 'Situation Summary'.
    Focus on facts: What is the current status, risk level, and key numbers.
    
    Data:
    {data_context}
    
    Format: A brief paragraph (2-3 sentences).
    """
    
    completion = client.chat.completions.create(
        messages=[
            {"role": "system", "content": "You are a precise operational analyst."},
            {"role": "user", "content": prompt}
        ],
        model="llama3-8b-8192", # Or mixed model
        temperature=0.0,
    )
    return completion.choices[0].message.content

def generate_explainability_response(query: str, data_context: dict, deterministic_analysis: dict) -> str:
    """
    Generates the full explainable response for a user query.
    """
    prompt = f"""
    You are a Medical Supply Operational AI (AIP-Inspired).
    Your goal is to answer the user's question based strictly on the provided data and analysis.
    
    User Question: "{query}"
    
    Deterministic Analysis (Ground Truth):
    {deterministic_analysis}
    
    Raw Data Context:
    {data_context}
    
    Instructions:
    1. STRICTLY follow the response format:
       📌 Situation Summary
       📊 Data Observations
       ⚠️ Risk Assessment (Must match Deterministic Analysis)
       💡 Recommended Actions (Approval Required)
       🔍 Assumptions & Limitations
    2. Do NOT hallucinate data. Use only provided variables.
    3. If risk is High/Emergency, emphasize immediate review.
    """
    
    completion = client.chat.completions.create(
        messages=[
            {"role": "system", "content": "You are a helpful, explainable, safety-focused Medical Supply AI."},
            {"role": "user", "content": prompt}
        ],
        model="llama3-70b-8192", 
        temperature=0.1,
    )
    return completion.choices[0].message.content
