from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import json
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer
import requests # To call the Gemini API

# ------------ Load Models & Data --------------
print("Loading all models and data for RAG setup...")

try:
    with open('formatted_products.json', 'r', encoding='utf-8') as f:
        products_list = json.load(f)
        products_db = {p['product_id']: p for p in products_list}
    print("Product database loaded.")

    index = faiss.read_index('product_index.faiss')
    print("FAISS index loaded.")

    with open('product_map.json', 'r', encoding='utf-8') as f:
        product_map = json.load(f)
    print("Product map loaded.")

    model = SentenceTransformer('all-MiniLM-L6-v2')
    print("Sentence transformer model loaded.")

    print("Backend ready.")
except FileNotFoundError as e:
    print(f"ERROR: A required file was not found: {e.filename}")
    print("Please make sure you have run 'create_index.py' successfully before starting the server.")
    exit()


# ------------ API Setup ----------------------

app = FastAPI(title="Stacy AI RAG Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class UserQuery(BaseModel):
    query: str
    session_id: str

# ------------ RAG Core Functions -----------------
def is_mens_product(p):
    name = p.get("product_name", "").lower()
    category = p.get("category", "").lower()
    return (
        'men' in name or 'men' in category
    ) and not (
        'women' in name or 'women' in category or 'ladies' in name
    )

def retrieve_relevant_products(query: str, k: int = 5):
    query_embedding = model.encode([query]).astype('float32')
    query_lower = query.lower()

    if 'men' in query_lower:
        valid_ids = [
            p['product_id'] for p in products_list
            if is_mens_product(p)
            and any(kw in p['category'].lower() for kw in ['top', 'shirt', 't-shirt', 'tank'])
        ]
    elif 'women' in query_lower or 'ladies' in query_lower:
        valid_ids = [
            p['product_id'] for p in products_list
            if 'women' in p['product_name'].lower() or 'women' in p['category'].lower()
        ]
    else:
        valid_ids = [p['product_id'] for p in products_list]

    valid_indices = [i for i, pid in enumerate(product_map) if pid in valid_ids]

    if not valid_indices:
        return []

    subset_embeddings = np.array([index.reconstruct(i) for i in valid_indices]).astype('float32')

    temp_index = faiss.IndexFlatL2(subset_embeddings.shape[1])
    temp_index.add(subset_embeddings)

    distances, indices = temp_index.search(query_embedding, k)

    retrieved_products = []
    for i in indices[0]:
        if i < len(valid_indices):
            product_id = product_map[valid_indices[i]]
            if product_id in products_db:
                retrieved_products.append(products_db[product_id])

    return retrieved_products

def generate_llm_response(query: str, context_products: list):
    """
    Calls the Gemini API with the user's query and the retrieved product context.
    """
    # --- IMPORTANT: REPLACE THIS PLACEHOLDER WITH YOUR ACTUAL API KEY ---
    api_key = "AIzaSyDodapfDk7m8xQlGM_q3IOM0_TUsS6SImU" 

    if not api_key or api_key == "YOUR_API_KEY_HERE":
        print("\n\n!!! ERROR: API KEY NOT SET !!!")
        return "My connection to the AI is not configured correctly. Please check the backend server."

    context_str = "\n".join([
        f"- Product: {p['product_name']}, Price: ${p['original_price']:.2f}, Category: {p['category']}, Location: Aisle {p['aisle_location']}"
        for p in context_products
    ])

    prompt = f"""You are a friendly and helpful in-store shopping assistant named Stacy.
    Your goal is to answer the user's question based ONLY on the product information provided below.
    Do not make up information. If the answer is not in the provided context, say that you couldn't find the information.
    If you find multiple relevant items, you MUST mention them by their full and exact product name. Be conversational and concise.

    CONTEXT:
    {context_str}

    USER'S QUESTION:
    {query}

    ANSWER:
    """

    api_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key={api_key}"
    
    payload = {"contents": [{"parts": [{"text": prompt}]}]}
    
    try:
        response = requests.post(api_url, json=payload, headers={'Content-Type': 'application/json'})
        response.raise_for_status()
        result = response.json()
        answer = result.get('candidates', [{}])[0].get('content', {}).get('parts', [{}])[0].get('text', "Sorry, I had trouble generating a response.")
        return answer.strip()
    except requests.exceptions.RequestException as e:
        print(f"Error calling Gemini API: {e}")
        return "I'm having a bit of trouble connecting to my brain right now. Please try again in a moment."


# ------------ API Endpoint -----------------

@app.post("/ask")
async def ask_stacy(req: UserQuery):
    query_text = req.query.strip()
    if not query_text:
        raise HTTPException(status_code=400, detail="Query is required.")

    # 1. Retrieval: Already filters based on intent
    retrieved_products = retrieve_relevant_products(query_text)

    # 2. Generate LLM Response
    answer_text = generate_llm_response(query_text, retrieved_products)

    # 3. Return Products
    response_payload = {
        "answer": answer_text,
        "type": "products",
        "products": [{
            "name": p["product_name"],
            "imageUrl": p["product_image_url"],
            "originalPrice": p["original_price"],
            "discountedPrice": p["discounted_price"],
            "aisle_location": p["aisle_location"]
        } for p in retrieved_products]
    }

    return response_payload

# ------------ Run with Uvicorn -------------
if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
