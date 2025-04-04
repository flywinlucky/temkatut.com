from flask import Flask, request, jsonify
import os
import json
import random
import string
from werkzeug.utils import secure_filename
from colorama import Fore, Style, init
from flask_cors import CORS

# Initialize colorama for colored output
init(autoreset=True)

app = Flask(__name__)

# Enable CORS for localhost and the production domain
CORS(app, resources={r"/*": {"origins": ["http://localhost", "https://gifthouse.pro"]}})

# Create a directory to store orders if it doesn't exist
ORDERS_DIR = "orders"
os.makedirs(ORDERS_DIR, exist_ok=True)

def generate_unique_id():
    """Generate a unique ID for each order."""
    return ''.join(random.choices(string.digits, k=8))

@app.route('/place-order', methods=['POST'])
def place_order():
    try:
        # Retrieve form data
        name = request.form.get("name")
        email = request.form.get("email")  # Retrieve email
        photo = request.files.get("photo")

        if not name or not email:
            return jsonify({"error": "Name and email are required"}), 400

        # Generate a unique ID for the order
        order_id = generate_unique_id()
        order_folder = os.path.join(ORDERS_DIR, f"GID_{order_id}")  # Prepend GID_ to folder name
        os.makedirs(order_folder, exist_ok=True)

        # Save JSON data
        photo_filename = secure_filename(photo.filename) if photo else None  # Get the photo filename
        order_data = {
            "id": order_id,
            "name": name,
            "delivery-email": email,
            "player-face-image": photo_filename  # Add photo filename to JSON
        }
        order_file_path = os.path.join(order_folder, f"{order_id}.json")  # Rename file to match folder ID
        with open(order_file_path, "w") as json_file:
            json.dump(order_data, json_file, indent=4)

        # Save the photo if provided
        if photo:
            photo_file_path = os.path.join(order_folder, photo_filename)
            photo.save(photo_file_path)

        # Log the order details with colors
        print(Fore.GREEN + f"New Order Received: ID {order_id}")
        print(Fore.CYAN + json.dumps(order_data, indent=4))
        if photo:
            print(Fore.YELLOW + f"Photo saved at: {photo_file_path}")

        # Respond with a success message
        return jsonify({"message": f"Order received successfully with ID {order_id}"}), 200
    except Exception as e:
        print(Fore.RED + f"Error: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Run the server on localhost and allow external access
    app.run(host='0.0.0.0', port=5000)
