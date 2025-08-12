import json
from sentence_transformers import SentenceTransformer
import faiss
import numpy as np

print("Starting the indexing process...")

# 1. Load the product data
print("Loading product data from formatted_products.json...")
with open('formatted_products.json', 'r', encoding='utf-8') as f:
    products = json.load(f)
print(f"Loaded {len(products)} products.")

# 2. Initialize the embedding model
# This model is excellent at understanding the meaning of text.
print("Loading the sentence transformer model (this may take a moment)...")
model = SentenceTransformer('all-MiniLM-L6-v2')
print("Model loaded.")

# 3. Create embeddings for each product
# We'll combine the name and category for better search context.
product_texts = [f"{p['product_name']} in {p['category']}" for p in products]

print("Creating embeddings for all products...")
embeddings = model.encode(product_texts, show_progress_bar=True)
print(f"Embeddings created with shape: {embeddings.shape}")

# Ensure embeddings are in the correct format (float32)
embeddings = np.array(embeddings).astype('float32')

# 4. Build the FAISS index
# FAISS is a library for efficient similarity search.
dimension = embeddings.shape[1]  # The size of our vectors
index = faiss.IndexFlatL2(dimension)
index.add(embeddings)
print(f"FAISS index built. Total entries: {index.ntotal}")

# 5. Save the index and a mapping file
print("Saving the FAISS index to 'product_index.faiss'...")
faiss.write_index(index, 'product_index.faiss')

# Create a simple list of product IDs in the same order as the embeddings
product_ids = [p['product_id'] for p in products]
print("Saving product ID mapping to 'product_map.json'...")
with open('product_map.json', 'w', encoding='utf-8') as f:
    json.dump(product_ids, f)

print("\nIndexing process complete!")
print("You now have 'product_index.faiss' and 'product_map.json' ready for your backend.")