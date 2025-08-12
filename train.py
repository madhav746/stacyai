import json
import csv
import random

# Load products.json file (ensure you have 'formatted_products.json' in the same directory)
with open("formatted_products.json", "r", encoding="utf-8") as f:
    products = json.load(f)

# Define intents
INTENTS = [
    "find_product_location",
    "check_price_offer",
    "check_stock",
    "check_clearance_section",
    "check_variations",
    "get_return_policy",
    "get_price_match_policy",
    "get_payment_options",
    "check_restock_status",
    "get_delivery_options",
    "get_warranty_info"
]

# Templates for generating questions per intent around a product
TEMPLATES = {
    "find_product_location": [
        "Where can I find {name}?",
        "Which aisle is {name} in?",
        "Where is the {category} section?",
        "Do you have {tags} here?",
        "Where can I get some {category}?"
    ],
    "check_price_offer": [
        "Is the {name} on sale right now?",
        "What is the price of {name}?",
        "Are there any discounts on {tags}?",
        "How much does {name} cost?",
        "Is there a promotion for {name}?"
    ],
    "check_stock": [
        "Is {name} in stock?",
        "Do you have {tags} available?",
        "How many {category} do you have?",
        "Can I still buy {name} today?",
        "Are there {tags} left on the shelf?"
    ],
    "check_clearance_section": [
        "Is there a clearance section in the store?",
        "Where can I find clearance items?",
        "Do you have a clearance aisle?",
        "Can you point me to clearance deals?",
        "Where is the section for clearance products?"
    ],
    "check_variations": [
        "Do you have {name} in a different size?",
        "Are there other colors available for {name}?",
        "Do you carry different models of {name}?",
        "Can I get {name} in other sizes or colors?",
        "Are there alternatives to {name}?"
    ],
    "get_return_policy": [
        "What is your return policy?",
        "Can I return an opened item?",
        "Do I need a receipt to return?",
        "How long is the return window?",
        "Can I return without the original box?"
    ],
    "get_price_match_policy": [
        "Do you price match with Amazon?",
        "Is price matching available with other stores?",
        "Can I get a price match for this item?",
        "What’s your policy on price matching?",
        "Do you match online prices?"
    ],
    "get_payment_options": [
        "Can I use a gift card here?",
        "Do you accept split payments?",
        "Are student or military discounts offered?",
        "Do you have rewards or cashback?",
        "Can I pay with multiple cards?"
    ],
    "check_restock_status": [
        "When will {name} be restocked?",
        "Is {name} coming back in stock soon?",
        "When do you expect more {category}?",
        "Can you tell me the restock date for {name}?",
        "Is there a shipment incoming for {name}?"
    ],
    "get_delivery_options": [
        "Can I order {name} online and pick it up here?",
        "Do you deliver {name} to my home?",
        "Is home delivery available for {name}?",
        "Can I track my order for {name}?",
        "Do you provide shipping for {name}?"
    ],
    "get_warranty_info": [
        "Is there a warranty for {name}?",
        "Does {name} come with a warranty?",
        "How long is the warranty on {name}?",
        "Can I get extended warranty on {name}?",
        "What is the warranty coverage for {name}?"
    ]
}

# Generic non-product specific queries for global intents (no product_id)
GENERIC_QUESTIONS = {
    "check_clearance_section": [
        "Is there a clearance section in this store?",
        "Where is the clearance area?",
        "Can you tell me about store clearance deals?"
    ],
    "get_return_policy": [
        "What is your return policy?",
        "Can I return items without receipts?",
        "How does your return window work?"
    ],
    "get_price_match_policy": [
        "Do you price match other retailers?",
        "What's your price matching policy?",
        "Is price matching allowed?"
    ],
    "get_payment_options": [
        "Can I pay with a gift card?",
        "Do you accept multiple payment methods?",
        "Are there special discounts like military or student?"
    ],
}

# Function to generate varied question texts with some random phrasing tweaks
def generate_question(template, product):
    q = template
    q = q.replace("{name}", product["product_name"])
    q = q.replace("{category}", product["category"])
    # Pick a few tags (max 3) to insert naturally, comma separated
    if product.get("tags"):
        few_tags = random.sample(product["tags"], min(3, len(product["tags"])))
        q = q.replace("{tags}", ", ".join(few_tags))
    else:
        q = q.replace("{tags}", product["category"])
    return q

# For each product, generate multiple examples per intent using different templates
def generate_training_data(products, num_per_intent=10):
    data = []
    for product in products:
        for intent, templates in TEMPLATES.items():
            # Use generic questions for global intents without product context
            if intent in GENERIC_QUESTIONS:
                for generic_q in GENERIC_QUESTIONS[intent]:
                    data.append( (generic_q, intent, "") )
                continue

            # Generate `num_per_intent` questions using random templates
            sampled_templates = random.sample(templates, min(num_per_intent, len(templates)))
            for template in sampled_templates:
                question = generate_question(template, product)
                data.append( (question, intent, product["product_id"]) )
    return data

# To reduce size roughly to ~10,000, limit to first ~70 products (can increase as needed)
num_products_to_use = min(70, len(products))
training_samples = generate_training_data(products[:num_products_to_use], num_per_intent=5)

# Add some generic policy questions to make dataset robust
for intent, questions in GENERIC_QUESTIONS.items():
    for q in questions:
        training_samples.append( (q, intent, "") )

# Shuffle for randomness
random.shuffle(training_samples)

# Write to CSV
with open("training_data.csv", "w", newline="", encoding="utf-8") as csvfile:
    writer = csv.writer(csvfile)
    writer.writerow(["query", "intent", "product_id"])  # header
    for row in training_samples:
        writer.writerow(row)

print(f"Generated {len(training_samples)} training samples and saved to training_data.csv")
