import csv
import json

csv_file = "walmart_batch_2.csv"

def parse_row(row):
    # Parse image URLs from the JSON list string in the CSV
    try:
        image_urls = json.loads(row[9]) if row[9].startswith("[") else []
    except Exception:
        image_urls = []
    # Pick the first image URL ONLY if it has '/seo/' and ends with '.jpeg'
    product_image_url = ""
    if image_urls:
        for url in image_urls:
            if "/seo/" in url and url.lower().endswith('.jpeg'):
                product_image_url = url
                break
        # Fallback to first image if no SEO .jpeg found
        if not product_image_url:
            product_image_url = image_urls[0]

    # Parse is_clearance boolean safely
    try:
        is_clearance = row[11].strip().lower() == "true" if isinstance(row[11], str) else bool(row[11])
    except Exception:
        is_clearance = False

    # Safely convert price fields to float or default to 0.0 if malformed
    try:
        original_price = float(row[2])
    except (ValueError, IndexError):
        original_price = 0.0

    discounted_price = original_price

    return {
        "product_id": row[3],
        "product_name": row[15],
        "product_image_url": product_image_url,
        "category": row[13],
        "aisle_location": "",  # Not provided in sample data; placeholder
        "original_price": original_price,
        "discounted_price": discounted_price,
        "discount_percentage": 0,  # Update if discount data is available
        "offer_type": "None",      # Update if offer type info is available
        "is_clearance": is_clearance
    }

products = []
with open(csv_file, newline='', encoding='utf-8') as f:
    reader = csv.reader(f)
    next(reader)  # Skip the header row
    for row in reader:
        products.append(parse_row(row))

with open("walmart1.json", "w", encoding="utf-8") as out:
    json.dump(products, out, indent=2)

print("Saved to walmart1.json")
